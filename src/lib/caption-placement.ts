import sharp from "sharp";

// Picks which corner of the home hero photo the name caption should sit in,
// so a red caption doesn't land on top of e.g. a red pair of pants and
// disappear. Runs server-side against a downsized copy of the featured
// photo - cheap enough to do per-request, but cached per photo id since the
// featured photo rarely changes between requests on a warm server instance.

export type CaptionCorner = "top-left" | "top-right" | "bottom-left" | "bottom-right";

const DEFAULT_CORNER: CaptionCorner = "bottom-left";

// Keep in sync with --name-red in globals.css - this is the color the
// caption text actually renders in, so it's what we're checking for clashes
// against.
const TEXT_COLOR = { r: 0xda, g: 0x3e, b: 0x2c };

// Fraction of the image's width/height each corner region covers. Roughly
// matches the footprint the caption actually occupies once placed.
const CORNER_FRACTION = { x: 0.4, y: 0.32 };

const CORNERS: { key: CaptionCorner; x0: number; y0: number }[] = [
  { key: "top-left", x0: 0, y0: 0 },
  { key: "top-right", x0: 1 - CORNER_FRACTION.x, y0: 0 },
  { key: "bottom-left", x0: 0, y0: 1 - CORNER_FRACTION.y },
  { key: "bottom-right", x0: 1 - CORNER_FRACTION.x, y0: 1 - CORNER_FRACTION.y },
];

// Small in-memory cache so a warm server instance doesn't re-download and
// re-analyze the same featured photo on every home page hit. Keyed by photo
// id, so it self-invalidates whenever the admin features a different photo.
const cornerCache = new Map<string, CaptionCorner>();

function srgbToLinear(channel: number) {
  const c = channel / 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function relativeLuminance(r: number, g: number, b: number) {
  return 0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b);
}

// WCAG-style contrast ratio, 1 (identical) to 21 (black on white).
function contrastRatio(a: { r: number; g: number; b: number }, b: { r: number; g: number; b: number }) {
  const lA = relativeLuminance(a.r, a.g, a.b) + 0.05;
  const lB = relativeLuminance(b.r, b.g, b.b) + 0.05;
  return lA > lB ? lA / lB : lB / lA;
}

function rgbToHsl(r: number, g: number, b: number) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  if (d === 0) return { h: 0, s: 0, l };

  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h: number;
  switch (max) {
    case r:
      h = (g - b) / d + (g < b ? 6 : 0);
      break;
    case g:
      h = (b - r) / d + 2;
      break;
    default:
      h = (r - g) / d + 4;
  }
  return { h: h * 60, s, l };
}

function hueDistance(a: number, b: number) {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
}

async function computeCorner(imageUrl: string): Promise<CaptionCorner> {
  const res = await fetch(imageUrl);
  if (!res.ok) return DEFAULT_CORNER;
  const buffer = Buffer.from(await res.arrayBuffer());

  // Downsizing first means the per-corner loop below is just a few hundred
  // pixels of work - only the region averages/variance matter, not the
  // actual pixels.
  const GRID = 60;
  const { data, info } = await sharp(buffer)
    .resize(GRID, GRID, { fit: "fill" })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  const textHsl = rgbToHsl(TEXT_COLOR.r, TEXT_COLOR.g, TEXT_COLOR.b);

  let best = DEFAULT_CORNER;
  let bestScore = -Infinity;

  for (const corner of CORNERS) {
    const x0 = Math.floor(corner.x0 * width);
    const x1 = Math.ceil((corner.x0 + CORNER_FRACTION.x) * width);
    const y0 = Math.floor(corner.y0 * height);
    const y1 = Math.ceil((corner.y0 + CORNER_FRACTION.y) * height);

    let sumR = 0;
    let sumG = 0;
    let sumB = 0;
    const luminances: number[] = [];
    for (let y = y0; y < y1; y++) {
      for (let x = x0; x < x1; x++) {
        const idx = (y * width + x) * channels;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        sumR += r;
        sumG += g;
        sumB += b;
        luminances.push(relativeLuminance(r, g, b));
      }
    }
    if (luminances.length === 0) continue;

    const count = luminances.length;
    const avg = { r: sumR / count, g: sumG / count, b: sumB / count };
    const meanLum = luminances.reduce((a, l) => a + l, 0) / count;
    const variance = luminances.reduce((a, l) => a + (l - meanLum) ** 2, 0) / count;
    // How "busy"/detailed this corner is - a flat sky or wall scores near 0,
    // a corner full of edges (fabric folds, signage, a subject) scores high.
    const busyness = Math.sqrt(variance);

    const contrast = contrastRatio(avg, TEXT_COLOR);
    const avgHsl = rgbToHsl(avg.r, avg.g, avg.b);
    // A same-hue backdrop (red text over red pants) can still pass a
    // luminance contrast check while being visually unreadable, so it gets
    // its own penalty independent of contrast ratio.
    const isHueClash = avgHsl.s > 0.18 && hueDistance(avgHsl.h, textHsl.h) < 45;

    let score = contrast - busyness * 6;
    if (isHueClash) score -= 4;
    // Light thumb on the scale toward the original bottom-left placement so
    // near-identical scores don't cause the layout to jitter between corners
    // across visually similar photos.
    if (corner.key === DEFAULT_CORNER) score += 0.15;

    if (score > bestScore) {
      bestScore = score;
      best = corner.key;
    }
  }

  return best;
}

export async function pickCaptionCorner(photo: { id: string; url: string }): Promise<CaptionCorner> {
  const cached = cornerCache.get(photo.id);
  if (cached) return cached;

  try {
    const corner = await computeCorner(photo.url);
    cornerCache.set(photo.id, corner);
    return corner;
  } catch {
    // Any fetch/decode failure just falls back to the original placement -
    // never let this block the page from rendering.
    return DEFAULT_CORNER;
  }
}

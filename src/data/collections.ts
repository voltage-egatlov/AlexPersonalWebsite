export type Collection = {
  slug: string;
  title: string;
  fileNo: string;
  photos: string[];
};

const PLACEHOLDER_COUNT = 20;
const PHOTOS_PER_COLLECTION = 4;

function placeholder(n: number) {
  const wrapped = ((n - 1) % PLACEHOLDER_COUNT) + 1;
  return `/placeholders/placeholder-${String(wrapped).padStart(2, "0")}.jpg`;
}

function slugify(title: string) {
  return title
    .toLowerCase()
    .replace(/'/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const TITLES = [
  "SevenSevenSeven",
  "You Can't Make Old Friends",
  "Two Things Can Be True at Once",
  "Out of Service(s)",
  "Heatstroke",
  "No Rest for the Archivist",
  "Junk Drawer",
  "Valedictorian",
  "Sanctuary",
];

export const collections: Collection[] = TITLES.map((title, i) => ({
  slug: slugify(title),
  title,
  fileNo: String(i + 1).padStart(3, "0"),
  photos: Array.from({ length: PHOTOS_PER_COLLECTION }, (_, j) =>
    placeholder(i * PHOTOS_PER_COLLECTION + j + 1)
  ),
}));

export function getCollection(slug: string) {
  return collections.find((c) => c.slug === slug);
}

"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";

export type GalleryPhoto = {
  url: string;
  // Null for photos uploaded before dimension tracking existed.
  width: number | null;
  height: number | null;
};

// Justified row layout (the classic Flickr-style gallery): pack photos into
// rows at a target height, then scale each finished row so its photos -
// still each at their own true aspect ratio, never cropped or stretched
// against themselves - collectively fill the container's exact width.
const GAP = 6;
const DEFAULT_ASPECT = 4 / 3;
// Don't stretch a sparse trailing row (e.g. a single photo) to fill the
// whole width - only justify it if it's already most of the way there.
const LAST_ROW_JUSTIFY_THRESHOLD = 0.5;
const LAST_ROW_MAX_SCALE = 1.35;

function targetRowHeight(containerWidth: number) {
  if (containerWidth < 480) return 130;
  if (containerWidth < 900) return 190;
  return 260;
}

type RowItem = GalleryPhoto & { aspect: number; index: number };
type Row = { height: number; items: RowItem[] };

function layoutRows(photos: GalleryPhoto[], containerWidth: number): Row[] {
  if (containerWidth <= 0) return [];
  const rowHeight = targetRowHeight(containerWidth);

  const rows: Row[] = [];
  let current: RowItem[] = [];
  let aspectSum = 0;

  photos.forEach((photo, index) => {
    const aspect =
      photo.width && photo.height ? photo.width / photo.height : DEFAULT_ASPECT;
    current.push({ ...photo, aspect, index });
    aspectSum += aspect;

    const naturalWidth = aspectSum * rowHeight + (current.length - 1) * GAP;
    if (naturalWidth >= containerWidth) {
      const availableWidth = containerWidth - (current.length - 1) * GAP;
      rows.push({ height: availableWidth / aspectSum, items: current });
      current = [];
      aspectSum = 0;
    }
  });

  if (current.length > 0) {
    const availableWidth = containerWidth - (current.length - 1) * GAP;
    const naturalWidth = aspectSum * rowHeight;
    const fillsEnough = naturalWidth / availableWidth > LAST_ROW_JUSTIFY_THRESHOLD;
    const height = fillsEnough
      ? Math.min(availableWidth / aspectSum, rowHeight * LAST_ROW_MAX_SCALE)
      : rowHeight;
    rows.push({ height, items: current });
  }

  return rows;
}

export default function Gallery({
  photos,
  title,
}: {
  photos: GalleryPhoto[];
  title: string;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const lightboxRef = useRef<HTMLDivElement>(null);
  const lastTriggerRef = useRef<HTMLButtonElement | null>(null);

  const gridRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width;
      if (width) setContainerWidth(width);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const rows = useMemo(
    () => layoutRows(photos, containerWidth),
    [photos, containerWidth]
  );

  const close = useCallback(() => setOpenIndex(null), []);
  const prev = useCallback(
    () =>
      setOpenIndex((i) => (i === null ? i : (i - 1 + photos.length) % photos.length)),
    [photos.length]
  );
  const next = useCallback(
    () => setOpenIndex((i) => (i === null ? i : (i + 1) % photos.length)),
    [photos.length]
  );

  const openAt = useCallback((i: number, e: React.MouseEvent<HTMLButtonElement>) => {
    lastTriggerRef.current = e.currentTarget;
    setOpenIndex(i);
  }, []);

  useEffect(() => {
    if (openIndex === null) return;

    closeButtonRef.current?.focus();

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
      if (e.key === "Tab") {
        const focusable = lightboxRef.current?.querySelectorAll<HTMLElement>(
          "button, [href], [tabindex]:not([tabindex='-1'])"
        );
        if (!focusable || focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openIndex, close, prev, next]);

  useEffect(() => {
    if (openIndex === null) {
      lastTriggerRef.current?.focus();
      lastTriggerRef.current = null;
    }
  }, [openIndex]);

  return (
    <>
      <div ref={gridRef} className="tile-grid" style={{ gap: GAP }}>
        {rows.map((row, ri) => (
          <div key={ri} className="tile-row" style={{ gap: GAP }}>
            {row.items.map((item) => (
              <button
                key={`${item.url}-${item.index}`}
                className="tile"
                style={{ width: row.height * item.aspect, height: row.height }}
                onClick={(e) => openAt(item.index, e)}
                aria-label={`Open photo ${item.index + 1} of ${title}`}
              >
                <Image
                  src={item.url}
                  alt={`${title} ${item.index + 1}`}
                  fill
                  sizes={`${Math.ceil(row.height * item.aspect)}px`}
                  style={{ objectFit: "cover" }}
                />
              </button>
            ))}
          </div>
        ))}
      </div>

      {openIndex !== null && (
        <div
          ref={lightboxRef}
          className="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={`${title} - photo ${openIndex + 1} of ${photos.length}`}
          onClick={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <button ref={closeButtonRef} className="lightbox-close" onClick={close} aria-label="Close">
            ×
          </button>
          <button className="lightbox-arrow left" onClick={prev} aria-label="Previous photo">
            ‹
          </button>
          <div className="lightbox-image">
            <Image
              src={photos[openIndex].url}
              alt={`${title} ${openIndex + 1}`}
              fill
              sizes="82vw"
              style={{ objectFit: "contain" }}
              preload
            />
          </div>
          <button className="lightbox-arrow right" onClick={next} aria-label="Next photo">
            ›
          </button>
          <span className="lightbox-count">
            {openIndex + 1} / {photos.length}
          </span>
          <span className="lightbox-hint" aria-hidden="true">
            ← → browse · esc close
          </span>
        </div>
      )}
    </>
  );
}

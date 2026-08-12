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

// Lightbox touch gestures - drag down to dismiss (Photos-app style),
// swipe left/right to browse. Thresholds are resolved on release rather
// than live, so a short tap never gets misread as a swipe.
const SWIPE_DISMISS_THRESHOLD = 90;
const SWIPE_NAV_THRESHOLD = 55;
const SWIPE_NAV_MAX_DURATION = 600;

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

  // Warm the browser cache with every photo at lightbox resolution, so
  // clicking through never waits on the network. Deferred to an idle
  // callback so the grid's own thumbnails get first crack at the
  // connection instead of competing with this bulk prefetch.
  const [preloadReady, setPreloadReady] = useState(false);
  useEffect(() => {
    const ric =
      window.requestIdleCallback ??
      ((cb: IdleRequestCallback) => window.setTimeout(cb, 200));
    const cancelRic = window.cancelIdleCallback ?? window.clearTimeout;
    const id = ric(() => setPreloadReady(true));
    return () => cancelRic(id);
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

  // Lock the page underneath so a swipe inside the lightbox can't rubber-band
  // scroll the gallery behind it on iOS/Android.
  const lightboxOpen = openIndex !== null;
  useEffect(() => {
    if (!lightboxOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [lightboxOpen]);

  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStartRef.current = { x: t.clientX, y: t.clientY, time: Date.now() };
    setIsDragging(true);
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    const start = touchStartRef.current;
    if (!start) return;
    const t = e.touches[0];
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    // Whichever axis currently leads wins the drag - lets a gesture that
    // starts diagonal settle into either a dismiss or a browse swipe.
    if (Math.abs(dy) >= Math.abs(dx)) {
      setDragOffset({ x: 0, y: Math.max(dy, 0) });
    } else {
      setDragOffset({ x: dx, y: 0 });
    }
  }, []);

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const start = touchStartRef.current;
      touchStartRef.current = null;
      setIsDragging(false);
      setDragOffset({ x: 0, y: 0 });
      if (!start) return;

      const t = e.changedTouches[0];
      const dx = t.clientX - start.x;
      const dy = t.clientY - start.y;
      const elapsed = Date.now() - start.time;
      const absX = Math.abs(dx);
      const absY = Math.abs(dy);

      if (absY >= absX && dy > SWIPE_DISMISS_THRESHOLD) {
        close();
      } else if (absX > absY && absX > SWIPE_NAV_THRESHOLD && elapsed < SWIPE_NAV_MAX_DURATION) {
        if (dx > 0) prev();
        else next();
      }
    },
    [close, prev, next]
  );

  const chromeStyle: React.CSSProperties = {
    opacity: isDragging && dragOffset.y > 12 ? 0 : 1,
    transition: "opacity 0.15s ease",
  };

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

      {preloadReady && (
        <div
          aria-hidden="true"
          style={{
            position: "fixed",
            top: -99999,
            left: -99999,
            width: 1,
            height: 1,
            overflow: "hidden",
            pointerEvents: "none",
          }}
        >
          {photos.map((photo, i) => (
            <Image
              key={`preload-${photo.url}-${i}`}
              src={photo.url}
              alt=""
              fill
              sizes="82vw"
              loading="eager"
              style={{ objectFit: "contain" }}
            />
          ))}
        </div>
      )}

      {openIndex !== null && (
        <div
          ref={lightboxRef}
          className="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={`${title} - photo ${openIndex + 1} of ${photos.length}`}
          style={
            isDragging && dragOffset.y > 0
              ? { backgroundColor: `rgba(20, 16, 8, ${Math.max(0.94 - dragOffset.y / 260, 0.35)})` }
              : undefined
          }
          onClick={(e) => {
            if (e.target === e.currentTarget) close();
          }}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <button
            ref={closeButtonRef}
            className="lightbox-close"
            onClick={close}
            aria-label="Close"
            style={chromeStyle}
          >
            ×
          </button>
          <button
            className="lightbox-arrow left"
            onClick={prev}
            aria-label="Previous photo"
            style={chromeStyle}
          >
            ‹
          </button>
          <div className="lightbox-image">
            <div
              className="lightbox-drag"
              style={{
                transform: `translate(${dragOffset.x}px, ${dragOffset.y}px)`,
                transition: isDragging ? "none" : "transform 0.28s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            >
              <Image
                src={photos[openIndex].url}
                alt={`${title} ${openIndex + 1}`}
                fill
                sizes="82vw"
                style={{ objectFit: "contain" }}
                preload
              />
            </div>
          </div>
          <button
            className="lightbox-arrow right"
            onClick={next}
            aria-label="Next photo"
            style={chromeStyle}
          >
            ›
          </button>
          <span className="lightbox-count" style={chromeStyle}>
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

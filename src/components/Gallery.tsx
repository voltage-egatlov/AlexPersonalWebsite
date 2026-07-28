"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";

export default function Gallery({
  photos,
  title,
}: {
  photos: string[];
  title: string;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const lightboxRef = useRef<HTMLDivElement>(null);
  const lastTriggerRef = useRef<HTMLButtonElement | null>(null);

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
      <div className="tile-grid">
        {photos.map((src, i) => (
          <button
            key={`${src}-${i}`}
            className="tile"
            onClick={(e) => openAt(i, e)}
            aria-label={`Open photo ${i + 1} of ${title}`}
          >
            <Image src={src} alt={`${title} ${i + 1}`} fill sizes="220px" style={{ objectFit: "cover" }} />
          </button>
        ))}
      </div>

      {openIndex !== null && (
        <div
          ref={lightboxRef}
          className="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={`${title} — photo ${openIndex + 1} of ${photos.length}`}
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
              src={photos[openIndex]}
              alt={`${title} ${openIndex + 1}`}
              fill
              sizes="90vw"
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

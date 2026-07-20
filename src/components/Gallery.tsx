"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";

export default function Gallery({
  photos,
  title,
}: {
  photos: string[];
  title: string;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

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

  useEffect(() => {
    if (openIndex === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openIndex, close, prev, next]);

  return (
    <>
      <div className="tile-grid">
        {photos.map((src, i) => (
          <button
            key={`${src}-${i}`}
            className="tile"
            onClick={() => setOpenIndex(i)}
            aria-label={`Open photo ${i + 1} of ${title}`}
          >
            <Image src={src} alt={`${title} ${i + 1}`} fill sizes="220px" style={{ objectFit: "cover" }} />
          </button>
        ))}
      </div>

      {openIndex !== null && (
        <div className="lightbox" role="dialog" aria-modal="true">
          <button className="lightbox-close" onClick={close} aria-label="Close">
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
        </div>
      )}
    </>
  );
}

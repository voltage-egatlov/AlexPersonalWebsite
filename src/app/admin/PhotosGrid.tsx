"use client";

import { useState, useTransition, type MouseEvent } from "react";
import Image from "next/image";
import type { Photo, Section } from "@/lib/photos";
import {
  deletePhoto,
  movePhoto,
  setFeaturedPhoto,
  setPhotoFocalPoint,
} from "./photo-actions";

export default function PhotosGrid({
  photos,
  section,
}: {
  photos: Photo[];
  section: Section;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleDelete(photo: Photo) {
    const ok = window.confirm("Delete this photo? This can't be undone.");
    if (!ok) return;
    setError(null);
    startTransition(async () => {
      try {
        await deletePhoto(photo.id, section);
      } catch {
        setError("Couldn't delete that photo. Try again.");
      }
    });
  }

  function handleMove(photo: Photo, direction: "up" | "down") {
    setError(null);
    startTransition(async () => {
      try {
        await movePhoto(photo.id, section, direction);
      } catch {
        setError("Couldn't reorder that photo. Try again.");
      }
    });
  }

  function handleFeature(photo: Photo) {
    setError(null);
    startTransition(async () => {
      try {
        await setFeaturedPhoto(photo.id, section);
      } catch {
        setError("Couldn't set that photo as the hero. Try again.");
      }
    });
  }

  // Click anywhere on the thumbnail to pin the point that should stay in
  // frame when this photo gets cropped - matters most for the home hero,
  // which crops in tight on narrow mobile viewports.
  function handleSetFocalPoint(photo: Photo, e: MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setError(null);
    startTransition(async () => {
      try {
        await setPhotoFocalPoint(photo.id, section, x, y);
      } catch {
        setError("Couldn't set the focal point. Try again.");
      }
    });
  }

  if (photos.length === 0) {
    return (
      <div className="empty-block">
        <span className="stamp-tag">Empty</span>
        <p>No photos here yet - upload some above.</p>
      </div>
    );
  }

  return (
    <>
      {error && <p className="inline-error">{error}</p>}
      <p className="admin-photo-hint">
        Click a thumbnail to set its focal point — the spot kept in frame when
        it&apos;s cropped as the home hero on mobile.
      </p>
      <ul className="admin-photo-grid">
        {photos.map((photo, i) => (
          <li key={photo.id} className="admin-photo-tile">
            <div
              className="admin-photo-image"
              // Match the photo's real aspect ratio (rather than forcing a
              // square) and use object-fit: contain, so the whole image is
              // always visible here - a click's position on the thumbnail
              // then maps 1:1 to a percentage of the actual photo. A cover
              // crop would hide the photo's edges, making focal points
              // near an edge (like this one) impossible to click on.
              style={{
                aspectRatio: photo.width && photo.height ? `${photo.width} / ${photo.height}` : "4 / 3",
              }}
              onClick={(e) => handleSetFocalPoint(photo, e)}
              title="Click to set the focal point kept in frame when cropped"
            >
              <Image src={photo.url} alt="" fill sizes="220px" style={{ objectFit: "contain" }} />
              <span
                className="admin-photo-focal-point"
                style={{ left: `${photo.focalX}%`, top: `${photo.focalY}%` }}
              />
              {photo.isFeatured && <span className="admin-photo-badge">Home hero</span>}
            </div>
            <div className="admin-photo-actions">
              <button disabled={isPending || i === 0} onClick={() => handleMove(photo, "up")}>
                ↑
              </button>
              <button
                disabled={isPending || i === photos.length - 1}
                onClick={() => handleMove(photo, "down")}
              >
                ↓
              </button>
              <button disabled={isPending || photo.isFeatured} onClick={() => handleFeature(photo)}>
                Set as hero
              </button>
              <button disabled={isPending} onClick={() => handleDelete(photo)} className="danger">
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}

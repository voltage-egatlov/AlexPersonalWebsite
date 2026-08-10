"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import type { Photo, Section } from "@/lib/photos";
import { deletePhoto, movePhoto, setFeaturedPhoto } from "./photo-actions";

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

  if (photos.length === 0) {
    return (
      <div className="empty-block">
        <span className="stamp-tag">Empty</span>
        <p>No photos here yet — upload some above.</p>
      </div>
    );
  }

  return (
    <>
      {error && <p className="inline-error">{error}</p>}
      <ul className="admin-photo-grid">
        {photos.map((photo, i) => (
          <li key={photo.id} className="admin-photo-tile">
            <div className="admin-photo-image">
              <Image src={photo.url} alt="" fill sizes="220px" style={{ objectFit: "cover" }} />
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

"use client";

import { useTransition } from "react";
import Image from "next/image";
import type { Photo } from "@/lib/collections";
import { deletePhoto, movePhoto, setFeaturedPhoto } from "./actions";

export default function PhotosGrid({
  photos,
  collectionId,
  collectionSlug,
}: {
  photos: Photo[];
  collectionId: string;
  collectionSlug: string;
}) {
  const [isPending, startTransition] = useTransition();

  function handleDelete(photo: Photo) {
    const ok = window.confirm("Delete this photo? This can't be undone.");
    if (!ok) return;
    startTransition(() => {
      deletePhoto(photo.id, collectionSlug);
    });
  }

  function handleMove(photo: Photo, direction: "up" | "down") {
    startTransition(() => {
      movePhoto(photo.id, collectionId, collectionSlug, direction);
    });
  }

  function handleFeature(photo: Photo) {
    startTransition(() => {
      setFeaturedPhoto(photo.id, collectionSlug);
    });
  }

  if (photos.length === 0) {
    return <p>No photos in this collection yet — upload some above.</p>;
  }

  return (
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
  );
}

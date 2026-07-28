"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import type { CollectionSummary } from "@/lib/collections";
import { deleteCollection, moveCollection, renameCollection } from "./actions";

export default function CollectionsList({
  collections,
}: {
  collections: CollectionSummary[];
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleRename(collection: CollectionSummary) {
    const title = window.prompt("Rename collection", collection.title);
    if (title === null || title.trim() === "" || title === collection.title) return;
    setError(null);
    startTransition(async () => {
      try {
        await renameCollection(collection.id, title);
      } catch {
        setError(`Couldn't rename "${collection.title}". Try again.`);
      }
    });
  }

  function handleDelete(collection: CollectionSummary) {
    const ok = window.confirm(
      `Delete "${collection.title}" and all ${collection.photoCount} photo(s) in it? This can't be undone.`
    );
    if (!ok) return;
    setError(null);
    startTransition(async () => {
      try {
        await deleteCollection(collection.id);
      } catch {
        setError(`Couldn't delete "${collection.title}". Try again.`);
      }
    });
  }

  function handleMove(collection: CollectionSummary, direction: "up" | "down") {
    setError(null);
    startTransition(async () => {
      try {
        await moveCollection(collection.id, direction);
      } catch {
        setError(`Couldn't reorder "${collection.title}". Try again.`);
      }
    });
  }

  return (
    <>
      {error && <p className="inline-error">{error}</p>}
      <ul className="admin-list">
        {collections.map((c, i) => (
          <li key={c.id} className="admin-list-row">
            <span className="file-no">{c.fileNo}</span>
            <Link href={`/admin/collections/${c.slug}`} className="admin-list-title">
              {c.title}
            </Link>
            <span className="admin-list-meta">{c.photoCount} photo(s)</span>
            <span className="admin-list-actions">
              <button disabled={isPending || i === 0} onClick={() => handleMove(c, "up")}>
                ↑
              </button>
              <button
                disabled={isPending || i === collections.length - 1}
                onClick={() => handleMove(c, "down")}
              >
                ↓
              </button>
              <button disabled={isPending} onClick={() => handleRename(c)}>
                Rename
              </button>
              <button disabled={isPending} onClick={() => handleDelete(c)} className="danger">
                Delete
              </button>
            </span>
          </li>
        ))}
      </ul>
    </>
  );
}

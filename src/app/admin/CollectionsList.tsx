"use client";

import { useTransition } from "react";
import Link from "next/link";
import type { Collection } from "@/lib/collections";
import { deleteCollection, moveCollection, renameCollection } from "./actions";

export default function CollectionsList({
  collections,
}: {
  collections: Collection[];
}) {
  const [isPending, startTransition] = useTransition();

  function handleRename(collection: Collection) {
    const title = window.prompt("Rename collection", collection.title);
    if (title === null || title.trim() === "" || title === collection.title) return;
    startTransition(() => {
      renameCollection(collection.id, title);
    });
  }

  function handleDelete(collection: Collection) {
    const ok = window.confirm(
      `Delete "${collection.title}" and all ${collection.photos.length} photo(s) in it? This can't be undone.`
    );
    if (!ok) return;
    startTransition(() => {
      deleteCollection(collection.id);
    });
  }

  function handleMove(collection: Collection, direction: "up" | "down") {
    startTransition(() => {
      moveCollection(collection.id, direction);
    });
  }

  return (
    <ul className="admin-list">
      {collections.map((c, i) => (
        <li key={c.id} className="admin-list-row">
          <span className="file-no">{c.fileNo}</span>
          <Link href={`/admin/collections/${c.slug}`} className="admin-list-title">
            {c.title}
          </Link>
          <span className="admin-list-meta">{c.photos.length} photo(s)</span>
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
  );
}

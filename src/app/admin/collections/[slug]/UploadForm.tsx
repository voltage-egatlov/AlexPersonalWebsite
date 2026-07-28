"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { uploadPhoto } from "./actions";

type FileStatus = { id: number; name: string; state: "pending" | "done" | "error" };

let statusId = 0;

const STATE_LABEL: Record<FileStatus["state"], string> = {
  pending: "filing…",
  done: "filed",
  error: "rejected",
};

export default function UploadForm({
  collectionId,
  collectionSlug,
}: {
  collectionId: string;
  collectionSlug: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [statuses, setStatuses] = useState<FileStatus[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  function handleFiles(fileList: FileList | null) {
    const files = Array.from(fileList ?? []).filter((f) =>
      f.type.startsWith("image/")
    );
    if (files.length === 0) return;

    const entries = files.map((file) => ({ id: statusId++, file }));
    setStatuses(entries.map((e) => ({ id: e.id, name: e.file.name, state: "pending" as const })));

    startTransition(async () => {
      for (const { id, file } of entries) {
        const formData = new FormData();
        formData.set("file", file);
        try {
          await uploadPhoto(collectionId, collectionSlug, formData);
          setStatuses((prev) =>
            prev.map((s) => (s.id === id ? { ...s, state: "done" } : s))
          );
        } catch {
          setStatuses((prev) =>
            prev.map((s) => (s.id === id ? { ...s, state: "error" } : s))
          );
        }
      }
      router.refresh();
    });
  }

  return (
    <div
      className={`admin-dropzone${dragOver ? " admin-dropzone-active" : ""}`}
      role="button"
      tabIndex={0}
      aria-label="Upload photos: drag and drop, or activate to choose files"
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        handleFiles(e.dataTransfer.files);
      }}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          inputRef.current?.click();
        }
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        tabIndex={-1}
        onChange={(e) => handleFiles(e.target.files)}
      />
      <p>Drag photos here, or click to choose files</p>
      {statuses.length > 0 && (
        <ul className="admin-upload-status">
          {statuses.map((s) => (
            <li key={s.id} data-state={s.state}>
              {s.name} — {STATE_LABEL[s.state]}
            </li>
          ))}
        </ul>
      )}
      {isPending && <p className="admin-upload-pending">Uploading…</p>}
    </div>
  );
}

"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { uploadPhoto } from "./actions";

type FileStatus = { name: string; state: "pending" | "done" | "error" };

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

    setStatuses(files.map((f) => ({ name: f.name, state: "pending" })));

    startTransition(async () => {
      for (const file of files) {
        const formData = new FormData();
        formData.set("file", file);
        try {
          await uploadPhoto(collectionId, collectionSlug, formData);
          setStatuses((prev) =>
            prev.map((s) => (s.name === file.name ? { ...s, state: "done" } : s))
          );
        } catch {
          setStatuses((prev) =>
            prev.map((s) => (s.name === file.name ? { ...s, state: "error" } : s))
          );
        }
      }
      router.refresh();
    });
  }

  return (
    <div
      className={`admin-dropzone${dragOver ? " admin-dropzone-active" : ""}`}
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
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => handleFiles(e.target.files)}
      />
      <p>Drag photos here, or click to choose files</p>
      {statuses.length > 0 && (
        <ul className="admin-upload-status">
          {statuses.map((s) => (
            <li key={s.name} data-state={s.state}>
              {s.name} — {s.state}
            </li>
          ))}
        </ul>
      )}
      {isPending && <p className="admin-upload-pending">Uploading…</p>}
    </div>
  );
}

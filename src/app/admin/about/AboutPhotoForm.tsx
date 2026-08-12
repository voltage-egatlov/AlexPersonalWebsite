"use client";

import Image from "next/image";
import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { uploadAboutPhoto, removeAboutPhoto } from "./actions";

export default function AboutPhotoForm({
  photoUrl,
}: {
  photoUrl: string | null;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  function handleFile(file: File | undefined) {
    if (!file || !file.type.startsWith("image/")) return;
    setError(null);

    startTransition(async () => {
      const formData = new FormData();
      formData.set("file", file);
      try {
        await uploadAboutPhoto(formData);
        router.refresh();
      } catch {
        setError("Couldn't upload that photo. Try again.");
      }
    });
  }

  function handleRemove() {
    setError(null);
    startTransition(async () => {
      try {
        await removeAboutPhoto();
        router.refresh();
      } catch {
        setError("Couldn't remove the photo. Try again.");
      }
    });
  }

  return (
    <div className="admin-field">
      <span className="admin-field-label">About photo</span>

      {photoUrl && (
        <div className="admin-about-photo-preview">
          <Image src={photoUrl} alt="Current about photo" fill sizes="160px" />
        </div>
      )}

      <div
        className={`admin-dropzone${dragOver ? " admin-dropzone-active" : ""}`}
        role="button"
        tabIndex={0}
        aria-label="Upload about photo: drag and drop, or activate to choose a file"
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFile(e.dataTransfer.files?.[0]);
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
          hidden
          tabIndex={-1}
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        <p>
          {photoUrl
            ? "Drag a photo here, or click to replace"
            : "Drag a photo here, or click to choose one"}
        </p>
        {isPending && <p className="admin-upload-pending">Uploading…</p>}
      </div>

      {error && <p className="admin-error">{error}</p>}

      {photoUrl && (
        <div className="admin-photo-actions admin-photo-actions--standalone">
          <button
            type="button"
            className="danger"
            onClick={handleRemove}
            disabled={isPending}
          >
            Remove photo
          </button>
        </div>
      )}
    </div>
  );
}

"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { supabaseAdmin, PHOTOS_BUCKET } from "@/lib/supabase-admin";
import { requireAdminSession } from "@/lib/session";

function sanitizeFilename(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9.]+/g, "-");
}

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);
const MAX_UPLOAD_BYTES = 25 * 1024 * 1024; // 25MB

export async function uploadPhoto(
  collectionId: string,
  collectionSlug: string,
  formData: FormData
) {
  await requireAdminSession();

  const file = formData.get("file");
  if (!(file instanceof File)) throw new Error("No file provided");
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new Error(`Unsupported file type: ${file.type || "unknown"}`);
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error("File is larger than the 25MB upload limit");
  }

  const db = supabaseAdmin();
  const path = `${collectionId}/${randomUUID()}-${sanitizeFilename(file.name)}`;

  const { error: uploadError } = await db.storage
    .from(PHOTOS_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });
  if (uploadError) throw uploadError;

  const { data: maxRow } = await db
    .from("photos")
    .select("sort_order")
    .eq("collection_id", collectionId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { error: insertError } = await db.from("photos").insert({
    collection_id: collectionId,
    storage_path: path,
    sort_order: (maxRow?.sort_order ?? -1) + 1,
  });
  if (insertError) throw insertError;

  revalidatePath(`/admin/collections/${collectionSlug}`);
  revalidatePath(`/collections/${collectionSlug}`);
  revalidatePath("/collections");
}

export async function deletePhoto(photoId: string, collectionSlug: string) {
  await requireAdminSession();

  const db = supabaseAdmin();

  const { data: photo, error } = await db
    .from("photos")
    .select("storage_path")
    .eq("id", photoId)
    .maybeSingle();
  if (error) throw error;

  if (photo) {
    await db.storage.from(PHOTOS_BUCKET).remove([photo.storage_path]);
  }

  const { error: deleteError } = await db.from("photos").delete().eq("id", photoId);
  if (deleteError) throw deleteError;

  revalidatePath(`/admin/collections/${collectionSlug}`);
  revalidatePath(`/collections/${collectionSlug}`);
  revalidatePath("/");
}

export async function movePhoto(
  photoId: string,
  collectionId: string,
  collectionSlug: string,
  direction: "up" | "down"
) {
  await requireAdminSession();

  const db = supabaseAdmin();
  const { data: photos, error } = await db
    .from("photos")
    .select("id, sort_order")
    .eq("collection_id", collectionId)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  if (!photos) return;

  const index = photos.findIndex((p) => p.id === photoId);
  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (index === -1 || swapWith < 0 || swapWith >= photos.length) return;

  const a = photos[index];
  const b = photos[swapWith];

  await Promise.all([
    db.from("photos").update({ sort_order: b.sort_order }).eq("id", a.id),
    db.from("photos").update({ sort_order: a.sort_order }).eq("id", b.id),
  ]);

  revalidatePath(`/admin/collections/${collectionSlug}`);
  revalidatePath(`/collections/${collectionSlug}`);
}

export async function setFeaturedPhoto(photoId: string, collectionSlug: string) {
  await requireAdminSession();

  const db = supabaseAdmin();

  await db.from("photos").update({ is_featured: false }).neq("id", photoId);
  const { error } = await db
    .from("photos")
    .update({ is_featured: true })
    .eq("id", photoId);
  if (error) throw error;

  revalidatePath(`/admin/collections/${collectionSlug}`);
  revalidatePath("/");
}

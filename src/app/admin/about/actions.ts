"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { supabaseAdmin, PHOTOS_BUCKET } from "@/lib/supabase-admin";
import { requireAdminSession } from "@/lib/session";

export type AboutFormState = { error: string | null; success: boolean };

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);
const MAX_UPLOAD_BYTES = 25 * 1024 * 1024; // 25MB

function sanitizeFilename(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9.]+/g, "-");
}

function revalidateAbout() {
  revalidatePath("/admin/about");
  revalidatePath("/about");
}

export async function uploadAboutPhoto(formData: FormData) {
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
  const path = `about/${randomUUID()}-${sanitizeFilename(file.name)}`;

  const { error: uploadError } = await db.storage
    .from(PHOTOS_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });
  if (uploadError) throw uploadError;

  const { data: current } = await db
    .from("site_content")
    .select("about_photo_path")
    .eq("id", 1)
    .maybeSingle();

  const { error: updateError } = await db
    .from("site_content")
    .update({ about_photo_path: path, updated_at: new Date().toISOString() })
    .eq("id", 1);
  if (updateError) throw updateError;

  // Clean up the photo it replaced, now that the row points at the new one.
  if (current?.about_photo_path) {
    await db.storage.from(PHOTOS_BUCKET).remove([current.about_photo_path]);
  }

  revalidateAbout();
}

export async function removeAboutPhoto() {
  await requireAdminSession();

  const db = supabaseAdmin();
  const { data: current } = await db
    .from("site_content")
    .select("about_photo_path")
    .eq("id", 1)
    .maybeSingle();
  if (!current?.about_photo_path) return;

  const { error: updateError } = await db
    .from("site_content")
    .update({ about_photo_path: null, updated_at: new Date().toISOString() })
    .eq("id", 1);
  if (updateError) throw updateError;

  await db.storage.from(PHOTOS_BUCKET).remove([current.about_photo_path]);

  revalidateAbout();
}

export async function updateAboutContent(
  _prevState: AboutFormState,
  formData: FormData
): Promise<AboutFormState> {
  await requireAdminSession();

  const aboutBody = String(formData.get("aboutBody") ?? "").trim();
  const contactPhone = String(formData.get("contactPhone") ?? "").trim();
  const contactEmail = String(formData.get("contactEmail") ?? "").trim();
  const contactInstagramLabel = String(
    formData.get("contactInstagramLabel") ?? ""
  ).trim();
  const contactInstagramUrl = String(
    formData.get("contactInstagramUrl") ?? ""
  ).trim();

  const db = supabaseAdmin();
  const { error } = await db
    .from("site_content")
    .update({
      about_body: aboutBody,
      contact_phone: contactPhone,
      contact_email: contactEmail,
      contact_instagram_label: contactInstagramLabel,
      contact_instagram_url: contactInstagramUrl,
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);

  if (error) return { error: "Couldn't save. Try again.", success: false };

  revalidateAbout();
  return { error: null, success: true };
}

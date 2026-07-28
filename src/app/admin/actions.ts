"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { supabaseAdmin, PHOTOS_BUCKET } from "@/lib/supabase-admin";
import { slugify } from "@/lib/slug";
import { SESSION_COOKIE_NAME, requireAdminSession } from "@/lib/session";

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  redirect("/admin/login");
}

// Collections.slug is unique, and two different titles ("Paris!" vs
// "Paris?") can slugify to the same value. Rather than let the DB's unique
// constraint throw and crash the page, disambiguate with a numeric suffix.
async function uniqueSlug(
  db: SupabaseClient,
  base: string,
  excludeId?: string
) {
  let candidate = base;
  let attempt = 2;
  for (;;) {
    let query = db.from("collections").select("id").eq("slug", candidate);
    if (excludeId) query = query.neq("id", excludeId);
    const { data } = await query.maybeSingle();
    if (!data) return candidate;
    candidate = `${base}-${attempt++}`;
  }
}

export async function createCollection(formData: FormData) {
  await requireAdminSession();

  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;

  const db = supabaseAdmin();
  const slug = await uniqueSlug(db, slugify(title));

  const { count } = await db
    .from("collections")
    .select("id", { count: "exact", head: true });

  const { data: maxRow } = await db
    .from("collections")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { error } = await db.from("collections").insert({
    title,
    slug,
    file_no: String((count ?? 0) + 1).padStart(3, "0"),
    sort_order: (maxRow?.sort_order ?? -1) + 1,
  });
  if (error) throw error;

  revalidatePath("/admin");
  revalidatePath("/collections");
}

export async function renameCollection(collectionId: string, title: string) {
  await requireAdminSession();

  const trimmed = title.trim();
  if (!trimmed) return;

  const db = supabaseAdmin();
  const slug = await uniqueSlug(db, slugify(trimmed), collectionId);
  const { error } = await db
    .from("collections")
    .update({ title: trimmed, slug })
    .eq("id", collectionId);
  if (error) throw error;

  revalidatePath("/admin");
  revalidatePath("/collections");
}

export async function deleteCollection(collectionId: string) {
  await requireAdminSession();

  const db = supabaseAdmin();

  const { data: photos, error: photosError } = await db
    .from("photos")
    .select("storage_path")
    .eq("collection_id", collectionId);
  if (photosError) throw photosError;

  if (photos && photos.length > 0) {
    await db.storage
      .from(PHOTOS_BUCKET)
      .remove(photos.map((p) => p.storage_path));
  }

  const { error } = await db.from("collections").delete().eq("id", collectionId);
  if (error) throw error;

  revalidatePath("/admin");
  revalidatePath("/collections");
  revalidatePath("/");
}

export async function moveCollection(
  collectionId: string,
  direction: "up" | "down"
) {
  await requireAdminSession();

  const db = supabaseAdmin();
  const { data: collections, error } = await db
    .from("collections")
    .select("id, sort_order")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  if (!collections) return;

  const index = collections.findIndex((c) => c.id === collectionId);
  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (index === -1 || swapWith < 0 || swapWith >= collections.length) return;

  const a = collections[index];
  const b = collections[swapWith];

  await Promise.all([
    db.from("collections").update({ sort_order: b.sort_order }).eq("id", a.id),
    db.from("collections").update({ sort_order: a.sort_order }).eq("id", b.id),
  ]);

  revalidatePath("/admin");
  revalidatePath("/collections");
}

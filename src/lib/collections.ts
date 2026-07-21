import { supabaseAdmin, PHOTOS_BUCKET } from "@/lib/supabase-admin";

export type Photo = {
  id: string;
  url: string;
  storagePath: string;
  sortOrder: number;
  isFeatured: boolean;
};

export type Collection = {
  id: string;
  slug: string;
  title: string;
  fileNo: string;
  sortOrder: number;
  photos: Photo[];
};

function publicUrlFor(path: string) {
  return supabaseAdmin().storage.from(PHOTOS_BUCKET).getPublicUrl(path).data
    .publicUrl;
}

export async function getCollections(): Promise<Collection[]> {
  const db = supabaseAdmin();
  const { data: collections, error } = await db
    .from("collections")
    .select("id, slug, title, file_no, sort_order")
    .order("sort_order", { ascending: true });
  if (error) throw error;

  const { data: photos, error: photosError } = await db
    .from("photos")
    .select("id, collection_id, storage_path, sort_order, is_featured")
    .order("sort_order", { ascending: true });
  if (photosError) throw photosError;

  return (collections ?? []).map((c) => ({
    id: c.id,
    slug: c.slug,
    title: c.title,
    fileNo: c.file_no,
    sortOrder: c.sort_order,
    photos: (photos ?? [])
      .filter((p) => p.collection_id === c.id)
      .map((p) => ({
        id: p.id,
        url: publicUrlFor(p.storage_path),
        storagePath: p.storage_path,
        sortOrder: p.sort_order,
        isFeatured: p.is_featured,
      })),
  }));
}

export async function getCollection(slug: string): Promise<Collection | null> {
  const db = supabaseAdmin();
  const { data: collection, error } = await db
    .from("collections")
    .select("id, slug, title, file_no, sort_order")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  if (!collection) return null;

  const { data: photos, error: photosError } = await db
    .from("photos")
    .select("id, storage_path, sort_order, is_featured")
    .eq("collection_id", collection.id)
    .order("sort_order", { ascending: true });
  if (photosError) throw photosError;

  return {
    id: collection.id,
    slug: collection.slug,
    title: collection.title,
    fileNo: collection.file_no,
    sortOrder: collection.sort_order,
    photos: (photos ?? []).map((p) => ({
      id: p.id,
      url: publicUrlFor(p.storage_path),
      storagePath: p.storage_path,
      sortOrder: p.sort_order,
      isFeatured: p.is_featured,
    })),
  };
}

export async function getFeaturedPhoto(): Promise<Photo | null> {
  const db = supabaseAdmin();
  const { data, error } = await db
    .from("photos")
    .select("id, storage_path, sort_order, is_featured")
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  return {
    id: data.id,
    url: publicUrlFor(data.storage_path),
    storagePath: data.storage_path,
    sortOrder: data.sort_order,
    isFeatured: data.is_featured,
  };
}

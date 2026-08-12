import { supabaseAdmin, PHOTOS_BUCKET } from "@/lib/supabase-admin";

export type Section = "photo" | "prints";

export const SECTIONS: Section[] = ["photo", "prints"];

export type Photo = {
  id: string;
  url: string;
  storagePath: string;
  section: Section;
  sortOrder: number;
  isFeatured: boolean;
  // Null for photos uploaded before dimension tracking existed - callers
  // fall back to a default aspect ratio.
  width: number | null;
  height: number | null;
};

const PHOTO_COLUMNS =
  "id, storage_path, section, sort_order, is_featured, width, height";

function publicUrlFor(path: string) {
  return supabaseAdmin().storage.from(PHOTOS_BUCKET).getPublicUrl(path).data
    .publicUrl;
}

function toPhoto(p: {
  id: string;
  storage_path: string;
  section: Section;
  sort_order: number;
  is_featured: boolean;
  width: number | null;
  height: number | null;
}): Photo {
  return {
    id: p.id,
    url: publicUrlFor(p.storage_path),
    storagePath: p.storage_path,
    section: p.section,
    sortOrder: p.sort_order,
    isFeatured: p.is_featured,
    width: p.width,
    height: p.height,
  };
}

export async function getPhotos(section: Section): Promise<Photo[]> {
  const db = supabaseAdmin();
  const { data, error } = await db
    .from("photos")
    .select(PHOTO_COLUMNS)
    .eq("section", section)
    .order("sort_order", { ascending: true });
  if (error) throw error;

  return (data ?? []).map(toPhoto);
}

export async function getSectionCounts(): Promise<Record<Section, number>> {
  const db = supabaseAdmin();
  const counts = await Promise.all(
    SECTIONS.map((section) =>
      db
        .from("photos")
        .select("id", { count: "exact", head: true })
        .eq("section", section)
    )
  );

  return SECTIONS.reduce((acc, section, i) => {
    const { count, error } = counts[i];
    if (error) throw error;
    acc[section] = count ?? 0;
    return acc;
  }, {} as Record<Section, number>);
}

// The home hero can be any photo, from either section - whichever the admin
// most recently marked as featured.
export async function getFeaturedPhoto(): Promise<Photo | null> {
  const db = supabaseAdmin();
  const { data, error } = await db
    .from("photos")
    .select(PHOTO_COLUMNS)
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  return toPhoto(data);
}

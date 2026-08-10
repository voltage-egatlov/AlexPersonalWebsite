import { supabaseAdmin, PHOTOS_BUCKET } from "@/lib/supabase-admin";

export type Section = "photography" | "prints";

export const SECTIONS: Section[] = ["photography", "prints"];

export type Photo = {
  id: string;
  url: string;
  storagePath: string;
  section: Section;
  sortOrder: number;
  isFeatured: boolean;
};

function publicUrlFor(path: string) {
  return supabaseAdmin().storage.from(PHOTOS_BUCKET).getPublicUrl(path).data
    .publicUrl;
}

export async function getPhotos(section: Section): Promise<Photo[]> {
  const db = supabaseAdmin();
  const { data, error } = await db
    .from("photos")
    .select("id, storage_path, section, sort_order, is_featured")
    .eq("section", section)
    .order("sort_order", { ascending: true });
  if (error) throw error;

  return (data ?? []).map((p) => ({
    id: p.id,
    url: publicUrlFor(p.storage_path),
    storagePath: p.storage_path,
    section: p.section,
    sortOrder: p.sort_order,
    isFeatured: p.is_featured,
  }));
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

// The home hero can be any photo, from either section — whichever the admin
// most recently marked as featured.
export async function getFeaturedPhoto(): Promise<Photo | null> {
  const db = supabaseAdmin();
  const { data, error } = await db
    .from("photos")
    .select("id, storage_path, section, sort_order, is_featured")
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
    section: data.section,
    sortOrder: data.sort_order,
    isFeatured: data.is_featured,
  };
}

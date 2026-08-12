import { supabaseAdmin, PHOTOS_BUCKET } from "@/lib/supabase-admin";

export type SiteContent = {
  aboutBody: string;
  aboutPhotoPath: string | null;
  aboutPhotoUrl: string | null;
  contactPhone: string;
  contactEmail: string;
  contactInstagramLabel: string;
  contactInstagramUrl: string;
};

const EMPTY_CONTENT: SiteContent = {
  aboutBody: "",
  aboutPhotoPath: null,
  aboutPhotoUrl: null,
  contactPhone: "",
  contactEmail: "",
  contactInstagramLabel: "",
  contactInstagramUrl: "",
};

// site_content is a singleton (id = 1), seeded by migration — this should
// always find a row, but fall back to empty rather than throwing so a
// missing seed doesn't take the whole site down.
export async function getSiteContent(): Promise<SiteContent> {
  const db = supabaseAdmin();
  const { data, error } = await db
    .from("site_content")
    .select(
      "about_body, about_photo_path, contact_phone, contact_email, contact_instagram_label, contact_instagram_url"
    )
    .eq("id", 1)
    .maybeSingle();
  if (error) throw error;
  if (!data) return EMPTY_CONTENT;

  return {
    aboutBody: data.about_body,
    aboutPhotoPath: data.about_photo_path,
    aboutPhotoUrl: data.about_photo_path
      ? db.storage.from(PHOTOS_BUCKET).getPublicUrl(data.about_photo_path).data
          .publicUrl
      : null,
    contactPhone: data.contact_phone,
    contactEmail: data.contact_email,
    contactInstagramLabel: data.contact_instagram_label,
    contactInstagramUrl: data.contact_instagram_url,
  };
}

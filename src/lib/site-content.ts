import { supabaseAdmin } from "@/lib/supabase-admin";

export type SiteContent = {
  aboutBody: string;
  contactPhone: string;
  contactEmail: string;
  contactInstagramLabel: string;
  contactInstagramUrl: string;
};

const EMPTY_CONTENT: SiteContent = {
  aboutBody: "",
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
      "about_body, contact_phone, contact_email, contact_instagram_label, contact_instagram_url"
    )
    .eq("id", 1)
    .maybeSingle();
  if (error) throw error;
  if (!data) return EMPTY_CONTENT;

  return {
    aboutBody: data.about_body,
    contactPhone: data.contact_phone,
    contactEmail: data.contact_email,
    contactInstagramLabel: data.contact_instagram_label,
    contactInstagramUrl: data.contact_instagram_url,
  };
}

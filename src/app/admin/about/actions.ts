"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireAdminSession } from "@/lib/session";

export type AboutFormState = { error: string | null; success: boolean };

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

  revalidatePath("/admin/about");
  revalidatePath("/about");
  return { error: null, success: true };
}

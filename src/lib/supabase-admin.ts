import { createClient } from "@supabase/supabase-js";

// Server-only client using the service role key, which bypasses RLS.
// Never import this from a Client Component.
export function supabaseAdmin() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

export const PHOTOS_BUCKET = "photos";

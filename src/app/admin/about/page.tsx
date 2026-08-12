import Link from "next/link";
import { getSiteContent } from "@/lib/site-content";
import AboutForm from "./AboutForm";
import AboutPhotoForm from "./AboutPhotoForm";

export const metadata = {
  title: "Admin — About",
};

// Depends on live Supabase data and cookies — never prerender at build time.
export const dynamic = "force-dynamic";

export default async function AdminAboutPage() {
  const content = await getSiteContent();

  return (
    <div className="page">
      <Link href="/admin" className="collection-back">
        ← Back to admin
      </Link>
      <div className="collection-header" style={{ marginTop: 18, marginBottom: 24 }}>
        <div>
          <div className="page-eyebrow">Manage</div>
          <h1 className="page-title" style={{ marginBottom: 0, border: "none" }}>
            About &amp; contact
          </h1>
        </div>
      </div>

      <AboutPhotoForm photoUrl={content.aboutPhotoUrl} />
      <AboutForm content={content} />
    </div>
  );
}

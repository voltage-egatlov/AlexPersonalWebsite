import Link from "next/link";
import { getPhotos } from "@/lib/photos";
import UploadForm from "../UploadForm";
import PhotosGrid from "../PhotosGrid";

export const metadata = {
  title: "Admin - Prints",
};

// Depends on live Supabase data and cookies - never prerender at build time.
export const dynamic = "force-dynamic";

export default async function AdminPrintsPage() {
  const photos = await getPhotos("prints");

  return (
    <div className="page">
      <Link href="/admin" className="collection-back">
        ← Back to admin
      </Link>
      <div className="collection-header" style={{ marginTop: 18, marginBottom: 24 }}>
        <div>
          <div className="page-eyebrow">Manage</div>
          <h1 className="page-title" style={{ marginBottom: 0, border: "none" }}>
            Prints
          </h1>
        </div>
      </div>

      <UploadForm section="prints" />

      <div style={{ marginTop: 24 }}>
        <PhotosGrid photos={photos} section="prints" />
      </div>
    </div>
  );
}

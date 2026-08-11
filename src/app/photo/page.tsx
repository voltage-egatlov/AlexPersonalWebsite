import { getPhotos } from "@/lib/photos";
import Gallery from "@/components/Gallery";

export const metadata = {
  title: "Photo — Alexandra Nikita",
};

// Data is live/mutable in Supabase — never prerender this at build time.
export const dynamic = "force-dynamic";

export default async function PhotoPage() {
  const photos = await getPhotos("photo");

  return (
    <div>
      <div className="page page--section-header">
        <div className="page-eyebrow">Exhibits</div>
        <h1 className="page-title page-title--flush">Photo</h1>
      </div>
      {photos.length === 0 ? (
        <div className="section-body">
          <div className="empty-block">
            <span className="stamp-tag">No records</span>
            <p>No photographs on file yet.</p>
          </div>
        </div>
      ) : (
        <Gallery photos={photos.map((p) => p.url)} title="Photo" />
      )}
    </div>
  );
}

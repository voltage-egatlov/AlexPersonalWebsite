import { getPhotos } from "@/lib/photos";
import Gallery from "@/components/Gallery";

export const metadata = {
  title: "Prints — Alexandra Nikita",
};

// Data is live/mutable in Supabase — never prerender this at build time.
export const dynamic = "force-dynamic";

export default async function PrintsPage() {
  const photos = await getPhotos("prints");

  return (
    <div>
      <div className="page page--section-header">
        <div className="page-eyebrow">Series</div>
        <h1 className="page-title page-title--flush">Prints</h1>
      </div>
      {photos.length === 0 ? (
        <div className="section-body">
          <div className="empty-block">
            <span className="stamp-tag">No records</span>
            <p>No prints filed in this series yet.</p>
          </div>
        </div>
      ) : (
        <Gallery photos={photos.map((p) => p.url)} title="Prints" />
      )}
    </div>
  );
}

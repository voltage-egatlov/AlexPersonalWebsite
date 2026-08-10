import { getPhotos } from "@/lib/photos";
import Gallery from "@/components/Gallery";

export const metadata = {
  title: "Photography — Alexandra Nikita",
};

// Data is live/mutable in Supabase — never prerender this at build time.
export const dynamic = "force-dynamic";

export default async function PhotographyPage() {
  const photos = await getPhotos("photography");

  return (
    <div>
      <div className="page" style={{ paddingBottom: 32 }}>
        <div className="page-eyebrow">Exhibits</div>
        <h1 className="page-title" style={{ marginBottom: 0 }}>
          Photography
        </h1>
      </div>
      {photos.length === 0 ? (
        <div style={{ padding: "0 64px 64px" }}>
          <div className="empty-block">
            <span className="stamp-tag">No records</span>
            <p>No photographs on file yet.</p>
          </div>
        </div>
      ) : (
        <Gallery photos={photos.map((p) => p.url)} title="Photography" />
      )}
    </div>
  );
}

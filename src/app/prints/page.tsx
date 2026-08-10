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
      <div className="page" style={{ paddingBottom: 32 }}>
        <div className="page-eyebrow">Process</div>
        <h1 className="page-title" style={{ marginBottom: 0 }}>
          Prints
        </h1>
      </div>
      {photos.length === 0 ? (
        <div style={{ padding: "0 64px 64px" }}>
          <div className="empty-block">
            <span className="stamp-tag">No records</span>
            <p>No printing work on file yet.</p>
          </div>
        </div>
      ) : (
        <Gallery photos={photos.map((p) => p.url)} title="Prints" />
      )}
    </div>
  );
}

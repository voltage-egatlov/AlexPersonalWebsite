import Link from "next/link";
import { notFound } from "next/navigation";
import { getCollection } from "@/lib/collections";
import Gallery from "@/components/Gallery";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const collection = await getCollection(slug);
  return { title: collection ? `${collection.title} — Alexandra Nikita` : "Collection" };
}

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const collection = await getCollection(slug);

  if (!collection) {
    notFound();
  }

  return (
    <div>
      <div className="page" style={{ paddingBottom: 32 }}>
        <Link href="/collections" className="collection-back">
          ← Back to collections
        </Link>
        <div className="collection-header" style={{ marginTop: 18 }}>
          <div>
            <div className="page-eyebrow">File No. {collection.fileNo}</div>
            <h1 className="page-title" style={{ marginBottom: 0, border: "none" }}>
              {collection.title}
            </h1>
          </div>
        </div>
      </div>
      {collection.photos.length === 0 ? (
        <p style={{ padding: "0 64px 64px" }}>No photos in this collection yet.</p>
      ) : (
        <Gallery
          photos={collection.photos.map((p) => p.url)}
          title={collection.title}
        />
      )}
    </div>
  );
}

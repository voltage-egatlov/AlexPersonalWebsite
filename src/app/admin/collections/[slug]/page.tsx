import Link from "next/link";
import { notFound } from "next/navigation";
import { getCollection } from "@/lib/collections";
import UploadForm from "./UploadForm";
import PhotosGrid from "./PhotosGrid";

// Depends on live Supabase data and cookies — never prerender at build time.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const collection = await getCollection(slug);
  return { title: collection ? `Admin — ${collection.title}` : "Collection" };
}

export default async function AdminCollectionPage({
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
    <div className="page">
      <Link href="/admin" className="collection-back">
        ← Back to admin
      </Link>
      <div className="collection-header" style={{ marginTop: 18, marginBottom: 24 }}>
        <div>
          <div className="page-eyebrow">File No. {collection.fileNo}</div>
          <h1 className="page-title" style={{ marginBottom: 0, border: "none" }}>
            {collection.title}
          </h1>
        </div>
      </div>

      <UploadForm collectionId={collection.id} collectionSlug={collection.slug} />

      <div style={{ marginTop: 24 }}>
        <PhotosGrid
          photos={collection.photos}
          collectionId={collection.id}
          collectionSlug={collection.slug}
        />
      </div>
    </div>
  );
}

import Link from "next/link";
import { getCollections } from "@/lib/collections";

export const metadata = {
  title: "Collections — Alexandra Nikita",
};

// Data is live/mutable in Supabase — never prerender this at build time.
export const dynamic = "force-dynamic";

export default async function CollectionsPage() {
  const collections = await getCollections();

  return (
    <div className="page">
      <div className="page-eyebrow">Index</div>
      <h1 className="page-title">Collections</h1>
      {collections.length === 0 ? (
        <div className="empty-block">
          <span className="stamp-tag">No records</span>
          <p>Nothing has been filed here yet.</p>
        </div>
      ) : (
        <ul className="collections-list">
          {collections.map((c) => (
            <li key={c.slug}>
              <Link href={`/collections/${c.slug}`}>
                <span className="file-no">{c.fileNo}</span>
                <span>{c.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

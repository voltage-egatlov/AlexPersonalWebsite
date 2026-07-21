import Link from "next/link";
import { getCollections } from "@/lib/collections";

export const metadata = {
  title: "Collections — Alexandra Nikita",
};

export default async function CollectionsPage() {
  const collections = await getCollections();

  return (
    <div className="page">
      <div className="page-eyebrow">Index</div>
      <h1 className="page-title">Collections</h1>
      {collections.length === 0 ? (
        <p>No collections yet.</p>
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

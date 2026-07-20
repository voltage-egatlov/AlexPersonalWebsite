import Link from "next/link";
import { collections } from "@/data/collections";

export const metadata = {
  title: "Collections — Alexandra Nikita",
};

export default function CollectionsPage() {
  return (
    <div className="page">
      <div className="page-eyebrow">Index</div>
      <h1 className="page-title">Collections</h1>
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
    </div>
  );
}

import Link from "next/link";

export const metadata = {
  title: "Not Found — Alexandra Nikita",
};

export default function NotFound() {
  return (
    <div className="page">
      <div className="page-eyebrow">File Missing</div>
      <h1 className="page-title">Not Found</h1>
      <p>The page or collection you&apos;re looking for doesn&apos;t exist.</p>
      <Link href="/" className="action-button">
        Return home
      </Link>
    </div>
  );
}

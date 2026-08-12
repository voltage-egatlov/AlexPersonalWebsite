import Link from "next/link";

export const metadata = {
  title: "Not Found - Alexandra Nikita",
};

export default function NotFound() {
  return (
    <div className="page">
      <span className="stamp-tag">File No. 404</span>
      <h1 className="page-title">Missing From Record</h1>
      <p>The page you&apos;re looking for doesn&apos;t exist.</p>
      <Link href="/" className="action-button">
        Return home
      </Link>
    </div>
  );
}

import Link from "next/link";
import { getSectionCounts } from "@/lib/photos";
import { logout } from "./actions";

export const metadata = {
  title: "Admin — Alexandra Nikita",
};

// Depends on live Supabase data and cookies — never prerender at build time.
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const counts = await getSectionCounts();

  const sections = [
    {
      href: "/admin/photo",
      title: "Photo",
      meta: `${counts.photo} photo(s)`,
    },
    {
      href: "/admin/prints",
      title: "Prints",
      meta: `${counts.prints} photo(s)`,
    },
    {
      href: "/admin/about",
      title: "About & contact",
      meta: "Page copy",
    },
  ];

  return (
    <div className="page">
      <div className="admin-header">
        <div>
          <div className="page-eyebrow">Private</div>
          <h1 className="page-title page-title--plain">Admin</h1>
        </div>
        <form action={logout}>
          <button type="submit" className="admin-logout">
            Log out
          </button>
        </form>
      </div>

      <p className="admin-intro">
        The home page hero is whichever photo is marked &ldquo;Set as
        hero&rdquo; inside Photo or Prints.
      </p>

      <ul className="admin-list">
        {sections.map((s) => (
          <li key={s.href} className="admin-list-row">
            <Link href={s.href} className="admin-list-title">
              {s.title}
            </Link>
            <span className="admin-list-meta">{s.meta}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

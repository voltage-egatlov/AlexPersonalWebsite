import { getCollections } from "@/lib/collections";
import { createCollection, logout } from "./actions";
import CollectionsList from "./CollectionsList";

export const metadata = {
  title: "Admin — Alexandra Nikita",
};

// Depends on live Supabase data and cookies — never prerender at build time.
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const collections = await getCollections();

  return (
    <div className="page">
      <div className="admin-header">
        <div>
          <div className="page-eyebrow">Private</div>
          <h1 className="page-title" style={{ marginBottom: 0, border: "none" }}>
            Admin
          </h1>
        </div>
        <form action={logout}>
          <button type="submit" className="admin-logout">
            Log out
          </button>
        </form>
      </div>

      <form action={createCollection} className="admin-create-form">
        <input
          type="text"
          name="title"
          placeholder="New collection title"
          aria-label="New collection title"
          required
        />
        <button type="submit">Create</button>
      </form>

      {collections.length === 0 ? (
        <p>No collections yet — create one above.</p>
      ) : (
        <CollectionsList collections={collections} />
      )}
    </div>
  );
}

export default function Loading() {
  return (
    <div className="page">
      <div className="admin-header">
        <div>
          <div className="page-eyebrow">Private</div>
          <h1 className="page-title" style={{ marginBottom: 0, border: "none" }}>
            Admin
          </h1>
        </div>
      </div>

      <ul className="admin-list">
        {Array.from({ length: 3 }).map((_, i) => (
          <li key={i} className="admin-list-row">
            <div className="skeleton" style={{ flex: 1, height: 15, maxWidth: 140 }} />
            <div className="skeleton" style={{ width: 70, height: 12 }} />
          </li>
        ))}
      </ul>
    </div>
  );
}

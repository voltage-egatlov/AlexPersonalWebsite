export default function Loading() {
  return (
    <div className="page">
      <div className="skeleton" style={{ width: 130, height: 12, marginBottom: 18 }} />
      <div className="skeleton skeleton-eyebrow" style={{ marginTop: 18 }} />
      <div className="skeleton skeleton-title" style={{ marginBottom: 24 }} />

      <div className="admin-dropzone" style={{ borderStyle: "solid" }}>
        <div className="skeleton" style={{ height: 16, maxWidth: 260, margin: "0 auto" }} />
      </div>

      <ul className="admin-photo-grid" style={{ marginTop: 24 }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <li key={i} className="admin-photo-tile">
            <div className="admin-photo-image skeleton" />
          </li>
        ))}
      </ul>
    </div>
  );
}

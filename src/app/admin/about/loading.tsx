export default function Loading() {
  return (
    <div className="page">
      <div className="skeleton" style={{ width: 130, height: 12, marginBottom: 18 }} />
      <div className="skeleton skeleton-eyebrow" style={{ marginTop: 18 }} />
      <div className="skeleton skeleton-title" style={{ marginBottom: 24 }} />

      <div className="admin-about-form">
        <div className="skeleton" style={{ height: 190 }} />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton skeleton-field" />
        ))}
      </div>
    </div>
  );
}

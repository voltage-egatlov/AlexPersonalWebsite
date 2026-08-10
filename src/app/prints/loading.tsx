export default function Loading() {
  return (
    <div>
      <div className="page" style={{ paddingBottom: 32 }}>
        <div className="skeleton skeleton-eyebrow" />
        <div className="skeleton skeleton-title" style={{ marginBottom: 0 }} />
      </div>
      <div className="tile-grid">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="tile skeleton" />
        ))}
      </div>
    </div>
  );
}

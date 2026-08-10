export default function Loading() {
  return (
    <div className="page">
      <div className="skeleton skeleton-eyebrow" />
      <div className="skeleton skeleton-title" />
      <div className="skeleton skeleton-line" style={{ width: "100%" }} />
      <div className="skeleton skeleton-line" style={{ width: "92%" }} />
      <div className="skeleton skeleton-line" style={{ width: "78%" }} />
      <div className="contact-block" style={{ marginTop: 28, gap: 22 }}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="skeleton" style={{ height: 34, maxWidth: 220 }} />
        ))}
      </div>
    </div>
  );
}

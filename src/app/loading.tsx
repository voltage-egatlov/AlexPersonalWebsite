export default function Loading() {
  return (
    <div className="home-hero">
      <div className="home-hero-empty skeleton" />
      <div className="home-hero-caption">
        <div className="skeleton" style={{ width: 160, height: 22, marginBottom: 8 }} />
        <div className="skeleton" style={{ width: 90, height: 11 }} />
      </div>
    </div>
  );
}

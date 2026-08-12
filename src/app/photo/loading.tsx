// Approximates the real justified-row gallery (varied tile widths via
// flex-grow) rather than a uniform grid, so there's no shape jump once
// photos - each at their own aspect ratio - actually load.
const SKELETON_ROWS = [
  [1.6, 1, 1.3],
  [1, 1, 1, 1.2],
  [1.8, 1, 1.1],
];

export default function Loading() {
  return (
    <div>
      <div className="page" style={{ paddingBottom: 32 }}>
        <div className="skeleton skeleton-eyebrow" />
        <div className="skeleton skeleton-title" style={{ marginBottom: 0 }} />
      </div>
      <div className="tile-grid" style={{ gap: 6 }}>
        {SKELETON_ROWS.map((row, ri) => (
          <div key={ri} className="tile-row" style={{ gap: 6, height: 220 }}>
            {row.map((flex, ti) => (
              <div
                key={ti}
                className="tile skeleton"
                style={{ flexGrow: flex, flexBasis: 0, minWidth: 0 }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

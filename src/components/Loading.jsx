export default function Loading({ label = "Carregando…", role = "status" }) {
  return (
    <div className="loading" role={role} aria-live="polite">
      <span className="spinner" aria-hidden />
      <span>{label}</span>
    </div>
  );
}

export function Skeleton({ tall = false }) {
  return (
    <div className={`skeleton-block${tall ? " tall" : ""}`} aria-hidden />
  );
}

export function SkeletonGrid({ count = 8 }) {
  return (
    <div className="skeleton-grid" aria-hidden>
      {Array.from({ length: count }).map((_, i) => (
        <div className="skeleton-card" key={i}>
          <div className="skeleton-img" />
          <div className="skeleton-line" style={{ width: "70%" }} />
          <div className="skeleton-line" style={{ width: "92%" }} />
          <div className="skeleton-line" style={{ width: "50%" }} />
        </div>
      ))}
    </div>
  );
}

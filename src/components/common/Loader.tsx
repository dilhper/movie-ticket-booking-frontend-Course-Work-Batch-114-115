interface LoaderProps {
  label?: string;
  fullPage?: boolean;
}

export function Loader({ label = 'Loading…', fullPage = false }: LoaderProps) {
  return (
    <div className={`d-flex flex-column align-items-center justify-content-center gap-3 text-muted ${fullPage ? 'min-vh-75' : 'py-5'}`} role="status">
      <div className="spinner-border text-primary" style={{ width: '2.5rem', height: '2.5rem' }} aria-hidden />
      <span className="small">{label}</span>
    </div>
  );
}

/** Shimmering placeholder grid used while movie/show lists load. */
export function SkeletonGrid({ count = 8, variant = 'poster' }: { count?: number; variant?: 'poster' | 'row' }) {
  if (variant === 'row') {
    return (
      <div className="d-flex flex-column gap-3" aria-hidden>
        {Array.from({ length: count }, (_, i) => (
          <div key={i} className="skeleton" style={{ height: 110 }} />
        ))}
      </div>
    );
  }
  return (
    <div className="row g-4" aria-hidden>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="col-6 col-md-4 col-lg-3">
          <div className="skeleton" style={{ aspectRatio: '2 / 3' }} />
          <div className="skeleton mt-3" style={{ height: 18, width: '70%' }} />
          <div className="skeleton mt-2" style={{ height: 12, width: '45%' }} />
        </div>
      ))}
    </div>
  );
}

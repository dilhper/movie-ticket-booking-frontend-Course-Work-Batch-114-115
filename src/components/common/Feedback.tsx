import type { ReactNode } from 'react';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
  title?: string;
}

export function ErrorState({ message, onRetry, title = 'Something went wrong' }: ErrorStateProps) {
  return (
    <div className="alert-cine p-4 d-flex flex-column flex-sm-row align-items-sm-center gap-3 fade-in-up" role="alert">
      <i className="bi bi-exclamation-octagon fs-2 text-danger" aria-hidden />
      <div className="flex-grow-1">
        <div className="fw-semibold text-white">{title}</div>
        <div className="small">{message}</div>
      </div>
      {onRetry && (
        <button type="button" className="btn btn-outline-light btn-sm" onClick={onRetry}>
          <i className="bi bi-arrow-clockwise me-1" /> Retry
        </button>
      )}
    </div>
  );
}

interface EmptyStateProps {
  icon?: string;
  title: string;
  message?: string;
  action?: ReactNode;
}

export function EmptyState({ icon = 'bi-film', title, message, action }: EmptyStateProps) {
  return (
    <div className="empty-state card-cine fade-in-up">
      <div className="empty-icon">
        <i className={`bi ${icon}`} aria-hidden />
      </div>
      <h3 className="h5 fw-bold">{title}</h3>
      {message && <p className="text-muted mb-4 mx-auto" style={{ maxWidth: 420 }}>{message}</p>}
      {action}
    </div>
  );
}

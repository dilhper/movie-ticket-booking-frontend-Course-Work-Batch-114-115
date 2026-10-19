import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface Crumb {
  label: string;
  to?: string;
}

interface PageHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  crumbs?: Crumb[];
  actions?: ReactNode;
}

export function PageHeader({ title, subtitle, crumbs, actions }: PageHeaderProps) {
  return (
    <header className="page-header fade-in-up">
      {crumbs && (
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb mb-2">
            {crumbs.map((c) => (
              <li key={c.label} className={`breadcrumb-item ${c.to ? '' : 'active'}`}>
                {c.to ? <Link to={c.to}>{c.label}</Link> : c.label}
              </li>
            ))}
          </ol>
        </nav>
      )}
      <div className="d-flex flex-column flex-md-row align-items-md-end justify-content-between gap-3">
        <div>
          <h1 className="mb-1">{title}</h1>
          {subtitle && <p className="text-muted mb-0">{subtitle}</p>}
        </div>
        {actions && <div className="d-flex gap-2 flex-wrap">{actions}</div>}
      </div>
    </header>
  );
}

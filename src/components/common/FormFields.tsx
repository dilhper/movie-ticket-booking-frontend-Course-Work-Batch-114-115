import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';

interface BaseProps {
  id: string;
  label: ReactNode;
  error?: string;
  hint?: ReactNode;
  icon?: string;
  className?: string;
}

/** Labeled input with inline validation feedback. */
export function TextField({ id, label, error, hint, icon, className = '', ...rest }: BaseProps & InputHTMLAttributes<HTMLInputElement>) {
  const input = (
    <input
      id={id}
      className={`form-control ${error ? 'is-invalid' : ''}`}
      aria-invalid={!!error}
      aria-describedby={error ? `${id}-error` : undefined}
      {...rest}
    />
  );
  return (
    <div className={className}>
      <label htmlFor={id} className="form-label">{label}</label>
      {icon ? (
        <div className="input-icon">
          <i className={`bi ${icon}`} aria-hidden />
          {input}
        </div>
      ) : (
        input
      )}
      {error ? (
        <div id={`${id}-error`} className="invalid-feedback d-block">{error}</div>
      ) : (
        hint && <div className="form-text text-muted small">{hint}</div>
      )}
    </div>
  );
}

export function SelectField({ id, label, error, icon, className = '', children, ...rest }: BaseProps & SelectHTMLAttributes<HTMLSelectElement>) {
  const select = (
    <select id={id} className={`form-select ${error ? 'is-invalid' : ''}`} aria-invalid={!!error} {...rest}>
      {children}
    </select>
  );
  return (
    <div className={className}>
      <label htmlFor={id} className="form-label">{label}</label>
      {icon ? (
        <div className="input-icon">
          <i className={`bi ${icon}`} aria-hidden />
          {select}
        </div>
      ) : (
        select
      )}
      {error && <div className="invalid-feedback d-block">{error}</div>}
    </div>
  );
}

export function TextAreaField({ id, label, error, className = '', ...rest }: BaseProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div className={className}>
      <label htmlFor={id} className="form-label">{label}</label>
      <textarea id={id} className={`form-control ${error ? 'is-invalid' : ''}`} aria-invalid={!!error} {...rest} />
      {error && <div className="invalid-feedback d-block">{error}</div>}
    </div>
  );
}

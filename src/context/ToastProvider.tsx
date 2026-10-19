import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react';
import { ToastContext, type Toast, type ToastInput } from './toastContext';

const ICONS: Record<Toast['type'], string> = {
  success: 'bi-check-circle-fill',
  danger: 'bi-x-octagon-fill',
  warning: 'bi-exclamation-triangle-fill',
  info: 'bi-info-circle-fill',
};

/** Global, accessible toast notifications for success / failure feedback. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id: number) => setToasts((list) => list.filter((t) => t.id !== id)), []);

  const showToast = useCallback(
    (toast: ToastInput) => {
      const id = ++idRef.current;
      setToasts((list) => [...list.slice(-3), { ...toast, id }]);
      window.setTimeout(() => dismiss(id), toast.durationMs ?? 4500);
    },
    [dismiss],
  );

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-stack" aria-live="polite" aria-atomic="false">
        {toasts.map((t) => (
          <div key={t.id} className={`app-toast app-toast-${t.type}`} role="status">
            <i className={`bi ${ICONS[t.type]} app-toast-icon`} aria-hidden />
            <div className="flex-grow-1">
              {t.title && <div className="fw-semibold">{t.title}</div>}
              <div className="small opacity-75">{t.message}</div>
            </div>
            <button type="button" className="btn-close btn-close-white btn-sm" aria-label="Dismiss" onClick={() => dismiss(t.id)} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

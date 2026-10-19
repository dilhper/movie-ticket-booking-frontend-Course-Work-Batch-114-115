import { useEffect, useId, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
  open: boolean;
  title: ReactNode;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const WIDTHS = { sm: 420, md: 560, lg: 780 };

/** Accessible, React-controlled modal (no Bootstrap JS needed). Closes on Esc / backdrop click. */
export function Modal({ open, title, onClose, children, footer, size = 'md' }: ModalProps) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="modal-cine-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-cine" role="dialog" aria-modal="true" aria-labelledby={titleId} style={{ maxWidth: WIDTHS[size] }}>
        <div className="modal-cine-header">
          <h2 id={titleId} className="h5 fw-bold m-0">{title}</h2>
          <button type="button" className="btn-close btn-close-white" aria-label="Close" onClick={onClose} />
        </div>
        <div className="modal-cine-body">{children}</div>
        {footer && <div className="modal-cine-footer">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: ReactNode;
  confirmLabel?: string;
  tone?: 'danger' | 'primary';
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ open, title, message, confirmLabel = 'Confirm', tone = 'danger', busy, onConfirm, onCancel }: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      title={title}
      onClose={busy ? () => undefined : onCancel}
      size="sm"
      footer={
        <>
          <button type="button" className="btn btn-glass" onClick={onCancel} disabled={busy}>
            Keep it
          </button>
          <button type="button" id="confirm-dialog-confirm" className={`btn ${tone === 'danger' ? 'btn-danger' : 'btn-gradient'}`} onClick={onConfirm} disabled={busy}>
            {busy && <span className="spinner-border spinner-border-sm me-2" aria-hidden />}
            {confirmLabel}
          </button>
        </>
      }
    >
      <div className="text-muted">{message}</div>
    </Modal>
  );
}

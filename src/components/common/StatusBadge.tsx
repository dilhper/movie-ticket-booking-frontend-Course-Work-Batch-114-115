import type { BookingStatus, PaymentStatus } from '../../types';

const TONES: Record<BookingStatus | PaymentStatus, { tone: string; label: string }> = {
  CONFIRMED: { tone: 'success', label: 'Confirmed' },
  PENDING: { tone: 'warning', label: 'Pending' },
  CANCELLED: { tone: 'danger', label: 'Cancelled' },
  SUCCESS: { tone: 'success', label: 'Paid' },
  FAILED: { tone: 'danger', label: 'Failed' },
  REFUNDED: { tone: 'info', label: 'Refunded' },
};

interface StatusBadgeProps {
  status: BookingStatus | PaymentStatus | undefined | null;
  /** Prefix to disambiguate e.g. "Payment: Pending" */
  prefix?: string;
}

export function StatusBadge({ status, prefix }: StatusBadgeProps) {
  if (!status) return <span className="status-badge status-muted">{prefix ? `${prefix}: ` : ''}N/A</span>;
  const { tone, label } = TONES[status] ?? { tone: 'muted', label: status };
  return (
    <span className={`status-badge status-${tone}`}>
      {prefix ? `${prefix}: ` : ''}
      {label}
    </span>
  );
}

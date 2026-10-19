import { config } from '../config';
import type { Booking, Show } from '../types';

const currencyFormatter = new Intl.NumberFormat(config.locale, {
  style: 'currency',
  currency: config.currency,
  maximumFractionDigits: 2,
  minimumFractionDigits: 0,
});

export const formatCurrency = (amount: number): string => currencyFormatter.format(amount ?? 0);

/** Parse a YYYY-MM-DD string as a *local* date (avoids the UTC off-by-one bug). */
export const parseLocalDate = (isoDate: string): Date => {
  const [y, m, d] = isoDate.split('-').map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
};

export const toLocalDateString = (date: Date): string => {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

export const todayString = (): string => toLocalDateString(new Date());

export const addDays = (date: Date, days: number): Date => {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
};

/** Next `count` days starting today as YYYY-MM-DD strings. */
export const upcomingDates = (count = 7): string[] =>
  Array.from({ length: count }, (_, i) => toLocalDateString(addDays(new Date(), i)));

export const formatDate = (isoDate: string, opts: Intl.DateTimeFormatOptions = {}): string =>
  parseLocalDate(isoDate).toLocaleDateString(config.locale, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    ...opts,
  });

export const formatLongDate = (isoDate: string): string =>
  formatDate(isoDate, { weekday: 'long', year: 'numeric', month: 'long' });

export const formatDateTime = (iso: string): string =>
  new Date(iso).toLocaleString(config.locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

export const formatTime = (hhmm: string): string => {
  const [h, m] = hhmm.split(':').map(Number);
  const date = new Date();
  date.setHours(h ?? 0, m ?? 0, 0, 0);
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
};

export const formatDuration = (minutes: number): string => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h ? `${h}h ${m.toString().padStart(2, '0')}m` : `${m}m`;
};

export const dayLabel = (isoDate: string): { top: string; day: string; month: string } => {
  const date = parseLocalDate(isoDate);
  const today = todayString();
  const tomorrow = toLocalDateString(addDays(new Date(), 1));
  const top =
    isoDate === today
      ? 'Today'
      : isoDate === tomorrow
        ? 'Tomorrow'
        : date.toLocaleDateString('en-US', { weekday: 'short' });
  return {
    top,
    day: String(date.getDate()),
    month: date.toLocaleDateString('en-US', { month: 'short' }),
  };
};

// show helpers

export const showStartDate = (show: Pick<Show, 'showDate' | 'showTime'>): Date => {
  const date = parseLocalDate(show.showDate);
  const [h, m] = show.showTime.split(':').map(Number);
  date.setHours(h ?? 0, m ?? 0, 0, 0);
  return date;
};

export const isShowUpcoming = (show: Pick<Show, 'showDate' | 'showTime'>): boolean =>
  showStartDate(show).getTime() > Date.now();

export const occupancyPercent = (show: Pick<Show, 'totalSeats' | 'availableSeats'>): number =>
  show.totalSeats ? Math.round(((show.totalSeats - show.availableSeats) / show.totalSeats) * 100) : 0;

export const availabilityTone = (show: Pick<Show, 'totalSeats' | 'availableSeats'>): 'success' | 'warning' | 'danger' => {
  const ratio = show.totalSeats ? show.availableSeats / show.totalSeats : 0;
  if (ratio <= 0.15) return 'danger';
  if (ratio <= 0.45) return 'warning';
  return 'success';
};

// booking helpers

/** A booking can be cancelled while it is active and the show is far enough in the future. */
export const canCancelBooking = (booking: Booking): boolean => {
  if (booking.status === 'CANCELLED' || !booking.show) return false;
  const cutoff = config.cancellationCutoffHours * 60 * 60 * 1000;
  return showStartDate(booking.show).getTime() - Date.now() > cutoff;
};

export const rowLabel = (index: number): string => {
  // A..Z, then AA, AB ... for very large halls
  let label = '';
  let n = index;
  do {
    label = String.fromCharCode(65 + (n % 26)) + label;
    n = Math.floor(n / 26) - 1;
  } while (n >= 0);
  return label;
};

/** Sort seat numbers like A1, A2, A10, B1 naturally. */
export const sortSeats = (seats: string[]): string[] =>
  [...seats].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

export const initials = (name = ''): string =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');

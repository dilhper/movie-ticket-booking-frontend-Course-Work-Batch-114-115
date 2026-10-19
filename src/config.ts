/**
 * Central runtime configuration. Values come from Vite env variables
 * (see `.env.example`) so the app can be pointed at any backend without code changes.
 */
const env = import.meta.env;

export const config = {
  /** Base URL of the Movie Ticket Booking REST API, e.g. http://localhost:8080/api */
  apiBaseUrl: env.VITE_API_BASE_URL ?? 'http://localhost:8080/api',
  /** When true, requests are served by the in-browser mock backend (no server required). */
  useMockApi: (env.VITE_USE_MOCK_API ?? 'true').toLowerCase() === 'true',
  currency: env.VITE_CURRENCY ?? 'LKR',
  locale: env.VITE_LOCALE ?? 'en-LK',
  /** Bookings can be cancelled only up to this many hours before the show starts. */
  cancellationCutoffHours: Number(env.VITE_CANCELLATION_CUTOFF_HOURS ?? 2),
  maxSeatsPerBooking: Number(env.VITE_MAX_SEATS_PER_BOOKING ?? 10),
  appName: 'CineBook',
} as const;

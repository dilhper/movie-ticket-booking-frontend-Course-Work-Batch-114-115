/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_USE_MOCK_API?: string;
  readonly VITE_CURRENCY?: string;
  readonly VITE_LOCALE?: string;
  readonly VITE_CANCELLATION_CUTOFF_HOURS?: string;
  readonly VITE_MAX_SEATS_PER_BOOKING?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

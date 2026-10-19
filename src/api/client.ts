import axios, { type AxiosError } from 'axios';
import { config } from '../config';
import { tokenStorage } from '../utils/tokenStorage';
import { mockAdapter } from './mock/mockAdapter';

/**
 * Single Axios instance used by every service.
 * - Attaches `Authorization: Bearer <jwt>` to each request.
 * - On 401 clears the session and notifies the AuthProvider.
 * - When VITE_USE_MOCK_API=true, a custom adapter serves requests from an
 *   in-browser mock backend so the UI is fully usable without a server.
 */
export const apiClient = axios.create({
  baseURL: config.apiBaseUrl,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
  ...(config.useMockApi ? { adapter: mockAdapter } : {}),
});

let unauthorizedHandler: (() => void) | null = null;

/** Registered by the AuthProvider so the interceptor can trigger a logout. */
export const setUnauthorizedHandler = (handler: (() => void) | null) => {
  unauthorizedHandler = handler;
};

apiClient.interceptors.request.use((request) => {
  const token = tokenStorage.getToken();
  if (token) request.headers.Authorization = `Bearer ${token}`;
  return request;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const isAuthEndpoint = error.config?.url?.includes('/auth/');
    if (error.response?.status === 401 && !isAuthEndpoint) {
      tokenStorage.clear();
      unauthorizedHandler?.();
    }
    return Promise.reject(error);
  },
);

// response normalisation

/** Accepts either a raw payload or a `{ data: payload }` / `{ success, data }` envelope. */
export function unwrap<T>(body: unknown): T {
  if (body && typeof body === 'object' && !Array.isArray(body) && 'data' in body) {
    return (body as { data: T }).data;
  }
  return body as T;
}

/** Accepts arrays, `{ data: [] }`, or Spring Page objects `{ content: [] }`. */
export function unwrapList<T>(body: unknown): T[] {
  const value = unwrap<unknown>(body);
  if (Array.isArray(value)) return value as T[];
  if (value && typeof value === 'object' && 'content' in value && Array.isArray((value as { content: unknown }).content)) {
    return (value as { content: T[] }).content;
  }
  return [];
}

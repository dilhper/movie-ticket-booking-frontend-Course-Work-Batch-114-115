import { isAxiosError } from 'axios';

interface ErrorBody {
  message?: string;
  error?: string;
  detail?: string;
  errors?: Record<string, string> | string[] | { defaultMessage?: string; message?: string }[];
}

/** Extract a human-friendly message from any thrown value (Axios, Error, string). */
export const getErrorMessage = (error: unknown, fallback = 'Something went wrong. Please try again.'): string => {
  if (isAxiosError(error)) {
    if (error.code === 'ECONNABORTED') return 'The request timed out. Please try again.';
    if (!error.response) return 'Cannot reach the server. Check your connection or that the backend is running.';

    const body = error.response.data as ErrorBody | string | undefined;
    if (typeof body === 'string' && body.trim()) return body;
    if (body && typeof body === 'object') {
      if (Array.isArray(body.errors) && body.errors.length) {
        const first = body.errors[0];
        return typeof first === 'string' ? first : (first.defaultMessage ?? first.message ?? fallback);
      }
      if (body.errors && typeof body.errors === 'object' && !Array.isArray(body.errors)) {
        const first = Object.values(body.errors)[0];
        if (first) return first;
      }
      if (body.message) return body.message;
      if (body.detail) return body.detail;
      if (body.error) return body.error;
    }

    switch (error.response.status) {
      case 400: return 'The request was invalid.';
      case 401: return 'Your session has expired. Please sign in again.';
      case 403: return 'You do not have permission to perform this action.';
      case 404: return 'The requested resource was not found.';
      case 409: return 'This action conflicts with the current state. Please refresh.';
      default: return fallback;
    }
  }
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === 'string') return error;
  return fallback;
};

export const getErrorStatus = (error: unknown): number | undefined =>
  isAxiosError(error) ? error.response?.status : undefined;

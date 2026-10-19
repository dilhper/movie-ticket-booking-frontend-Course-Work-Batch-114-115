import type { Role } from '../types';

export interface JwtPayload {
  sub?: string;
  userId?: number;
  role?: Role | string;
  roles?: string[];
  name?: string;
  exp?: number;
  iat?: number;
  [key: string]: unknown;
}

const base64UrlDecode = (input: string): string => {
  const base64 = input.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  // Handle UTF-8 payloads correctly
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
};

export const base64UrlEncode = (input: string): string => {
  const bytes = new TextEncoder().encode(input);
  let binary = '';
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

/** Decode (NOT verify) a JWT – verification is always the backend's responsibility. */
export const decodeJwt = (token: string): JwtPayload | null => {
  try {
    const [, payload] = token.split('.');
    if (!payload) return null;
    return JSON.parse(base64UrlDecode(payload)) as JwtPayload;
  } catch {
    return null;
  }
};

/** Expired when `exp` is in the past (with a small clock-skew buffer). */
export const isTokenExpired = (token: string, skewSeconds = 10): boolean => {
  const payload = decodeJwt(token);
  if (!payload) return true;
  if (!payload.exp) return false; // backend issued a non-expiring token
  return payload.exp * 1000 <= Date.now() + skewSeconds * 1000;
};

/** Normalise role claims from common backend formats (role, roles[], ROLE_ADMIN …). */
export const roleFromPayload = (payload: JwtPayload | null): Role | null => {
  if (!payload) return null;
  const raw = [payload.role, ...(payload.roles ?? [])].filter(Boolean).map((r) => String(r).toUpperCase());
  if (raw.some((r) => r.includes('ADMIN'))) return 'ADMIN';
  if (raw.length) return 'CUSTOMER';
  return null;
};

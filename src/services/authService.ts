import { apiClient, unwrap } from '../api/client';
import type { AuthResponse, LoginRequest, RegisterRequest, User } from '../types';
import { decodeJwt, roleFromPayload } from '../utils/jwt';

/**
 * Normalise auth responses. Supports `{ token, user }` and flatter shapes such as
 * `{ token, id, name, email, role }` or `{ accessToken }` that many backends return.
 */
const normaliseAuth = (body: unknown): AuthResponse => {
  const data = unwrap<Record<string, unknown>>(body) ?? {};
  const token = String(data.token ?? data.accessToken ?? data.jwt ?? '');
  if (!token) throw new Error('The server did not return an authentication token.');

  const payload = decodeJwt(token);
  const rawUser = (data.user as Partial<User> | undefined) ?? (data as Partial<User>);
  const user: User = {
    id: Number(rawUser.id ?? payload?.userId ?? 0),
    name: String(rawUser.name ?? payload?.name ?? rawUser.email ?? payload?.sub ?? 'User'),
    email: String(rawUser.email ?? payload?.sub ?? ''),
    phone: rawUser.phone,
    role: (String(rawUser.role ?? '').toUpperCase().includes('ADMIN') ? 'ADMIN' : null) ?? roleFromPayload(payload) ?? 'CUSTOMER',
    createdAt: rawUser.createdAt,
  };
  return { token, user };
};

export const authService = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const { data } = await apiClient.post('/auth/login', credentials);
    return normaliseAuth(data);
  },

  async register(payload: RegisterRequest): Promise<AuthResponse> {
    const { data } = await apiClient.post('/auth/register', payload);
    return normaliseAuth(data);
  },
};

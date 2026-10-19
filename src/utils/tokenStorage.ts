import type { User } from '../types';
import { isTokenExpired } from './jwt';

/**
 * Token persistence strategy
 * ---------------------------------------------------------------
 * - By default the JWT lives in `sessionStorage`, so it is wiped when the tab closes.
 * - "Remember me" opts into `localStorage` for a persistent session.
 * - Expired tokens are discarded on read, and the axios interceptor clears
 *   storage on any 401 response.
 * - All rendered content goes through React (auto-escaped) which mitigates XSS
 *   token theft. If the backend supports it, an httpOnly cookie is even safer.
 */
const TOKEN_KEY = 'cinebook.token';
const USER_KEY = 'cinebook.user';

const stores = (): Storage[] => [sessionStorage, localStorage];

const read = (key: string): string | null => {
  for (const store of stores()) {
    const value = store.getItem(key);
    if (value) return value;
  }
  return null;
};

export const tokenStorage = {
  save(token: string, user: User, remember: boolean) {
    this.clear();
    const store = remember ? localStorage : sessionStorage;
    store.setItem(TOKEN_KEY, token);
    store.setItem(USER_KEY, JSON.stringify(user));
  },

  updateUser(user: User) {
    for (const store of stores()) {
      if (store.getItem(TOKEN_KEY)) store.setItem(USER_KEY, JSON.stringify(user));
    }
  },

  getToken(): string | null {
    const token = read(TOKEN_KEY);
    if (token && isTokenExpired(token)) {
      this.clear();
      return null;
    }
    return token;
  },

  getUser(): User | null {
    const raw = read(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  },

  clear() {
    for (const store of stores()) {
      store.removeItem(TOKEN_KEY);
      store.removeItem(USER_KEY);
    }
  },
};

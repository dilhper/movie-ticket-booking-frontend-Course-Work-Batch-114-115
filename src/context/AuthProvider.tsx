import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { setUnauthorizedHandler } from '../api/client';
import { authService } from '../services/authService';
import type { RegisterRequest, User } from '../types';
import { tokenStorage } from '../utils/tokenStorage';
import { AuthContext, type AuthContextValue } from './authContext';
import { useToast } from '../hooks/useToast';

/** Restore a session synchronously so protected routes don't flash on reload. */
const restoreUser = (): User | null => (tokenStorage.getToken() ? tokenStorage.getUser() : null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(restoreUser);
  const { showToast } = useToast();

  const logout = useCallback(
    (reason?: string) => {
      tokenStorage.clear();
      setUser(null);
      if (reason) showToast({ type: 'warning', title: 'Signed out', message: reason });
    },
    [showToast],
  );

  // Let the axios interceptor end the session when the backend returns 401
  useEffect(() => {
    setUnauthorizedHandler(() => logout('Your session has expired. Please sign in again.'));
    return () => setUnauthorizedHandler(null);
  }, [logout]);

  // Auto-logout exactly when the JWT expires
  useEffect(() => {
    if (!user) return;
    const timer = window.setInterval(() => {
      if (!tokenStorage.getToken()) logout('Your session has expired. Please sign in again.');
    }, 30_000);
    return () => window.clearInterval(timer);
  }, [user, logout]);

  const login = useCallback(async (email: string, password: string, remember: boolean) => {
    const { token, user: loggedIn } = await authService.login({ email: email.trim(), password });
    tokenStorage.save(token, loggedIn, remember);
    setUser(loggedIn);
    return loggedIn;
  }, []);

  const register = useCallback(async (payload: RegisterRequest) => {
    const { token, user: created } = await authService.register(payload);
    tokenStorage.save(token, created, false);
    setUser(created);
    return created;
  }, []);

  const updateUser = useCallback((next: User) => {
    tokenStorage.updateUser(next);
    setUser(next);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'ADMIN',
      login,
      register,
      logout,
      updateUser,
    }),
    [user, login, register, logout, updateUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

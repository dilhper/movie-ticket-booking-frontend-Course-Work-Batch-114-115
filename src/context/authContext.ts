import { createContext } from 'react';
import type { RegisterRequest, User } from '../types';

export interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string, remember: boolean) => Promise<User>;
  register: (payload: RegisterRequest) => Promise<User>;
  logout: (reason?: string) => void;
  updateUser: (user: User) => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

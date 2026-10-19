import { createContext } from 'react';

export type ToastType = 'success' | 'danger' | 'warning' | 'info';

export interface ToastInput {
  type: ToastType;
  message: string;
  title?: string;
  durationMs?: number;
}

export interface Toast extends ToastInput {
  id: number;
}

export interface ToastContextValue {
  showToast: (toast: ToastInput) => void;
}

export const ToastContext = createContext<ToastContextValue | null>(null);

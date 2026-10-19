import { apiClient, unwrap, unwrapList } from '../api/client';
import type { Payment, PaymentRequest } from '../types';

export const paymentService = {
  async pay(payload: PaymentRequest): Promise<Payment> {
    const { data } = await apiClient.post('/payments', payload);
    return unwrap<Payment>(data);
  },

  async getMine(): Promise<Payment[]> {
    const { data } = await apiClient.get('/payments/my');
    return unwrapList<Payment>(data);
  },

  async getForBooking(bookingId: number | string): Promise<Payment[]> {
    const { data } = await apiClient.get(`/payments/booking/${bookingId}`);
    const body = unwrap<Payment | Payment[]>(data);
    return Array.isArray(body) ? body : body ? [body] : [];
  },

  // admin

  async getAll(): Promise<Payment[]> {
    const { data } = await apiClient.get('/payments');
    return unwrapList<Payment>(data);
  },
};

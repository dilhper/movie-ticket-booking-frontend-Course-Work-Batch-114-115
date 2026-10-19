import { apiClient, unwrap, unwrapList } from '../api/client';
import type { Booking, CreateBookingRequest } from '../types';

export const bookingService = {
  async create(payload: CreateBookingRequest): Promise<Booking> {
    const { data } = await apiClient.post('/bookings', payload);
    return unwrap<Booking>(data);
  },

  async getMine(): Promise<Booking[]> {
    const { data } = await apiClient.get('/bookings/my');
    return unwrapList<Booking>(data);
  },

  async getById(id: number | string): Promise<Booking> {
    const { data } = await apiClient.get(`/bookings/${id}`);
    return unwrap<Booking>(data);
  },

  async cancel(id: number): Promise<Booking> {
    const { data } = await apiClient.put(`/bookings/${id}/cancel`);
    return unwrap<Booking>(data);
  },

  // admin

  async getAll(): Promise<Booking[]> {
    const { data } = await apiClient.get('/bookings');
    return unwrapList<Booking>(data);
  },
};

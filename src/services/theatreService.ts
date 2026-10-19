import { apiClient, unwrap, unwrapList } from '../api/client';
import type { Theatre, TheatrePayload } from '../types';

export const theatreService = {
  async getAll(params: { city?: string; search?: string } = {}): Promise<Theatre[]> {
    const { data } = await apiClient.get('/theatres', { params });
    return unwrapList<Theatre>(data);
  },

  async getById(id: number | string): Promise<Theatre> {
    const { data } = await apiClient.get(`/theatres/${id}`);
    return unwrap<Theatre>(data);
  },

  async create(payload: TheatrePayload): Promise<Theatre> {
    const { data } = await apiClient.post('/theatres', payload);
    return unwrap<Theatre>(data);
  },

  async update(id: number, payload: TheatrePayload): Promise<Theatre> {
    const { data } = await apiClient.put(`/theatres/${id}`, payload);
    return unwrap<Theatre>(data);
  },

  async remove(id: number): Promise<void> {
    await apiClient.delete(`/theatres/${id}`);
  },
};

import { apiClient, unwrap, unwrapList } from '../api/client';
import type { Movie, MoviePayload } from '../types';

export interface MovieQuery {
  search?: string;
  genre?: string;
  language?: string;
}

export const movieService = {
  async getAll(query: MovieQuery = {}): Promise<Movie[]> {
    const { data } = await apiClient.get('/movies', { params: query });
    return unwrapList<Movie>(data);
  },

  async getById(id: number | string): Promise<Movie> {
    const { data } = await apiClient.get(`/movies/${id}`);
    return unwrap<Movie>(data);
  },

  async create(payload: MoviePayload): Promise<Movie> {
    const { data } = await apiClient.post('/movies', payload);
    return unwrap<Movie>(data);
  },

  async update(id: number, payload: MoviePayload): Promise<Movie> {
    const { data } = await apiClient.put(`/movies/${id}`, payload);
    return unwrap<Movie>(data);
  },

  async remove(id: number): Promise<void> {
    await apiClient.delete(`/movies/${id}`);
  },
};

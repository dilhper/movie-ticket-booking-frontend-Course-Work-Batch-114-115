import { apiClient, unwrap, unwrapList } from '../api/client';
import type { ApiMessage, ChangePasswordRequest, UpdateProfileRequest, User } from '../types';

export const userService = {
  async getMe(): Promise<User> {
    const { data } = await apiClient.get('/users/me');
    return unwrap<User>(data);
  },

  async updateMe(payload: UpdateProfileRequest): Promise<User> {
    const { data } = await apiClient.put('/users/me', payload);
    return unwrap<User>(data);
  },

  async changePassword(payload: ChangePasswordRequest): Promise<ApiMessage> {
    const { data } = await apiClient.put('/users/me/password', payload);
    return unwrap<ApiMessage>(data);
  },

  // admin

  async getAll(): Promise<User[]> {
    const { data } = await apiClient.get('/users');
    return unwrapList<User>(data);
  },

  async remove(id: number): Promise<void> {
    await apiClient.delete(`/users/${id}`);
  },
};

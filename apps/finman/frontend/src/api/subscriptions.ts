import { Subscription } from '../types';
import { ApiClient } from './client';

const client = new ApiClient();

export const subscriptionsApi = {
  async getAll(): Promise<Subscription[]> {
    return client.get<Subscription[]>('/api/subscriptions');
  },

  async getById(id: string): Promise<Subscription> {
    return client.get<Subscription>(`/api/subscriptions/${id}`);
  },

  async create(subscription: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>): Promise<Subscription> {
    return client.post<Subscription>('/api/subscriptions', subscription);
  },

  async update(id: string, subscription: Partial<Subscription>): Promise<Subscription> {
    return client.put<Subscription>(`/api/subscriptions/${id}`, subscription);
  },

  async delete(id: string): Promise<void> {
    return client.delete(`/api/subscriptions/${id}`);
  },
};

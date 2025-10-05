import { Subscription } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

export const subscriptionsApi = {
  async getAll(): Promise<Subscription[]> {
    const response = await fetch(`${API_URL}/api/subscriptions`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch subscriptions');
    return response.json();
  },

  async getById(id: string): Promise<Subscription> {
    const response = await fetch(`${API_URL}/api/subscriptions/${id}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch subscription');
    return response.json();
  },

  async create(subscription: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>): Promise<Subscription> {
    const response = await fetch(`${API_URL}/api/subscriptions`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(subscription),
    });
    if (!response.ok) throw new Error('Failed to create subscription');
    return response.json();
  },

  async update(id: string, subscription: Partial<Subscription>): Promise<Subscription> {
    const response = await fetch(`${API_URL}/api/subscriptions/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(subscription),
    });
    if (!response.ok) throw new Error('Failed to update subscription');
    return response.json();
  },

  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/api/subscriptions/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete subscription');
  },
};

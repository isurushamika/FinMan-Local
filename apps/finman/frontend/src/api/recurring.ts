import { apiClient } from './client';

export interface RecurringTransaction {
  id: string;
  userId: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description?: string;
  account?: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: string;
  nextDate: string;
  endDate?: string;
  lastGenerated?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRecurringRequest {
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description?: string;
  account?: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: string;
  endDate?: string;
}

export interface UpdateRecurringRequest {
  type?: 'income' | 'expense';
  amount?: number;
  category?: string;
  description?: string;
  account?: string;
  frequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  endDate?: string;
  isActive?: boolean;
}

export const recurringApi = {
  async getAll(): Promise<RecurringTransaction[]> {
    return apiClient.get<RecurringTransaction[]>('/api/recurring');
  },

  async create(data: CreateRecurringRequest): Promise<RecurringTransaction> {
    return apiClient.post<RecurringTransaction>('/api/recurring', data);
  },

  async update(id: string, data: UpdateRecurringRequest): Promise<RecurringTransaction> {
    return apiClient.put<RecurringTransaction>(`/api/recurring/${id}`, data);
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete<void>(`/api/recurring/${id}`);
  },

  async generate(id: string): Promise<void> {
    return apiClient.post<void>(`/api/recurring/${id}/generate`);
  },
};

import { apiClient } from './client';

export interface Budget {
  id: string;
  userId: string;
  category: string;
  amount: number;
  period: 'monthly' | 'yearly';
  createdAt: string;
  updatedAt: string;
}

export interface CreateBudgetRequest {
  category: string;
  amount: number;
  period: 'monthly' | 'yearly';
}

export interface UpdateBudgetRequest {
  amount?: number;
  period?: 'monthly' | 'yearly';
}

export const budgetsApi = {
  async getAll(): Promise<Budget[]> {
    return apiClient.get<Budget[]>('/api/budgets');
  },

  async create(data: CreateBudgetRequest): Promise<Budget> {
    return apiClient.post<Budget>('/api/budgets', data);
  },

  async update(id: string, data: UpdateBudgetRequest): Promise<Budget> {
    return apiClient.put<Budget>(`/api/budgets/${id}`, data);
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete<void>(`/api/budgets/${id}`);
  },
};

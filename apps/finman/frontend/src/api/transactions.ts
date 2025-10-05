import { apiClient } from './client';

export interface Transaction {
  id: string;
  userId: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description?: string;
  date: string;
  receiptPath?: string;
  account?: string;
  recurringId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTransactionRequest {
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description?: string;
  date: string;
  account?: string;
  recurringId?: string;
}

export interface UpdateTransactionRequest {
  type?: 'income' | 'expense';
  amount?: number;
  category?: string;
  description?: string;
  date?: string;
  account?: string;
}

export const transactionsApi = {
  async getAll(): Promise<Transaction[]> {
    return apiClient.get<Transaction[]>('/api/transactions');
  },

  async getById(id: string): Promise<Transaction> {
    return apiClient.get<Transaction>(`/api/transactions/${id}`);
  },

  async create(data: CreateTransactionRequest): Promise<Transaction> {
    return apiClient.post<Transaction>('/api/transactions', data);
  },

  async update(id: string, data: UpdateTransactionRequest): Promise<Transaction> {
    return apiClient.put<Transaction>(`/api/transactions/${id}`, data);
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete<void>(`/api/transactions/${id}`);
  },

  async bulkCreate(transactions: CreateTransactionRequest[]): Promise<Transaction[]> {
    return apiClient.post<Transaction[]>('/api/transactions/bulk', { transactions });
  },
};

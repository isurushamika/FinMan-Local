import { apiClient } from './client';
import { ItemPurchase } from './items';

export interface CreatePurchaseRequest {
  itemId: string;
  quantity: number;
  unitPrice: number;
  totalCost: number;
  purchaseDate: string;
  store?: string;
  notes?: string;
}

export const purchasesApi = {
  async getAll(): Promise<ItemPurchase[]> {
    return apiClient.get<ItemPurchase[]>('/api/purchases');
  },

  async getByItem(itemId: string): Promise<ItemPurchase[]> {
    return apiClient.get<ItemPurchase[]>(`/api/purchases/item/${itemId}`);
  },

  async create(data: CreatePurchaseRequest): Promise<ItemPurchase> {
    return apiClient.post<ItemPurchase>('/api/purchases', data);
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete<void>(`/api/purchases/${id}`);
  },

  async bulkCreate(purchases: CreatePurchaseRequest[]): Promise<ItemPurchase[]> {
    return apiClient.post<ItemPurchase[]>('/api/purchases/bulk', { purchases });
  },
};

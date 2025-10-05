import { apiClient } from './client';

export interface Item {
  id: string;
  userId: string;
  name: string;
  category: string;
  quantity: number;
  unitPrice: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  purchases?: ItemPurchase[];
}

export interface ItemPurchase {
  id: string;
  userId: string;
  itemId: string;
  quantity: number;
  unitPrice: number;
  totalCost: number;
  purchaseDate: string;
  store?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  item?: Item;
}

export interface CreateItemRequest {
  name: string;
  category: string;
  quantity?: number;
  unitPrice: number;
  notes?: string;
}

export interface UpdateItemRequest {
  name?: string;
  category?: string;
  quantity?: number;
  unitPrice?: number;
  notes?: string;
}

export const itemsApi = {
  async getAll(): Promise<Item[]> {
    return apiClient.get<Item[]>('/api/items');
  },

  async create(data: CreateItemRequest): Promise<Item> {
    return apiClient.post<Item>('/api/items', data);
  },

  async update(id: string, data: UpdateItemRequest): Promise<Item> {
    return apiClient.put<Item>(`/api/items/${id}`, data);
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete<void>(`/api/items/${id}`);
  },

  async bulkCreate(items: CreateItemRequest[]): Promise<Item[]> {
    return apiClient.post<Item[]>('/api/items/bulk', { items });
  },
};

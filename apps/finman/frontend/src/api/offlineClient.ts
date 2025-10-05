import { apiClient } from './client';
import { syncManager } from '../utils/syncManager';

export interface OfflineOptions {
  queueOffline?: boolean; // Whether to queue the request if offline
  maxRetries?: number; // Maximum retry attempts
}

/**
 * Enhanced API client with offline queue support
 * Use this for write operations (POST, PUT, DELETE) that should be queued when offline
 */
export class OfflineApiClient {
  async post<T>(
    endpoint: string,
    data?: any,
    options: OfflineOptions = { queueOffline: true, maxRetries: 3 }
  ): Promise<T> {
    try {
      return await apiClient.post<T>(endpoint, data);
    } catch (error: any) {
      // If offline and queueOffline is enabled, queue the operation
      if (options.queueOffline && !navigator.onLine) {
        await syncManager.queueOperation(endpoint, 'POST', data, options.maxRetries);
        // Return optimistic response (empty object)
        // Real applications might want to return a temporary ID
        return {} as T;
      }
      throw error;
    }
  }

  async put<T>(
    endpoint: string,
    data?: any,
    options: OfflineOptions = { queueOffline: true, maxRetries: 3 }
  ): Promise<T> {
    try {
      return await apiClient.put<T>(endpoint, data);
    } catch (error: any) {
      if (options.queueOffline && !navigator.onLine) {
        await syncManager.queueOperation(endpoint, 'PUT', data, options.maxRetries);
        return {} as T;
      }
      throw error;
    }
  }

  async delete<T>(
    endpoint: string,
    options: OfflineOptions = { queueOffline: true, maxRetries: 3 }
  ): Promise<T> {
    try {
      return await apiClient.delete<T>(endpoint);
    } catch (error: any) {
      if (options.queueOffline && !navigator.onLine) {
        await syncManager.queueOperation(endpoint, 'DELETE', undefined, options.maxRetries);
        return {} as T;
      }
      throw error;
    }
  }

  // GET requests don't support offline queueing (read-only)
  async get<T>(endpoint: string): Promise<T> {
    return apiClient.get<T>(endpoint);
  }
}

export const offlineApiClient = new OfflineApiClient();

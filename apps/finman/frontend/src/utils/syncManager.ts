import { syncQueueDB, QueuedOperation } from './syncQueue';
import { apiClient } from '../api/client';
import { logger } from './logger';

export type SyncStatus = 'online' | 'offline' | 'syncing';

export interface SyncState {
  status: SyncStatus;
  pendingCount: number;
  lastSyncTime: number | null;
  isSyncing: boolean;
}

type SyncStateListener = (state: SyncState) => void;

class SyncManager {
  private isOnline: boolean = navigator.onLine;
  private isSyncing: boolean = false;
  private listeners: SyncStateListener[] = [];
  private syncInterval: NodeJS.Timeout | null = null;
  private lastSyncTime: number | null = null;

  constructor() {
    this.init();
  }

  private init() {
    // Initialize IndexedDB
    syncQueueDB.init().catch((error) => {
      logger.error('Failed to initialize sync queue:', error);
    });

    // Listen for online/offline events
    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());

    // Start periodic sync check (every 30 seconds when online)
    this.startPeriodicSync();
  }

  private handleOnline() {
    logger.info('Network: Online');
    this.isOnline = true;
    this.notifyListeners();
    this.syncPendingOperations();
  }

  private handleOffline() {
    logger.info('Network: Offline');
    this.isOnline = false;
    this.notifyListeners();
  }

  private startPeriodicSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    this.syncInterval = setInterval(() => {
      if (this.isOnline && !this.isSyncing) {
        this.syncPendingOperations();
      }
    }, 30000); // Every 30 seconds
  }

  async queueOperation(
    endpoint: string,
    method: 'POST' | 'PUT' | 'DELETE',
    data?: any,
    maxRetries: number = 3
  ): Promise<string> {
    const operationId = await syncQueueDB.addOperation({
      endpoint,
      method,
      data,
      maxRetries,
    });

    logger.info(`Queued operation: ${method} ${endpoint}`);
    this.notifyListeners();

    // Try to sync immediately if online
    if (this.isOnline) {
      setTimeout(() => this.syncPendingOperations(), 100);
    }

    return operationId;
  }

  async syncPendingOperations(): Promise<void> {
    if (!this.isOnline || this.isSyncing) {
      return;
    }

    this.isSyncing = true;
    this.notifyListeners();

    try {
      const operations = await syncQueueDB.getPendingOperations();
      
      if (operations.length === 0) {
        logger.info('No pending operations to sync');
        this.lastSyncTime = Date.now();
        return;
      }

      logger.info(`Syncing ${operations.length} pending operations...`);

      for (const operation of operations) {
        await this.syncOperation(operation);
      }

      this.lastSyncTime = Date.now();
      logger.info('Sync completed successfully');

      // Clean up old synced operations (older than 24 hours)
      await this.cleanupOldOperations();
    } catch (error) {
      logger.error('Sync failed:', error);
    } finally {
      this.isSyncing = false;
      this.notifyListeners();
    }
  }

  private async syncOperation(operation: QueuedOperation): Promise<void> {
    try {
      logger.info(`Syncing: ${operation.method} ${operation.endpoint}`);

      // Execute the API call
      switch (operation.method) {
        case 'POST':
          await apiClient.post(operation.endpoint, operation.data);
          break;
        case 'PUT':
          await apiClient.put(operation.endpoint, operation.data);
          break;
        case 'DELETE':
          await apiClient.delete(operation.endpoint);
          break;
      }

      // Mark as synced and delete after a delay
      await syncQueueDB.updateOperation(operation.id, { status: 'synced' });
      setTimeout(() => syncQueueDB.deleteOperation(operation.id), 5000);

      logger.info(`Synced successfully: ${operation.id}`);
    } catch (error: any) {
      logger.error(`Failed to sync operation ${operation.id}:`, error);

      const retryCount = operation.retryCount + 1;

      if (retryCount >= operation.maxRetries) {
        // Max retries reached, mark as failed
        await syncQueueDB.updateOperation(operation.id, {
          status: 'failed',
          retryCount,
          error: error.message || 'Unknown error',
        });
        logger.error(`Operation ${operation.id} failed after ${retryCount} retries`);
      } else {
        // Increment retry count
        await syncQueueDB.updateOperation(operation.id, {
          retryCount,
          error: error.message || 'Unknown error',
        });
        logger.info(`Will retry operation ${operation.id} (attempt ${retryCount}/${operation.maxRetries})`);
      }

      // If it's an auth error, stop syncing
      if (error.status === 401) {
        logger.error('Authentication error during sync. Please log in again.');
        throw error;
      }
    }
  }

  private async cleanupOldOperations(): Promise<void> {
    try {
      await syncQueueDB.clearSyncedOperations();
    } catch (error) {
      logger.error('Failed to cleanup old operations:', error);
    }
  }

  async getState(): Promise<SyncState> {
    const pendingCount = await syncQueueDB.getQueueCount();
    
    let status: SyncStatus = 'online';
    if (!this.isOnline) {
      status = 'offline';
    } else if (this.isSyncing) {
      status = 'syncing';
    }

    return {
      status,
      pendingCount,
      lastSyncTime: this.lastSyncTime,
      isSyncing: this.isSyncing,
    };
  }

  subscribe(listener: SyncStateListener): () => void {
    this.listeners.push(listener);
    
    // Immediately call listener with current state
    this.getState().then(listener);

    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private async notifyListeners(): Promise<void> {
    const state = await this.getState();
    this.listeners.forEach((listener) => listener(state));
  }

  getOnlineStatus(): boolean {
    return this.isOnline;
  }

  async forceSyncNow(): Promise<void> {
    await this.syncPendingOperations();
  }

  async clearAllQueued(): Promise<void> {
    const operations = await syncQueueDB.getAllOperations();
    for (const op of operations) {
      await syncQueueDB.deleteOperation(op.id);
    }
    this.notifyListeners();
  }

  destroy(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    window.removeEventListener('online', this.handleOnline);
    window.removeEventListener('offline', this.handleOffline);
  }
}

export const syncManager = new SyncManager();

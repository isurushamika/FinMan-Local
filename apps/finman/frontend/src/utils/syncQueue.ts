// IndexedDB wrapper for offline sync queue
const DB_NAME = 'finman_sync_db';
const DB_VERSION = 1;
const QUEUE_STORE = 'sync_queue';

export interface QueuedOperation {
  id: string;
  endpoint: string;
  method: 'POST' | 'PUT' | 'DELETE';
  data?: any;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
  status: 'pending' | 'failed' | 'synced';
  error?: string;
}

class SyncQueueDB {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains(QUEUE_STORE)) {
          const store = db.createObjectStore(QUEUE_STORE, { keyPath: 'id' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('status', 'status', { unique: false });
        }
      };
    });
  }

  async addOperation(operation: Omit<QueuedOperation, 'id' | 'timestamp' | 'retryCount' | 'status'>): Promise<string> {
    if (!this.db) await this.init();

    const id = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const queuedOp: QueuedOperation = {
      id,
      timestamp: Date.now(),
      retryCount: 0,
      status: 'pending',
      ...operation,
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([QUEUE_STORE], 'readwrite');
      const store = transaction.objectStore(QUEUE_STORE);
      const request = store.add(queuedOp);

      request.onsuccess = () => resolve(id);
      request.onerror = () => reject(request.error);
    });
  }

  async getPendingOperations(): Promise<QueuedOperation[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([QUEUE_STORE], 'readonly');
      const store = transaction.objectStore(QUEUE_STORE);
      const index = store.index('status');
      const request = index.getAll('pending');

      request.onsuccess = () => {
        const operations = request.result as QueuedOperation[];
        // Sort by timestamp (oldest first)
        operations.sort((a, b) => a.timestamp - b.timestamp);
        resolve(operations);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async updateOperation(id: string, updates: Partial<QueuedOperation>): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([QUEUE_STORE], 'readwrite');
      const store = transaction.objectStore(QUEUE_STORE);
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const operation = getRequest.result;
        if (operation) {
          const updatedOp = { ...operation, ...updates };
          const putRequest = store.put(updatedOp);
          putRequest.onsuccess = () => resolve();
          putRequest.onerror = () => reject(putRequest.error);
        } else {
          reject(new Error('Operation not found'));
        }
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async deleteOperation(id: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([QUEUE_STORE], 'readwrite');
      const store = transaction.objectStore(QUEUE_STORE);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clearSyncedOperations(): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([QUEUE_STORE], 'readwrite');
      const store = transaction.objectStore(QUEUE_STORE);
      const index = store.index('status');
      const request = index.openCursor(IDBKeyRange.only('synced'));

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        } else {
          resolve();
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getAllOperations(): Promise<QueuedOperation[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([QUEUE_STORE], 'readonly');
      const store = transaction.objectStore(QUEUE_STORE);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result as QueuedOperation[]);
      request.onerror = () => reject(request.error);
    });
  }

  async getQueueCount(): Promise<number> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([QUEUE_STORE], 'readonly');
      const store = transaction.objectStore(QUEUE_STORE);
      const index = store.index('status');
      const request = index.count('pending');

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
}

export const syncQueueDB = new SyncQueueDB();

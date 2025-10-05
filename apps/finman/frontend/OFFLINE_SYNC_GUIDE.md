# Offline Sync System Documentation

## Overview

The FinMan app now includes a complete offline synchronization system that allows users to continue working even when disconnected from the internet. All changes are automatically queued and synced when the connection is restored.

## Architecture

### Components

1. **SyncQueueDB** (`utils/syncQueue.ts`)
   - IndexedDB wrapper for persistent storage
   - Stores pending API operations
   - Tracks retry attempts and status

2. **SyncManager** (`utils/syncManager.ts`)
   - Manages sync queue processing
   - Monitors network status
   - Automatic retry logic
   - Periodic sync (every 30 seconds)

3. **OfflineApiClient** (`api/offlineClient.ts`)
   - Enhanced API client with offline support
   - Automatic queueing for failed requests
   - Optimistic UI updates

4. **React Hooks** (`hooks/useSyncStatus.ts`)
   - `useSyncStatus()` - Subscribe to sync state changes
   - Provides sync status, pending count, last sync time

5. **UI Components** (`components/SyncStatus.tsx`)
   - `SyncStatusIndicator` - Full status indicator with sync button
   - `SyncStatusBadge` - Compact badge for mobile
   - `OfflineBanner` - Banner warning for offline mode

## Features

### ✅ Automatic Queue Management
- Failed requests automatically queued
- Offline operations queued immediately
- Queue persists across app restarts (IndexedDB)

### ✅ Smart Retry Logic
- Configurable max retries (default: 3)
- Exponential backoff (via periodic sync)
- Failed operations marked and preserved

### ✅ Network Status Detection
- Real-time online/offline detection
- Automatic sync when connection restored
- Visual indicators for connection status

### ✅ Optimistic UI Updates
- Immediate UI feedback
- Background sync
- Rollback support (manual implementation needed)

### ✅ Status Indicators
- Real-time sync status
- Pending operations count
- Last sync timestamp
- Manual sync trigger

## Usage

### Using the Offline API Client

For write operations that should work offline:

```typescript
import { offlineApiClient } from '../api/offlineClient';

// POST with offline support
const newItem = await offlineApiClient.post('/api/items', {
  name: 'Tomatoes',
  category: 'Vegetables',
  unitPrice: 2.50
}, {
  queueOffline: true,  // Queue if offline (default)
  maxRetries: 3        // Max retry attempts (default)
});

// PUT with offline support
await offlineApiClient.put(`/api/items/${id}`, {
  unitPrice: 2.75
});

// DELETE with offline support
await offlineApiClient.delete(`/api/items/${id}`);

// GET (no offline support - read operations)
const items = await offlineApiClient.get('/api/items');
```

### Using Sync Status Hook

```typescript
import { useSyncStatus } from '../hooks/useSyncStatus';

function MyComponent() {
  const {
    status,          // 'online' | 'offline' | 'syncing'
    pendingCount,    // Number of pending operations
    lastSyncTime,    // Timestamp of last successful sync
    isSyncing,       // Boolean: currently syncing
    isOnline,        // Boolean: network status
    forceSyncNow,    // Function: trigger manual sync
    clearQueue       // Function: clear all pending operations
  } = useSyncStatus();

  return (
    <div>
      <p>Status: {status}</p>
      <p>Pending: {pendingCount}</p>
      {!isOnline && <p>You're offline!</p>}
      <button onClick={forceSyncNow}>Sync Now</button>
    </div>
  );
}
```

### Adding Sync Status Indicators

```typescript
import { SyncStatusIndicator, SyncStatusBadge, OfflineBanner } from '../components/SyncStatus';

function App() {
  return (
    <div>
      {/* Full indicator (desktop) */}
      <SyncStatusIndicator />
      
      {/* Compact badge (mobile) */}
      <SyncStatusBadge />
      
      {/* Offline warning banner */}
      <OfflineBanner />
    </div>
  );
}
```

## How It Works

### 1. Normal Operation (Online)

```
User Action → API Call → Success → UI Update
```

### 2. Offline Operation

```
User Action → API Call Fails → Queue Operation → Optimistic UI Update
            ↓
When Online → Process Queue → Real API Call → Update Status
```

### 3. Retry Logic

```
Operation Fails → Increment Retry Count
              ↓
Retry < Max? → Yes → Queue for Retry
            ↓
           No → Mark as Failed
```

## Data Flow

1. **User performs action** (create, update, delete)
2. **OfflineApiClient attempts API call**
3. **If successful**: Return result, update UI
4. **If fails (offline/error)**:
   - Queue operation in IndexedDB
   - Return optimistic result
   - Update UI immediately
5. **SyncManager monitors network**
6. **When online**: Process queue automatically
7. **On success**: Remove from queue
8. **On failure**: Retry with backoff or mark failed

## Configuration

### Sync Interval

Change periodic sync frequency in `syncManager.ts`:

```typescript
this.syncInterval = setInterval(() => {
  if (this.isOnline && !this.isSyncing) {
    this.syncPendingOperations();
  }
}, 30000); // Default: 30 seconds
```

### Retry Settings

Per-operation retry configuration:

```typescript
await offlineApiClient.post('/api/items', data, {
  queueOffline: true,
  maxRetries: 5  // Custom retry count
});
```

### Queue Storage

IndexedDB configuration in `syncQueue.ts`:

```typescript
const DB_NAME = 'finman_sync_db';
const DB_VERSION = 1;
const QUEUE_STORE = 'sync_queue';
```

## API Reference

### SyncManager

```typescript
class SyncManager {
  // Queue an operation for later sync
  async queueOperation(
    endpoint: string,
    method: 'POST' | 'PUT' | 'DELETE',
    data?: any,
    maxRetries?: number
  ): Promise<string>

  // Manually trigger sync
  async forceSyncNow(): Promise<void>

  // Get current sync state
  async getState(): Promise<SyncState>

  // Subscribe to state changes
  subscribe(listener: (state: SyncState) => void): () => void

  // Clear all queued operations
  async clearAllQueued(): Promise<void>

  // Get online status
  getOnlineStatus(): boolean
}
```

### SyncQueueDB

```typescript
class SyncQueueDB {
  // Add operation to queue
  async addOperation(operation: Omit<QueuedOperation, 'id' | 'timestamp' | 'retryCount' | 'status'>): Promise<string>

  // Get all pending operations
  async getPendingOperations(): Promise<QueuedOperation[]>

  // Update operation status
  async updateOperation(id: string, updates: Partial<QueuedOperation>): Promise<void>

  // Delete operation
  async deleteOperation(id: string): Promise<void>

  // Get pending count
  async getQueueCount(): Promise<number>

  // Clear synced operations
  async clearSyncedOperations(): Promise<void>
}
```

## Status Indicators

### Visual States

| Status | Icon | Color | Meaning |
|--------|------|-------|---------|
| Online | Wifi | Green | Connected, synced |
| Syncing | RefreshCw (spinning) | Yellow | Currently syncing |
| Pending | Wifi | Orange | Online but has pending operations |
| Offline | WifiOff | Red | No connection |

### Indicator Components

1. **SyncStatusIndicator** - Full desktop view
   - Status icon with color
   - Status text
   - Last sync timestamp
   - Manual sync button
   - Pending count badge

2. **SyncStatusBadge** - Compact mobile view
   - Just icon and count
   - Color-coded background

3. **OfflineBanner** - Warning banner
   - Only shows when offline
   - Shows pending count
   - Dismissible

## Error Handling

### Authentication Errors (401)

```typescript
// Sync stops on auth errors
if (error.status === 401) {
  logger.error('Authentication error during sync. Please log in again.');
  throw error; // Stops further sync attempts
}
```

### Network Errors

```typescript
// Automatically retried up to maxRetries
// Then marked as failed and preserved for manual review
```

### Data Conflicts

**Note**: Current implementation doesn't handle conflicts. Consider implementing:
- Last-write-wins strategy
- Version tracking
- Manual conflict resolution UI

## Best Practices

### 1. Use for Write Operations Only

```typescript
// ✅ Good: Write operations
await offlineApiClient.post('/api/items', data);
await offlineApiClient.put('/api/items/123', data);
await offlineApiClient.delete('/api/items/123');

// ❌ Avoid: Read operations (no offline benefit)
const items = await apiClient.get('/api/items');
```

### 2. Implement Optimistic UI

```typescript
// Update UI immediately
setItems([...items, newItem]);

// Then queue for sync
await offlineApiClient.post('/api/items', newItem);
```

### 3. Handle Errors Gracefully

```typescript
try {
  await offlineApiClient.post('/api/items', data);
} catch (error) {
  // Operation was queued, no need to show error
  if (!navigator.onLine) {
    showMessage('Saved offline. Will sync when online.');
  } else {
    showError('Failed to save. Please try again.');
  }
}
```

### 4. Show Sync Status

```typescript
// Always include sync indicator
<SyncStatusIndicator />

// Show offline banner
<OfflineBanner />
```

### 5. Manual Sync Control

```typescript
const { forceSyncNow, pendingCount } = useSyncStatus();

// Allow users to trigger sync
<button 
  onClick={forceSyncNow}
  disabled={pendingCount === 0}
>
  Sync Now ({pendingCount})
</button>
```

## Testing

### Simulate Offline Mode

1. **Browser DevTools**:
   - Open DevTools → Network tab
   - Select "Offline" from throttling dropdown

2. **Programmatically**:
   ```typescript
   // Force offline (for testing)
   Object.defineProperty(navigator, 'onLine', {
     writable: true,
     value: false
   });
   
   window.dispatchEvent(new Event('offline'));
   ```

### Test Scenarios

1. **Create item while offline**
   - Go offline
   - Create item
   - Verify queued in IndexedDB
   - Go online
   - Verify auto-sync

2. **Update item while offline**
   - Go offline
   - Update item
   - Verify queued
   - Go online
   - Verify synced

3. **Multiple operations**
   - Go offline
   - Perform multiple actions
   - Verify all queued in order
   - Go online
   - Verify all synced in order

4. **Retry failures**
   - Force API error
   - Verify retry attempts
   - Verify marked as failed after max retries

## Monitoring

### View Queue in DevTools

```javascript
// Open IndexedDB in DevTools → Application tab
// Navigate to: IndexedDB → finman_sync_db → sync_queue
```

### Programmatic Access

```typescript
import { syncQueueDB } from './utils/syncQueue';

// Get all operations
const all = await syncQueueDB.getAllOperations();
console.log('All queued operations:', all);

// Get pending count
const count = await syncQueueDB.getQueueCount();
console.log('Pending operations:', count);
```

## Limitations

1. **No Conflict Resolution**: Last write wins
2. **GET Requests Not Cached**: Read operations require connection
3. **No Background Sync**: Requires app to be open
4. **Storage Limits**: IndexedDB has browser-specific limits (usually >50MB)
5. **No Server-Side Sync**: Doesn't handle server-initiated changes

## Future Enhancements

### Potential Improvements

1. **Background Sync API**
   - Sync even when app is closed
   - Better mobile support

2. **Service Worker Integration**
   - Cache GET requests
   - Full offline experience

3. **Conflict Resolution**
   - Detect conflicts
   - Manual resolution UI
   - Version tracking

4. **Optimistic ID Generation**
   - Generate temporary IDs
   - Replace with server IDs on sync

5. **Selective Sync**
   - Prioritize important operations
   - User-controlled sync

6. **Server Push**
   - WebSocket connection
   - Real-time updates

## Troubleshooting

### Queue Not Processing

**Check**:
- Network status: `navigator.onLine`
- Sync manager initialized: `syncManager.getOnlineStatus()`
- Auth token valid: `getAuthToken()`

**Solution**:
```typescript
// Force sync
await syncManager.forceSyncNow();
```

### Operations Stuck as Failed

**Check**:
- View failed operations in IndexedDB
- Check error messages

**Solution**:
```typescript
// Clear failed operations
const ops = await syncQueueDB.getAllOperations();
const failed = ops.filter(op => op.status === 'failed');
for (const op of failed) {
  await syncQueueDB.deleteOperation(op.id);
}
```

### IndexedDB Quota Exceeded

**Check**:
- Browser storage quota
- Queue size

**Solution**:
```typescript
// Clear old synced operations
await syncQueueDB.clearSyncedOperations();

// Or clear all
await syncManager.clearAllQueued();
```

## Summary

The offline sync system provides:
- ✅ Seamless offline operation
- ✅ Automatic background sync
- ✅ Smart retry logic
- ✅ Visual status indicators
- ✅ Persistent queue (survives reloads)
- ✅ Real-time network detection
- ✅ Manual sync control

**All with minimal code changes to existing app logic!**


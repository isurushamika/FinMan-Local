import { useState, useEffect } from 'react';
import { syncManager, SyncState } from '../utils/syncManager';

export const useSyncStatus = () => {
  const [syncState, setSyncState] = useState<SyncState>({
    status: 'online',
    pendingCount: 0,
    lastSyncTime: null,
    isSyncing: false,
  });

  useEffect(() => {
    const unsubscribe = syncManager.subscribe((state) => {
      setSyncState(state);
    });

    return unsubscribe;
  }, []);

  const forceSyncNow = async () => {
    await syncManager.forceSyncNow();
  };

  const clearQueue = async () => {
    await syncManager.clearAllQueued();
  };

  return {
    ...syncState,
    forceSyncNow,
    clearQueue,
    isOnline: syncState.status !== 'offline',
  };
};

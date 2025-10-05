import React from 'react';
import { Wifi, WifiOff, RefreshCw, Cloud, CloudOff, AlertCircle } from 'lucide-react';
import { useSyncStatus } from '../hooks/useSyncStatus';

export const SyncStatusIndicator: React.FC = () => {
  const { status, pendingCount, lastSyncTime, isSyncing, forceSyncNow } = useSyncStatus();

  const getStatusIcon = () => {
    if (status === 'offline') {
      return <WifiOff className="w-4 h-4" />;
    }
    if (isSyncing) {
      return <RefreshCw className="w-4 h-4 animate-spin" />;
    }
    return <Wifi className="w-4 h-4" />;
  };

  const getStatusColor = () => {
    if (status === 'offline') return 'bg-red-500';
    if (isSyncing) return 'bg-yellow-500';
    if (pendingCount > 0) return 'bg-orange-500';
    return 'bg-green-500';
  };

  const getStatusText = () => {
    if (status === 'offline') return 'Offline';
    if (isSyncing) return 'Syncing...';
    if (pendingCount > 0) return `${pendingCount} pending`;
    return 'Synced';
  };

  const getLastSyncText = () => {
    if (!lastSyncTime) return 'Never synced';
    
    const diff = Date.now() - lastSyncTime;
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes === 1) return '1 minute ago';
    if (minutes < 60) return `${minutes} minutes ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours === 1) return '1 hour ago';
    return `${hours} hours ago`;
  };

  return (
    <div className="flex items-center gap-2">
      {/* Status Indicator */}
      <div className="flex items-center gap-2">
        <div className={`${getStatusColor()} rounded-full p-1.5 text-white`}>
          {getStatusIcon()}
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-700">{getStatusText()}</span>
          <span className="text-xs text-gray-500">{getLastSyncText()}</span>
        </div>
      </div>

      {/* Sync Button (only show when not syncing) */}
      {!isSyncing && status === 'online' && (
        <button
          onClick={forceSyncNow}
          className="ml-2 p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          title="Sync now"
        >
          <RefreshCw className="w-4 h-4 text-gray-600" />
        </button>
      )}

      {/* Pending Operations Badge */}
      {pendingCount > 0 && (
        <div className="ml-2 bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
          {pendingCount} {pendingCount === 1 ? 'change' : 'changes'} pending
        </div>
      )}
    </div>
  );
};

// Compact version for mobile/small screens
export const SyncStatusBadge: React.FC = () => {
  const { status, pendingCount, isSyncing } = useSyncStatus();

  const getIcon = () => {
    if (status === 'offline') return <CloudOff className="w-3.5 h-3.5" />;
    if (isSyncing) return <RefreshCw className="w-3.5 h-3.5 animate-spin" />;
    if (pendingCount > 0) return <AlertCircle className="w-3.5 h-3.5" />;
    return <Cloud className="w-3.5 h-3.5" />;
  };

  const getColor = () => {
    if (status === 'offline') return 'bg-red-100 text-red-700';
    if (isSyncing) return 'bg-yellow-100 text-yellow-700';
    if (pendingCount > 0) return 'bg-orange-100 text-orange-700';
    return 'bg-green-100 text-green-700';
  };

  return (
    <div className={`${getColor()} px-2 py-1 rounded-full flex items-center gap-1.5`}>
      {getIcon()}
      {pendingCount > 0 && (
        <span className="text-xs font-medium">{pendingCount}</span>
      )}
    </div>
  );
};

// Banner for offline mode
export const OfflineBanner: React.FC = () => {
  const { status, pendingCount } = useSyncStatus();

  if (status !== 'offline') return null;

  return (
    <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-3">
      <div className="flex items-center gap-3">
        <WifiOff className="w-5 h-5 text-yellow-700" />
        <div className="flex-1">
          <p className="text-sm font-medium text-yellow-800">
            You're currently offline
          </p>
          <p className="text-xs text-yellow-700">
            {pendingCount > 0
              ? `${pendingCount} ${pendingCount === 1 ? 'change' : 'changes'} will sync when you're back online`
              : 'Changes will be saved locally and synced when you reconnect'}
          </p>
        </div>
      </div>
    </div>
  );
};

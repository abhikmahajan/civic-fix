import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function OfflineBanner({ isOnline, queuedCount }) {
  if (isOnline && queuedCount === 0) return null;

  if (!isOnline) {
    return (
      <div className="bg-yellow-100 text-yellow-800 px-4 py-3 flex items-center justify-center gap-2">
        <AlertTriangle size={20} />
        <span className="text-sm font-medium">⚠️ You are offline. Reports will be saved locally and synced when connection is restored.</span>
      </div>
    );
  }

  return (
    <div className="bg-blue-100 text-blue-800 px-4 py-3 flex items-center justify-center gap-2">
      <RefreshCw size={20} className="animate-spin" />
      <span className="text-sm font-medium">Syncing {queuedCount} queued report{queuedCount > 1 ? 's' : ''}...</span>
    </div>
  );
}

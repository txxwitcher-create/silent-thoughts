import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed right-4 bottom-4 z-40 flex items-center gap-2 rounded-xl border border-amber-300/60 bg-amber-950/95 px-3.5 py-2 text-xs font-medium text-amber-100 shadow-lg backdrop-blur-md"
    >
      <WifiOff className="h-3.5 w-3.5 shrink-0 text-amber-300" />
      <span>Offline mode — reading cached library</span>
    </div>
  );
};

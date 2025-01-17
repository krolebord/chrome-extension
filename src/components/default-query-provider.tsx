import { storage, storageQueryKey } from '@/lib/storage';
import { QueryClient, QueryClientProvider, focusManager } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

focusManager.setEventListener((handleFocus) => {
  if (typeof window !== 'undefined' && window.addEventListener) {
    const focusHandler = (e: FocusEvent) => {
      handleFocus();
    };

    window.addEventListener('focus', focusHandler, false);
    return () => {
      window.removeEventListener('focus', focusHandler);
    };
  }
});

export function DefaultQueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  useEffect(() => {
    const storageHandler = (changes: {
      [key: string]: chrome.storage.StorageChange;
    }) => {
      for (const [key] of Object.entries(changes)) {
        const segments = key.split(':');
        for (let i = 0; i < segments.length; i++) {
          const queryKey = [storageQueryKey, ...segments.slice(0, i + 1)];
          queryClient.invalidateQueries({
            queryKey,
            exact: true,
            fetchStatus: 'idle',
            type: 'active',
          });
        }
      }
    };

    storage.onChanged.addListener(storageHandler);
    return () => {
      storage.onChanged.removeListener(storageHandler);
    };
  }, [queryClient]);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

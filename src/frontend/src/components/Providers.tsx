'use client';

import { ClerkProvider, useAuth } from '@clerk/nextjs';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { setTokenGetter } from '@/lib/api';
import { connectSocket, disconnectSocket } from '@/lib/socket';

function TokenWirer() {
  const { getToken, isSignedIn } = useAuth();

  useEffect(() => {
    // Wire API requests to use Clerk JWT
    setTokenGetter(() => getToken({ template: undefined }));
  }, [getToken]);

  useEffect(() => {
    if (!isSignedIn) {
      disconnectSocket();
      return;
    }

    // Connect socket with Clerk JWT so the backend can map this socket to the user
    let cancelled = false;
    getToken({ template: undefined }).then((token) => {
      if (!cancelled && token) connectSocket(token);
    });

    return () => {
      cancelled = true;
    };
  }, [isSignedIn, getToken]);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () => new QueryClient({ defaultOptions: { queries: { staleTime: 30_000, retry: 1 } } })
  );

  return (
    <ClerkProvider>
      <QueryClientProvider client={queryClient}>
        <TokenWirer />
        {children}
      </QueryClientProvider>
    </ClerkProvider>
  );
}

'use client';

import { useState, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

/**
 * QueryClient único por sessão (lazy init no client).
 * Não usar persister no web — TanStack Query reidrata via fetch
 * normal e localStorage do supabase já cacheia auth.
 */
export function QueryProvider({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            gcTime: 1000 * 60 * 60,
            refetchOnWindowFocus: false,
            retry: 1,
          },
          mutations: { retry: 2 },
        },
      }),
  );
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

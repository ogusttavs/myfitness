import { QueryClient } from '@tanstack/react-query';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { mmkvStorageAdapter } from '@/lib/storage/mmkv';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 30_000,
      gcTime: 1000 * 60 * 60 * 24, // 24h
      refetchOnWindowFocus: false,
    },
    mutations: {
      // mutations offline ficam em cache até reconectar
      retry: 3,
    },
  },
});

export const queryPersister = createAsyncStoragePersister({
  // MMKV adapter expõe API síncrona; o persister espera Promise — wrappa.
  storage: {
    getItem: async (key) => mmkvStorageAdapter.getItem(key),
    setItem: async (key, value) => mmkvStorageAdapter.setItem(key, value),
    removeItem: async (key) => mmkvStorageAdapter.removeItem(key),
  },
  key: 'modo-caverna-query-cache',
});

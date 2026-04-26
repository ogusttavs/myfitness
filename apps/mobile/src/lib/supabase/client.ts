import 'react-native-url-polyfill/auto';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { mmkvStorageAdapter } from '@/lib/storage/mmkv';
import type { Database } from './database.types';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anon = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anon) {
  // Falha cedo — sem credenciais o app não funciona.
  // Em dev, mostramos o que falta; em prod o build deve travar antes (CI).
  // eslint-disable-next-line no-console
  console.warn(
    '[supabase] EXPO_PUBLIC_SUPABASE_URL ou EXPO_PUBLIC_SUPABASE_ANON_KEY ausentes. Configure .env.',
  );
}

export const supabase: SupabaseClient<Database> = createClient<Database>(
  url ?? 'https://invalid.local',
  anon ?? 'invalid',
  {
    auth: {
      storage: mmkvStorageAdapter,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  },
);

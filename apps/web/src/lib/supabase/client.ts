'use client';

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './database.types';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  // eslint-disable-next-line no-console
  console.warn('[supabase] envs ausentes — configure NEXT_PUBLIC_SUPABASE_URL e _ANON_KEY.');
}

let _client: ReturnType<typeof createBrowserClient<Database>> | null = null;

/**
 * Singleton do cliente browser. Reutiliza a mesma instância para
 * compartilhar sessão e canais entre componentes.
 */
export function getSupabaseBrowserClient() {
  if (_client) return _client;
  _client = createBrowserClient<Database>(
    url ?? 'https://invalid.local',
    key ?? 'invalid',
  );
  return _client;
}

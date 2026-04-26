'use client';

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './database.types';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function createSupabaseBrowserClient() {
  if (!url || !anon) {
    // eslint-disable-next-line no-console
    console.warn('[supabase] NEXT_PUBLIC_SUPABASE_URL ou NEXT_PUBLIC_SUPABASE_ANON_KEY ausentes. Configure .env.local.');
  }
  return createBrowserClient<Database>(url ?? 'https://invalid.local', anon ?? 'invalid');
}

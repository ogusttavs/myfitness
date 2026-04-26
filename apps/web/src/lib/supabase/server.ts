import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from './database.types';

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://invalid.local';
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'invalid';

  return createServerClient<Database>(url, anon, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (toSet: Array<{ name: string; value: string; options: CookieOptions }>) => {
        try {
          toSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // chamado em Server Component sem cookies-mutáveis — ignorar
        }
      },
    },
  });
}

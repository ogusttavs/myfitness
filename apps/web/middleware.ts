import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

/**
 * Middleware do Supabase: renova access token a cada request,
 * garantindo que a sessão expire só no inactivity real.
 */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return response;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (toSet: Array<{ name: string; value: string; options: CookieOptions }>) => {
        toSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        toSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  try {
    await supabase.auth.getUser();
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('[middleware] auth.getUser failed:', e);
  }

  return response;
}

export const config = {
  matcher: [
    // ignora assets estáticos e API auth callback
    '/((?!_next/static|_next/image|favicon.ico|icon.svg|manifest.webmanifest|auth/callback).*)',
  ],
};

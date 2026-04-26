'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useSession } from '@/lib/supabase/useSession';

/**
 * Wrap em rotas privadas. Se não tiver sessão, redireciona pra /login.
 * Mostra loader enquanto sessão carrega.
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <Loader2 className="size-6 text-ember animate-spin" />
      </div>
    );
  }

  if (!user) return null; // redirecionando

  return <>{children}</>;
}

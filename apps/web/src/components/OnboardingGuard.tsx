'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useActiveWorkspace } from '@/lib/supabase/useWorkspace';
import { useAthleteProfile } from '@/lib/supabase/useAthleteProfile';

/**
 * - Coach (sem workspace próprio) → redireciona pra /coach
 * - Atleta sem dados → redireciona pra /onboarding
 * - Atleta com dados → renderiza normalmente
 */
export function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { role, loading: wsLoading } = useActiveWorkspace();
  const { hasOnboarded, loading: profileLoading } = useAthleteProfile();

  const loading = wsLoading || (role === 'athlete' && profileLoading);

  useEffect(() => {
    if (loading) return;

    // Coach → painel /coach
    if (role === 'coach') {
      const isCoachRoute = pathname === '/coach' || pathname.startsWith('/coach/') || pathname === '/login';
      if (!isCoachRoute) router.replace('/coach');
      return;
    }

    // Atleta sem dados → onboarding
    if (role === 'athlete' && !hasOnboarded && pathname !== '/onboarding') {
      router.replace('/onboarding');
    }
  }, [role, hasOnboarded, loading, pathname, router]);

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <Loader2 className="size-6 text-ember animate-spin" />
      </div>
    );
  }

  if (role === 'coach') {
    const isCoachRoute = pathname === '/coach' || pathname.startsWith('/coach/');
    if (!isCoachRoute) return null;
  }
  if (role === 'athlete' && !hasOnboarded && pathname !== '/onboarding') return null;

  return <>{children}</>;
}

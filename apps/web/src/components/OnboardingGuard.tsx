'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAthleteProfile } from '@/lib/supabase/useAthleteProfile';

/**
 * Se usuário tá logado mas ainda não preencheu o onboarding,
 * redireciona pra /onboarding.
 */
export function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { hasOnboarded, loading } = useAthleteProfile();

  useEffect(() => {
    if (loading) return;
    if (!hasOnboarded && pathname !== '/onboarding') {
      router.replace('/onboarding');
    }
  }, [hasOnboarded, loading, pathname, router]);

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <Loader2 className="size-6 text-ember animate-spin" />
      </div>
    );
  }

  if (!hasOnboarded && pathname !== '/onboarding') return null;

  return <>{children}</>;
}

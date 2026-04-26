'use client';

import { useQuery } from '@tanstack/react-query';
import { getSupabaseBrowserClient } from './client';
import { useSession } from './useSession';
import { useActiveWorkspace } from './useWorkspace';

export interface AthleteProfile {
  fullName: string;
  age: number | null;
  heightCm: number | null;
  weightKg: number | null;
  level: 'iniciante' | 'intermediario' | 'avancado' | null;
  goal: string | null;
  weeklyFrequency: number | null;
}

export interface ProfileState {
  data: AthleteProfile | null;
  hasOnboarded: boolean;
  loading: boolean;
}

/**
 * Carrega o perfil completo (profile.full_name + athlete_data) do usuário atual.
 * Considera "onboarded" se tem nome E peso preenchidos.
 */
export function useAthleteProfile(): ProfileState {
  const { user, loading: sessionLoading } = useSession();
  const { workspace, loading: wsLoading } = useActiveWorkspace();
  const ws = workspace?.id ?? null;

  const query = useQuery({
    queryKey: ['athlete:profile', user?.id, ws],
    enabled: !!user && !!ws,
    queryFn: async (): Promise<AthleteProfile | null> => {
      const supabase = getSupabaseBrowserClient();
      const [{ data: profile }, { data: athleteData }] = await Promise.all([
        supabase.from('profiles').select('full_name').eq('id', user!.id).maybeSingle(),
        supabase.from('athlete_data').select('age, height_cm, weight_kg, level, goal, weekly_frequency').eq('workspace_id', ws!).maybeSingle(),
      ]);

      const p = profile as { full_name: string } | null;
      const a = athleteData as {
        age: number | null;
        height_cm: number | null;
        weight_kg: number | string | null;
        level: 'iniciante' | 'intermediario' | 'avancado' | null;
        goal: string | null;
        weekly_frequency: number | null;
      } | null;

      return {
        fullName: p?.full_name ?? '',
        age: a?.age ?? null,
        heightCm: a?.height_cm ?? null,
        weightKg: a?.weight_kg !== null && a?.weight_kg !== undefined ? Number(a.weight_kg) : null,
        level: a?.level ?? null,
        goal: a?.goal ?? null,
        weeklyFrequency: a?.weekly_frequency ?? null,
      };
    },
  });

  const data = query.data ?? null;
  const hasOnboarded = !!(data && data.fullName.trim() && data.weightKg && data.heightCm && data.age);
  // Loading se ainda não temos sessão, workspace ou se a query está carregando.
  // Sem isso, o OnboardingGuard pode pensar que terminou (loading=false) com data=null
  // (porque o useQuery está disabled aguardando o workspace) e fazer loop.
  const loading = sessionLoading || wsLoading || (!!user && !!ws && query.isLoading);
  return { data, hasOnboarded, loading };
}

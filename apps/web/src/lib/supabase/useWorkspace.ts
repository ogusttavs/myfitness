'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getSupabaseBrowserClient } from './client';
import { useSession } from './useSession';

export interface WorkspaceMembership {
  id: string;
  athlete_user_id: string;
  is_athlete: boolean;
  is_coach: boolean;
}

/**
 * Retorna o workspace ativo do usuário corrente.
 * - Atleta: o próprio workspace
 * - Coach: precisa selecionar (ver useCoachAtletas) — aqui retorna null se for só coach
 * - Athlete + coach (em outros workspaces): retorna o próprio (atleta) por padrão
 *
 * Também garante que o protocolo Modo Caverna está semeado no workspace.
 */
export function useActiveWorkspace() {
  const { user, loading: sessionLoading } = useSession();
  const [seeding, setSeeding] = useState(false);

  const query = useQuery({
    queryKey: ['workspace:active', user?.id],
    enabled: !!user,
    queryFn: async (): Promise<WorkspaceMembership | null> => {
      const supabase = getSupabaseBrowserClient();
      // tenta buscar o próprio workspace (atleta)
      const { data: own, error } = await supabase
        .from('workspaces')
        .select('id, athlete_user_id')
        .eq('athlete_user_id', user!.id)
        .maybeSingle();
      if (error) throw error;
      if (own) {
        return { id: own.id, athlete_user_id: own.athlete_user_id, is_athlete: true, is_coach: false };
      }
      // não é atleta — talvez seja coach (sem workspace próprio)
      return null;
    },
  });

  // garante seed do protocolo
  useEffect(() => {
    const ws = query.data;
    if (!ws || !ws.is_athlete || seeding) return;
    let cancelled = false;
    (async () => {
      setSeeding(true);
      try {
        const supabase = getSupabaseBrowserClient();
        const { data: hasPlan } = await supabase
          .from('workout_plans')
          .select('id')
          .eq('workspace_id', ws.id)
          .eq('active', true)
          .maybeSingle();
        if (!hasPlan && !cancelled) {
          await supabase.rpc('seed_modo_caverna_protocol', { ws: ws.id });
        }
      } finally {
        if (!cancelled) setSeeding(false);
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.data?.id]);

  return {
    workspace: query.data ?? null,
    loading: sessionLoading || query.isLoading,
    seeding,
    error: query.error,
  };
}

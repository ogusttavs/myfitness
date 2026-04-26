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
 *
 * Também garante que o protocolo Modo Caverna está semeado no workspace.
 * Erros silenciosos (não derrubam a tela).
 */
export function useActiveWorkspace() {
  const { user, loading: sessionLoading } = useSession();
  const [seeding, setSeeding] = useState(false);

  const query = useQuery({
    queryKey: ['workspace:active', user?.id],
    enabled: !!user,
    queryFn: async (): Promise<WorkspaceMembership | null> => {
      const supabase = getSupabaseBrowserClient();
      try {
        const { data: own, error } = await supabase
          .from('workspaces')
          .select('id, athlete_user_id')
          .eq('athlete_user_id', user!.id)
          .maybeSingle();
        if (error) {
          // eslint-disable-next-line no-console
          console.warn('[workspace] read error:', error);
          return null;
        }
        if (!own) {
          // Atleta logou mas trigger não criou workspace — cria agora.
          const { data: created, error: createError } = await supabase
            .from('workspaces')
            .insert({ athlete_user_id: user!.id } as never)
            .select('id, athlete_user_id')
            .maybeSingle();
          if (createError) {
            // eslint-disable-next-line no-console
            console.warn('[workspace] create error:', createError);
            return null;
          }
          if (!created) return null;
          const c = created as { id: string; athlete_user_id: string };
          return { id: c.id, athlete_user_id: c.athlete_user_id, is_athlete: true, is_coach: false };
        }
        const row = own as { id: string; athlete_user_id: string };
        return { id: row.id, athlete_user_id: row.athlete_user_id, is_athlete: true, is_coach: false };
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn('[workspace] exception:', e);
        return null;
      }
    },
    retry: 1,
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
        const { data: hasPlan, error: planError } = await supabase
          .from('workout_plans')
          .select('id')
          .eq('workspace_id', ws.id)
          .eq('active', true)
          .maybeSingle();
        if (planError) {
          // eslint-disable-next-line no-console
          console.warn('[workspace] check plan error:', planError);
          return;
        }
        if (!hasPlan && !cancelled) {
          const { error: seedError } = await supabase.rpc('seed_modo_caverna_protocol', { ws: ws.id } as never);
          if (seedError) {
            // eslint-disable-next-line no-console
            console.warn('[workspace] seed error:', seedError);
          }
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn('[workspace] seed exception:', e);
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

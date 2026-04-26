'use client';

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
 * Erros silenciosos (não derrubam a tela).
 *
 * NÃO faz auto-seed do protocolo. Plano de treino e dieta agora são
 * sempre criados pelo coach via painel.
 */
export function useActiveWorkspace() {
  const { user, loading: sessionLoading } = useSession();

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

  return {
    workspace: query.data ?? null,
    loading: sessionLoading || query.isLoading,
    error: query.error,
  };
}

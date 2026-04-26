'use client';

import { useQuery } from '@tanstack/react-query';
import { getSupabaseBrowserClient } from './client';
import { useSession } from './useSession';

export type Role = 'athlete' | 'coach';

export interface WorkspaceMembership {
  id: string;
  athlete_user_id: string;
  is_athlete: boolean;
  is_coach: boolean;
}

export interface ActiveWorkspaceState {
  workspace: WorkspaceMembership | null;
  role: Role | null;
  loading: boolean;
  error: unknown;
}

/**
 * Retorna role + workspace do usuário atual.
 * - Atleta: o próprio workspace (cria se não existir)
 * - Coach: workspace é null (coach usa /coach panel pra escolher atleta)
 */
export function useActiveWorkspace(): ActiveWorkspaceState {
  const { user, loading: sessionLoading } = useSession();

  const query = useQuery({
    queryKey: ['workspace:active', user?.id],
    enabled: !!user,
    queryFn: async (): Promise<{ role: Role | null; workspace: WorkspaceMembership | null }> => {
      const supabase = getSupabaseBrowserClient();
      try {
        // 1) Busca role do profile primeiro
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user!.id)
          .maybeSingle();
        const role = ((profile as { role: Role } | null)?.role ?? 'athlete') as Role;

        // 2) Coach: não tem workspace próprio
        if (role === 'coach') {
          return { role: 'coach', workspace: null };
        }

        // 3) Atleta: busca workspace
        const { data: own, error } = await supabase
          .from('workspaces')
          .select('id, athlete_user_id')
          .eq('athlete_user_id', user!.id)
          .maybeSingle();
        if (error) {
          // eslint-disable-next-line no-console
          console.warn('[workspace] read error:', error);
          return { role: 'athlete', workspace: null };
        }
        if (own) {
          const row = own as { id: string; athlete_user_id: string };
          return {
            role: 'athlete',
            workspace: { id: row.id, athlete_user_id: row.athlete_user_id, is_athlete: true, is_coach: false },
          };
        }

        // 4) Atleta sem workspace — cria
        const { data: created, error: createError } = await supabase
          .from('workspaces')
          .insert({ athlete_user_id: user!.id } as never)
          .select('id, athlete_user_id')
          .maybeSingle();
        if (createError) {
          // eslint-disable-next-line no-console
          console.warn('[workspace] create error:', createError);
          return { role: 'athlete', workspace: null };
        }
        if (!created) return { role: 'athlete', workspace: null };
        const c = created as { id: string; athlete_user_id: string };
        return {
          role: 'athlete',
          workspace: { id: c.id, athlete_user_id: c.athlete_user_id, is_athlete: true, is_coach: false },
        };
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn('[workspace] exception:', e);
        return { role: null, workspace: null };
      }
    },
    retry: 1,
  });

  return {
    workspace: query.data?.workspace ?? null,
    role: query.data?.role ?? null,
    loading: sessionLoading || query.isLoading,
    error: query.error,
  };
}

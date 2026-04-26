'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

export interface CoachAtleta {
  workspaceId: string;
  athleteUserId: string;
  athleteName: string;
  athleteEmail: string | null;
  invitedAt: string;
}

/** Lista de atletas vinculados ao coach logado. */
export function useCoachAtletas(coachUserId: string | null) {
  return useQuery({
    queryKey: ['coach:atletas', coachUserId],
    enabled: !!coachUserId,
    queryFn: async (): Promise<CoachAtleta[]> => {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase
        .from('coach_workspaces')
        .select('workspace_id, invited_at, workspaces!inner(athlete_user_id, profiles:profiles!workspaces_athlete_user_id_fkey(full_name))')
        .eq('coach_user_id', coachUserId!)
        .order('invited_at', { ascending: false });
      if (error) throw error;
      type Row = {
        workspace_id: string;
        invited_at: string;
        workspaces: {
          athlete_user_id: string;
          profiles: { full_name: string } | null;
        };
      };
      return (data as unknown as Row[]).map((r) => ({
        workspaceId: r.workspace_id,
        athleteUserId: r.workspaces.athlete_user_id,
        athleteName: r.workspaces.profiles?.full_name ?? 'Atleta',
        athleteEmail: null,
        invitedAt: r.invited_at,
      }));
    },
  });
}

/**
 * Atleta gera um código de convite (workspace.invite_code).
 * Coach usa o código pra criar entry em coach_workspaces.
 */

const INVITE_TTL_HOURS = 48;

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

export function useGenerateInvite(workspaceId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!workspaceId) throw new Error('no workspace');
      const supabase = getSupabaseBrowserClient();
      const code = generateCode();
      const expiresAt = new Date(Date.now() + INVITE_TTL_HOURS * 3600 * 1000).toISOString();
      const { error } = await supabase
        .from('workspaces')
        .update({ invite_code: code, invite_expires_at: expiresAt } as never)
        .eq('id', workspaceId);
      if (error) throw error;
      return { code, expiresAt };
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['workspace:active'] }),
  });
}

export function useRedeemInvite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (code: string) => {
      const supabase = getSupabaseBrowserClient();
      // 1) busca workspace pelo código
      // RPC atômica — tudo numa transação no banco
      const { data, error } = await supabase.rpc('redeem_invite_code', { code } as never);
      if (error) throw error;
      const result = data as unknown as string;
      if (result !== 'ok') {
        const REDEEM_ERRORS: Record<string, string> = {
          unauthenticated: 'Sessão expirada. Faça login novamente.',
          invalid_code: 'Código inválido.',
          expired: 'Código expirado — peça um novo ao atleta.',
          cannot_invite_self: 'Você não pode se vincular ao seu próprio workspace.',
        };
        throw new Error(REDEEM_ERRORS[result] ?? 'Erro: ' + result);
      }
      return result;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['coach:atletas'] });
      qc.invalidateQueries({ queryKey: ['workspace:active'] });
      qc.invalidateQueries({ queryKey: ['athlete:profile'] });
    },
  });
}

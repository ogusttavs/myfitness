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
      const { data, error: findError } = await supabase
        .from('workspaces')
        .select('id, invite_expires_at')
        .eq('invite_code', code.toUpperCase())
        .maybeSingle();
      if (findError) throw findError;
      const ws = data as { id: string; invite_expires_at: string | null } | null;
      if (!ws) throw new Error('Código inválido');
      if (ws.invite_expires_at && new Date(ws.invite_expires_at) < new Date()) {
        throw new Error('Código expirado — peça um novo');
      }
      // 2) cria vínculo coach
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');
      const { error: linkError } = await supabase
        .from('coach_workspaces')
        .insert({ workspace_id: ws.id, coach_user_id: user.id } as never);
      if (linkError) throw linkError;
      // 3) limpa código (só pode ser usado uma vez)
      await supabase
        .from('workspaces')
        .update({ invite_code: null, invite_expires_at: null } as never)
        .eq('id', ws.id);
      // 4) garante que profile do coach existe e tem role coach
      await supabase
        .from('profiles')
        .upsert({ id: user.id, full_name: user.email?.split('@')[0] ?? 'Coach', role: 'coach' } as never);
      return ws.id;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['coach:atletas'] });
      qc.invalidateQueries({ queryKey: ['workspace:active'] });
    },
  });
}

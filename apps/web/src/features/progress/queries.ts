'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

export interface WeightEntry {
  id: string;
  weight_kg: number;
  logged_at: string;
}

export interface PhotoEntry {
  id: string;
  angle: 'front' | 'side' | 'back';
  storage_path: string;
  signed_url?: string;
  taken_on: string;
  weight_kg: number | null;
  note: string | null;
}

// ─── Pesagens ────────────────────────────────────────────

export function useWeightLogs(workspaceId: string | null) {
  return useQuery({
    queryKey: ['weight_logs', workspaceId],
    enabled: !!workspaceId,
    queryFn: async (): Promise<WeightEntry[]> => {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase
        .from('weight_logs')
        .select('id, weight_kg, logged_at')
        .eq('workspace_id', workspaceId!)
        .order('logged_at', { ascending: false });
      if (error) throw error;
      const rows = (data ?? []) as Array<{ id: string; weight_kg: number | string; logged_at: string }>;
      return rows.map((d) => ({ id: d.id, logged_at: d.logged_at, weight_kg: Number(d.weight_kg) }));
    },
  });
}

export function useAddWeight(workspaceId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (weightKg: number) => {
      if (!workspaceId) throw new Error('no workspace');
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase
        .from('weight_logs')
        .insert({ workspace_id: workspaceId, weight_kg: weightKg } as never);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['weight_logs', workspaceId] }),
  });
}

// ─── Fotos ────────────────────────────────────────────────

const SIGN_TTL_SECONDS = 60 * 60; // 1h

export function usePhotos(workspaceId: string | null) {
  return useQuery({
    queryKey: ['progress_photos', workspaceId],
    enabled: !!workspaceId,
    queryFn: async (): Promise<PhotoEntry[]> => {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase
        .from('progress_photos')
        .select('id, angle, storage_path, taken_on, weight_kg, note')
        .eq('workspace_id', workspaceId!)
        .order('taken_on', { ascending: false });
      if (error) throw error;
      const rows = data ?? [];

      // gera signed URLs em batch
      const paths = rows.map((r) => r.storage_path);
      if (paths.length === 0) return [];
      const { data: signed } = await supabase.storage
        .from('progress-photos')
        .createSignedUrls(paths, SIGN_TTL_SECONDS);
      const byPath = new Map((signed ?? []).map((s) => [s.path!, s.signedUrl]));

      return rows.map((r) => ({
        ...r,
        weight_kg: r.weight_kg !== null ? Number(r.weight_kg) : null,
        signed_url: byPath.get(r.storage_path),
      }));
    },
  });
}

export interface UploadPhotoInput {
  workspaceId: string;
  file: File;
  angle: 'front' | 'side' | 'back';
  takenOn: string; // YYYY-MM-DD
  weightKg?: number;
  note?: string;
}

export function useUploadPhoto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: UploadPhotoInput) => {
      const supabase = getSupabaseBrowserClient();
      const ext = (input.file.name.split('.').pop() ?? 'jpg').toLowerCase();
      const key = `${input.workspaceId}/${input.takenOn}_${input.angle}_${crypto.randomUUID()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('progress-photos')
        .upload(key, input.file, {
          cacheControl: '3600',
          upsert: false,
          contentType: input.file.type,
        });
      if (uploadError) throw uploadError;

      const { error: dbError } = await supabase.from('progress_photos').insert({
        workspace_id: input.workspaceId,
        angle: input.angle,
        storage_path: key,
        taken_on: input.takenOn,
        weight_kg: input.weightKg ?? null,
        note: input.note ?? null,
      });
      if (dbError) {
        // limpa o arquivo se inserção falhou
        await supabase.storage.from('progress-photos').remove([key]);
        throw dbError;
      }
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ['progress_photos', vars.workspaceId] });
    },
  });
}

export function useDeletePhoto(workspaceId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (photo: { id: string; storage_path: string }) => {
      const supabase = getSupabaseBrowserClient();
      await supabase.storage.from('progress-photos').remove([photo.storage_path]);
      const { error } = await supabase.from('progress_photos').delete().eq('id', photo.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['progress_photos', workspaceId] }),
  });
}

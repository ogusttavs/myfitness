'use client';

import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { newClientId } from '@/lib/idempotency';
import type { SetLog, WorkoutSession } from '@/stores/workoutSession';
import type { WorkoutDay } from '@/data/protocol';

/**
 * Sincroniza sessão local (Zustand) com Supabase.
 * - startSession: cria workout_sessions com plan_snapshot JSONB
 * - logSet: insere set_logs com client_id (idempotência)
 * - finishSession: marca finished_at
 *
 * Falhas silenciosas — local sempre é fonte da verdade durante o treino.
 * Sync é "best effort" pra coach ver e pra histórico no Postgres.
 *
 * Refs: REVIEW.md CDD-06 (parcial — Zustand continua no comando)
 */

interface ExerciseId {
  name: string;
  id: string | null;
}

let exerciseIdCache: Map<string, string> | null = null;

async function loadExerciseIds(): Promise<Map<string, string>> {
  if (exerciseIdCache) return exerciseIdCache;
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase.from('exercises_catalog').select('id, name');
  if (error) {
    // eslint-disable-next-line no-console
    console.warn('[sync] catalog read error:', error);
    return new Map();
  }
  const map = new Map<string, string>();
  (data as Array<{ id: string; name: string }> | null)?.forEach((e) => map.set(e.name, e.id));
  exerciseIdCache = map;
  return map;
}

/** Cria session no Supabase ao iniciar treino. Retorna o session_id. */
export async function syncStartSession(
  workspaceId: string,
  day: WorkoutDay,
): Promise<string | null> {
  const supabase = getSupabaseBrowserClient();
  const ids = await loadExerciseIds();

  const planSnapshot = {
    day_index: day.index,
    code: day.code,
    name: day.name,
    focus: day.focus,
    cardioMinutes: day.cardioMinutes,
    exercises: day.exercises.map((ex) => ({
      name: ex.name,
      exercise_id: ids.get(ex.name) ?? null,
      sets: ex.sets,
      reps: ex.reps,
      restSeconds: ex.restSeconds,
    })),
  };

  // plan_day_id pode ser null se não tiver mapeamento — não bloqueia.
  const { data, error } = await supabase
    .from('workout_sessions')
    .insert({
      workspace_id: workspaceId,
      plan_day_id: null,
      plan_snapshot: planSnapshot,
    } as never)
    .select('id')
    .maybeSingle();

  if (error) {
    // eslint-disable-next-line no-console
    console.warn('[sync] startSession error:', error);
    return null;
  }
  return (data as { id: string } | null)?.id ?? null;
}

/** Insere uma série no Supabase. Idempotente via client_id. */
export async function syncLogSet(
  sessionId: string,
  log: Omit<SetLog, 'loggedAt'>,
  clientId: string = newClientId(),
): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  const ids = await loadExerciseIds();
  const exId = ids.get(log.exerciseName);
  if (!exId) {
    // eslint-disable-next-line no-console
    console.warn('[sync] exercise not in catalog, skipping:', log.exerciseName);
    return;
  }
  const { error } = await supabase.from('set_logs').insert({
    client_id: clientId,
    session_id: sessionId,
    exercise_id: exId,
    set_number: log.setNumber,
    weight_kg: log.weightKg,
    reps_done: log.reps,
  } as never);
  if (error && !/duplicate key|already exists/i.test(error.message ?? '')) {
    // eslint-disable-next-line no-console
    console.warn('[sync] logSet error:', error);
  }
}

/** Marca sessão como finalizada. */
export async function syncFinishSession(sessionId: string, session: WorkoutSession): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase
    .from('workout_sessions')
    .update({ finished_at: new Date(session.finishedAt ?? Date.now()).toISOString() } as never)
    .eq('id', sessionId);
  if (error) {
    // eslint-disable-next-line no-console
    console.warn('[sync] finishSession error:', error);
  }
}

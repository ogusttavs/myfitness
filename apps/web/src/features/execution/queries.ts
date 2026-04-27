import { useQuery } from '@tanstack/react-query';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import type { WorkoutDay } from '@/data/protocol';

type DayCode = WorkoutDay['code'];

// Lookup do que NÃO está no banco hoje (focus, cardio options, label).
// `code` mapeia 1:1 com `workout_plan_days.name` no seed Modo Caverna.
const DAY_META: Record<DayCode, { focus: string; cardioOptions: string; label: string }> = {
  PUSH: { focus: 'Peito, Ombro e Tríceps', cardioOptions: 'Bike ou esteira', label: 'Dia 1 — Push' },
  PULL: { focus: 'Costas e Bíceps', cardioOptions: 'Bike ou esteira', label: 'Dia 2 — Pull' },
  LEGS: { focus: 'Pernas Completo', cardioOptions: 'Bike ou esteira', label: 'Dia 3 — Legs' },
  UPPER: { focus: 'Superior Completo', cardioOptions: 'Bike ou esteira', label: 'Dia 4 — Upper' },
  LOWER: { focus: 'Inferior e Core', cardioOptions: 'Bike ou esteira', label: 'Dia 5 — Lower' },
};

const VALID_CODES = new Set<string>(Object.keys(DAY_META));

type DbDayRow = {
  id: string;
  day_index: number;
  name: string;
  cardio_minutes: number | null;
  workout_plan_exercises: Array<{
    ord: number;
    sets: number;
    reps_target: string;
    rest_seconds: number;
    exercises_catalog: { name: string } | null;
  }>;
};

function dbDayToWorkoutDay(row: DbDayRow): WorkoutDay | null {
  const code = row.name.toUpperCase() as DayCode;
  if (!VALID_CODES.has(code)) return null;
  const meta = DAY_META[code];
  const exercises = [...row.workout_plan_exercises]
    .sort((a, b) => a.ord - b.ord)
    .map((ex) => ({
      name: ex.exercises_catalog?.name ?? '—',
      sets: ex.sets,
      reps: ex.reps_target,
      restSeconds: ex.rest_seconds,
    }));
  return {
    index: row.day_index,
    code,
    name: meta.label,
    focus: meta.focus,
    cardioMinutes: row.cardio_minutes ?? 0,
    cardioOptions: meta.cardioOptions,
    exercises,
  };
}

/**
 * Carrega o plano de treino ativo do workspace e retorna os dias na shape `WorkoutDay`
 * (mesma usada pelo seed estático em `src/data/protocol.ts`).
 *
 * Retorna `null` no `data` quando o workspace ainda não tem plano ativo — caller decide
 * se faz fallback no seed.
 */
export function useActiveWorkoutPlan(workspaceId: string | null | undefined) {
  return useQuery({
    enabled: !!workspaceId,
    queryKey: ['workout:active-plan', workspaceId],
    queryFn: async (): Promise<WorkoutDay[] | null> => {
      const supabase = getSupabaseBrowserClient();
      const { data: plan } = await supabase
        .from('workout_plans')
        .select('id')
        .eq('workspace_id', workspaceId!)
        .eq('active', true)
        .maybeSingle();
      if (!plan) return null;

      const { data: days, error } = await supabase
        .from('workout_plan_days')
        .select('id, day_index, name, cardio_minutes, workout_plan_exercises(ord, sets, reps_target, rest_seconds, exercises_catalog(name))')
        .eq('plan_id', (plan as { id: string }).id)
        .order('day_index', { ascending: true });
      if (error) throw error;
      if (!days) return null;

      const mapped = (days as unknown as DbDayRow[])
        .map(dbDayToWorkoutDay)
        .filter((d): d is WorkoutDay => d !== null);
      return mapped;
    },
    staleTime: 30_000,
  });
}

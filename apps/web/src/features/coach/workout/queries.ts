import { useQuery } from '@tanstack/react-query';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

export type CoachExerciseRow = {
  id: string;
  ord: number;
  sets: number;
  reps_target: string;
  rest_seconds: number;
  exercise_id: string;
  exercise_name: string;
};

export type CoachDay = {
  id: string;
  plan_id: string;
  day_index: number;
  name: string;
  cardio_minutes: number;
  exercises: CoachExerciseRow[];
};

type DbDayRow = {
  id: string;
  plan_id: string;
  day_index: number;
  name: string;
  cardio_minutes: number | null;
  workout_plan_exercises: Array<{
    id: string;
    ord: number;
    sets: number;
    reps_target: string;
    rest_seconds: number;
    exercise_id: string;
    exercises_catalog: { name: string } | null;
  }>;
};

export function coachWorkoutKeys(workspaceId: string) {
  return ['coach:workout', workspaceId] as const;
}

/**
 * Carrega o plano de treino ativo do workspace com IDs reais do banco —
 * usado pelo editor do coach.
 */
export function useCoachWorkoutPlan(workspaceId: string | null | undefined) {
  return useQuery({
    enabled: !!workspaceId,
    queryKey: workspaceId ? coachWorkoutKeys(workspaceId) : ['coach:workout', 'none'],
    queryFn: async (): Promise<CoachDay[] | null> => {
      const supabase = getSupabaseBrowserClient();
      const { data: plan } = await supabase
        .from('workout_plans')
        .select('id')
        .eq('workspace_id', workspaceId!)
        .eq('active', true)
        .maybeSingle();
      if (!plan) return null;
      const planId = (plan as { id: string }).id;

      const { data: days, error } = await supabase
        .from('workout_plan_days')
        .select('id, plan_id, day_index, name, cardio_minutes, workout_plan_exercises(id, ord, sets, reps_target, rest_seconds, exercise_id, exercises_catalog(name))')
        .eq('plan_id', planId)
        .order('day_index', { ascending: true });
      if (error) throw error;

      return (days as unknown as DbDayRow[]).map((d) => ({
        id: d.id,
        plan_id: d.plan_id,
        day_index: d.day_index,
        name: d.name,
        cardio_minutes: d.cardio_minutes ?? 0,
        exercises: [...d.workout_plan_exercises]
          .sort((a, b) => a.ord - b.ord)
          .map((ex) => ({
            id: ex.id,
            ord: ex.ord,
            sets: ex.sets,
            reps_target: ex.reps_target,
            rest_seconds: ex.rest_seconds,
            exercise_id: ex.exercise_id,
            exercise_name: ex.exercises_catalog?.name ?? '—',
          })),
      }));
    },
    staleTime: 10_000,
  });
}

export type ExerciseCatalogItem = {
  id: string;
  name: string;
  muscle_group: string;
};

export function useExercisesCatalog() {
  return useQuery({
    queryKey: ['catalog:exercises'],
    queryFn: async (): Promise<ExerciseCatalogItem[]> => {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase
        .from('exercises_catalog')
        .select('id, name, muscle_group')
        .order('name', { ascending: true });
      if (error) throw error;
      return (data as unknown as ExerciseCatalogItem[]) ?? [];
    },
    staleTime: 5 * 60_000,
  });
}

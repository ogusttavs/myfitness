import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { coachWorkoutKeys } from './queries';

type UpdateExerciseInput = {
  workspaceId: string;
  exerciseRowId: string;
  patch: Partial<{
    sets: number;
    reps_target: string;
    rest_seconds: number;
    exercise_id: string;
  }>;
};

export function useUpdateExerciseRow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ exerciseRowId, patch }: UpdateExerciseInput) => {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase
        .from('workout_plan_exercises')
        .update(patch as never)
        .eq('id', exerciseRowId);
      if (error) throw error;
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: coachWorkoutKeys(vars.workspaceId) });
    },
  });
}

type AddExerciseInput = {
  workspaceId: string;
  dayId: string;
  exerciseId: string;
  sets: number;
  reps_target: string;
  rest_seconds: number;
  ord: number;
};

export function useAddExercise() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ dayId, exerciseId, sets, reps_target, rest_seconds, ord }: AddExerciseInput) => {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase
        .from('workout_plan_exercises')
        .insert({
          day_id: dayId,
          exercise_id: exerciseId,
          ord,
          sets,
          reps_target,
          rest_seconds,
        } as never);
      if (error) throw error;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: coachWorkoutKeys(vars.workspaceId) });
    },
  });
}

type DeleteExerciseInput = {
  workspaceId: string;
  exerciseRowId: string;
};

export function useDeleteExercise() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ exerciseRowId }: DeleteExerciseInput) => {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase
        .from('workout_plan_exercises')
        .delete()
        .eq('id', exerciseRowId);
      if (error) throw error;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: coachWorkoutKeys(vars.workspaceId) });
    },
  });
}

type UpdateDayInput = {
  workspaceId: string;
  dayId: string;
  patch: Partial<{ cardio_minutes: number; name: string }>;
};

export function useUpdateDay() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ dayId, patch }: UpdateDayInput) => {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase
        .from('workout_plan_days')
        .update(patch as never)
        .eq('id', dayId);
      if (error) throw error;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: coachWorkoutKeys(vars.workspaceId) });
    },
  });
}

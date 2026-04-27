import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { coachMealKeys } from './queries';

type Patch<T> = Partial<T>;

type UpdateItemInput = {
  workspaceId: string;
  itemId: string;
  patch: Patch<{
    description: string;
    quantity: number | null;
    unit: string | null;
    food_id: string | null;
    est_kcal: number | null;
    est_protein_g: number | null;
    est_carb_g: number | null;
    est_fat_g: number | null;
  }>;
};

export function useUpdateMealItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ itemId, patch }: UpdateItemInput) => {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase
        .from('meal_plan_items')
        .update(patch as never)
        .eq('id', itemId);
      if (error) throw error;
    },
    onSuccess: (_d, vars) => qc.invalidateQueries({ queryKey: coachMealKeys(vars.workspaceId) }),
  });
}

type AddItemInput = {
  workspaceId: string;
  mealId: string;
  description: string;
  food_id?: string | null;
  est_kcal?: number | null;
  est_protein_g?: number | null;
  est_carb_g?: number | null;
  est_fat_g?: number | null;
};

export function useAddMealItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: AddItemInput) => {
      const supabase = getSupabaseBrowserClient();
      const { workspaceId: _ws, mealId, ...rest } = input;
      const { error } = await supabase
        .from('meal_plan_items')
        .insert({ meal_id: mealId, ...rest } as never);
      if (error) throw error;
    },
    onSuccess: (_d, vars) => qc.invalidateQueries({ queryKey: coachMealKeys(vars.workspaceId) }),
  });
}

type DeleteItemInput = { workspaceId: string; itemId: string };

export function useDeleteMealItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ itemId }: DeleteItemInput) => {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.from('meal_plan_items').delete().eq('id', itemId);
      if (error) throw error;
    },
    onSuccess: (_d, vars) => qc.invalidateQueries({ queryKey: coachMealKeys(vars.workspaceId) }),
  });
}

type UpdateMealInput = {
  workspaceId: string;
  mealId: string;
  patch: Patch<{ name: string; scheduled_time: string | null }>;
};

export function useUpdateMeal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ mealId, patch }: UpdateMealInput) => {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase
        .from('meal_plan_meals')
        .update(patch as never)
        .eq('id', mealId);
      if (error) throw error;
    },
    onSuccess: (_d, vars) => qc.invalidateQueries({ queryKey: coachMealKeys(vars.workspaceId) }),
  });
}

type UpdatePlanInput = {
  workspaceId: string;
  planId: string;
  patch: Patch<{ kcal_target: number; protein_g: number; carb_g: number; fat_g: number }>;
};

export function useUpdateMealPlanMacros() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ planId, patch }: UpdatePlanInput) => {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase
        .from('meal_plans')
        .update(patch as never)
        .eq('id', planId);
      if (error) throw error;
    },
    onSuccess: (_d, vars) => qc.invalidateQueries({ queryKey: coachMealKeys(vars.workspaceId) }),
  });
}

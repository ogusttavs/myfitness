import { useQuery } from '@tanstack/react-query';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

export type CoachMealItem = {
  id: string;
  food_id: string | null;
  description: string;
  quantity: number | null;
  unit: string | null;
  est_kcal: number | null;
  est_protein_g: number | null;
  est_carb_g: number | null;
  est_fat_g: number | null;
};

export type CoachMeal = {
  id: string;
  ord: number;
  name: string;
  scheduled_time: string | null;
  items: CoachMealItem[];
};

export type CoachMealPlan = {
  id: string;
  name: string;
  kcal_target: number | null;
  protein_g: number | null;
  carb_g: number | null;
  fat_g: number | null;
  meals: CoachMeal[];
};

type DbMealRow = {
  id: string;
  ord: number;
  name: string;
  scheduled_time: string | null;
  meal_plan_items: Array<CoachMealItem>;
};

export function coachMealKeys(workspaceId: string) {
  return ['coach:meals', workspaceId] as const;
}

export function useCoachMealPlan(workspaceId: string | null | undefined) {
  return useQuery({
    enabled: !!workspaceId,
    queryKey: workspaceId ? coachMealKeys(workspaceId) : ['coach:meals', 'none'],
    queryFn: async (): Promise<CoachMealPlan | null> => {
      const supabase = getSupabaseBrowserClient();
      const { data: plan } = await supabase
        .from('meal_plans')
        .select('id, name, kcal_target, protein_g, carb_g, fat_g')
        .eq('workspace_id', workspaceId!)
        .eq('active', true)
        .maybeSingle();
      if (!plan) return null;
      const planRow = plan as { id: string; name: string; kcal_target: number | null; protein_g: number | null; carb_g: number | null; fat_g: number | null };

      const { data: meals, error } = await supabase
        .from('meal_plan_meals')
        .select('id, ord, name, scheduled_time, meal_plan_items(id, food_id, description, quantity, unit, est_kcal, est_protein_g, est_carb_g, est_fat_g)')
        .eq('plan_id', planRow.id)
        .order('ord', { ascending: true });
      if (error) throw error;

      return {
        ...planRow,
        meals: (meals as unknown as DbMealRow[]).map((m) => ({
          id: m.id,
          ord: m.ord,
          name: m.name,
          scheduled_time: m.scheduled_time,
          items: m.meal_plan_items ?? [],
        })),
      };
    },
    staleTime: 10_000,
  });
}

export type FoodCatalogItem = {
  id: string;
  name: string;
  default_unit: string;
  kcal_per_unit: number | null;
  protein_g: number | null;
  carb_g: number | null;
  fat_g: number | null;
};

export function useFoodsCatalog() {
  return useQuery({
    queryKey: ['catalog:foods'],
    queryFn: async (): Promise<FoodCatalogItem[]> => {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase
        .from('foods_catalog')
        .select('id, name, default_unit, kcal_per_unit, protein_g, carb_g, fat_g')
        .order('name', { ascending: true });
      if (error) throw error;
      return (data as unknown as FoodCatalogItem[]) ?? [];
    },
    staleTime: 5 * 60_000,
  });
}

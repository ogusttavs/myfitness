/**
 * Tipos do banco — substituir por geração automática via:
 *   npx supabase gen types typescript --project-id <id> > src/lib/supabase/database.types.ts
 *
 * Este scaffold cobre as tabelas definidas em docs/db/SCHEMA.md.
 */

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: { id: string; full_name: string; role: 'athlete' | 'coach'; created_at: string };
        Insert: { id: string; full_name: string; role: 'athlete' | 'coach' };
        Update: Partial<{ full_name: string; role: 'athlete' | 'coach' }>;
      };
      workspaces: {
        Row: {
          id: string;
          athlete_user_id: string;
          coach_user_id: string | null;
          invite_code: string | null;
          invite_expires_at: string | null;
          created_at: string;
        };
        Insert: { athlete_user_id: string; coach_user_id?: string | null };
        Update: Partial<{ coach_user_id: string | null; invite_code: string | null; invite_expires_at: string | null }>;
      };
      athlete_data: {
        Row: {
          workspace_id: string;
          age: number | null;
          height_cm: number | null;
          weight_kg: number | null;
          level: 'iniciante' | 'intermediario' | 'avancado' | null;
          goal: string | null;
          weekly_frequency: number | null;
          updated_at: string;
        };
        Insert: { workspace_id: string } & Partial<Database['public']['Tables']['athlete_data']['Row']>;
        Update: Partial<Database['public']['Tables']['athlete_data']['Row']>;
      };
      weight_logs: {
        Row: { id: string; workspace_id: string; weight_kg: number; logged_at: string };
        Insert: { workspace_id: string; weight_kg: number; logged_at?: string };
        Update: Partial<{ weight_kg: number; logged_at: string }>;
      };
      exercises_catalog: {
        Row: { id: string; name: string; muscle_group: string; equipment: string | null; default_unit: string };
        Insert: { name: string; muscle_group: string; equipment?: string | null; default_unit?: string };
        Update: Partial<{ name: string; muscle_group: string; equipment: string | null }>;
      };
      foods_catalog: {
        Row: {
          id: string; name: string; default_unit: string;
          kcal_per_unit: number | null; protein_g: number | null; carb_g: number | null; fat_g: number | null;
        };
        Insert: { name: string; default_unit?: string };
        Update: Partial<Database['public']['Tables']['foods_catalog']['Row']>;
      };
      workout_plans: {
        Row: { id: string; workspace_id: string; name: string; active: boolean; created_at: string };
        Insert: { workspace_id: string; name: string; active?: boolean };
        Update: Partial<{ name: string; active: boolean }>;
      };
      workout_plan_days: {
        Row: { id: string; plan_id: string; day_index: number; name: string; cardio_minutes: number };
        Insert: { plan_id: string; day_index: number; name: string; cardio_minutes?: number };
        Update: Partial<{ name: string; cardio_minutes: number; day_index: number }>;
      };
      workout_plan_exercises: {
        Row: {
          id: string; day_id: string; exercise_id: string; ord: number;
          sets: number; reps_target: string; rest_seconds: number;
        };
        Insert: { day_id: string; exercise_id: string; ord: number; sets: number; reps_target: string; rest_seconds: number };
        Update: Partial<{ ord: number; sets: number; reps_target: string; rest_seconds: number; exercise_id: string }>;
      };
      exercise_variations: {
        Row: { id: string; workspace_id: string; base_exercise_id: string; name: string; notes: string | null };
        Insert: { workspace_id: string; base_exercise_id: string; name: string; notes?: string | null };
        Update: Partial<{ name: string; notes: string | null }>;
      };
      meal_plans: {
        Row: {
          id: string; workspace_id: string; name: string; active: boolean;
          kcal_target: number | null; protein_g: number | null; carb_g: number | null; fat_g: number | null;
          created_at: string;
        };
        Insert: { workspace_id: string; name: string; active?: boolean; kcal_target?: number; protein_g?: number; carb_g?: number; fat_g?: number };
        Update: Partial<Database['public']['Tables']['meal_plans']['Row']>;
      };
      meal_plan_meals: {
        Row: { id: string; plan_id: string; ord: number; name: string };
        Insert: { plan_id: string; ord: number; name: string };
        Update: Partial<{ ord: number; name: string }>;
      };
      meal_plan_items: {
        Row: { id: string; meal_id: string; food_id: string | null; description: string; quantity: number | null; unit: string | null };
        Insert: { meal_id: string; description: string; food_id?: string | null; quantity?: number | null; unit?: string | null };
        Update: Partial<{ description: string; food_id: string | null; quantity: number | null; unit: string | null }>;
      };
      food_variations: {
        Row: {
          id: string; workspace_id: string; base_item_id: string;
          description: string; food_id: string | null; quantity: number | null; unit: string | null; notes: string | null;
        };
        Insert: { workspace_id: string; base_item_id: string; description: string };
        Update: Partial<Database['public']['Tables']['food_variations']['Row']>;
      };
      workout_sessions: {
        Row: {
          id: string; workspace_id: string; plan_day_id: string | null;
          started_at: string; finished_at: string | null;
          plan_snapshot: unknown; created_at: string;
        };
        Insert: { workspace_id: string; plan_day_id: string | null; plan_snapshot: unknown; started_at?: string };
        Update: Partial<{ finished_at: string | null }>;
      };
      set_logs: {
        Row: {
          id: string; client_id: string; session_id: string; exercise_id: string;
          variation_id: string | null; set_number: number;
          weight_kg: number | null; reps_done: number | null; rpe: number | null; note: string | null;
          created_at: string;
        };
        Insert: {
          client_id: string; session_id: string; exercise_id: string; set_number: number;
          variation_id?: string | null; weight_kg?: number | null; reps_done?: number | null; rpe?: number | null; note?: string | null;
        };
        Update: Partial<Database['public']['Tables']['set_logs']['Row']>;
      };
      meal_logs: {
        Row: {
          id: string; client_id: string; workspace_id: string;
          plan_meal_id: string | null; variation_id: string | null;
          consumed_at: string; note: string | null;
        };
        Insert: { client_id: string; workspace_id: string; plan_meal_id: string | null; variation_id?: string | null; consumed_at?: string; note?: string | null };
        Update: Partial<{ note: string | null; variation_id: string | null }>;
      };
      progress_photos: {
        Row: {
          id: string; workspace_id: string; angle: 'front' | 'back' | 'side';
          storage_path: string; taken_on: string; weight_kg: number | null;
        };
        Insert: { workspace_id: string; angle: 'front' | 'back' | 'side'; storage_path: string; taken_on: string; weight_kg?: number | null };
        Update: Partial<{ weight_kg: number | null }>;
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_workspace_member: { Args: { ws: string }; Returns: boolean };
    };
    Enums: Record<string, never>;
  };
}

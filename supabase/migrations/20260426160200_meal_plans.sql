-- ─────────────────────────────────────────────────────────────────────
-- Meal plans (template) + variações + log de consumo
-- ─────────────────────────────────────────────────────────────────────

create table public.meal_plans (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  active boolean not null default false,
  kcal_target int,
  protein_g int,
  carb_g int,
  fat_g int,
  created_at timestamptz not null default now()
);
create unique index meal_plans_one_active
  on public.meal_plans (workspace_id) where active;
alter table public.meal_plans enable row level security;
create policy "ws members rw meal_plans" on public.meal_plans
  for all using (is_workspace_member(workspace_id));

create table public.meal_plan_meals (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.meal_plans(id) on delete cascade,
  ord int not null,
  name text not null,
  scheduled_time text  -- 'HH:MM'
);
alter table public.meal_plan_meals enable row level security;
create policy "ws via meal plan" on public.meal_plan_meals
  for all using (plan_id in (
    select id from public.meal_plans where is_workspace_member(workspace_id)
  ));

create table public.meal_plan_items (
  id uuid primary key default gen_random_uuid(),
  meal_id uuid not null references public.meal_plan_meals(id) on delete cascade,
  food_id uuid references public.foods_catalog(id),
  description text not null,
  quantity numeric(8,2),
  unit text,
  est_kcal numeric(7,2),
  est_protein_g numeric(6,2),
  est_carb_g numeric(6,2),
  est_fat_g numeric(6,2)
);
alter table public.meal_plan_items enable row level security;
create policy "ws via meal" on public.meal_plan_items
  for all using (meal_id in (
    select id from public.meal_plan_meals where plan_id in (
      select id from public.meal_plans where is_workspace_member(workspace_id)
    )
  ));

create table public.food_variations (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  base_item_id uuid not null references public.meal_plan_items(id) on delete cascade,
  description text not null,
  food_id uuid references public.foods_catalog(id),
  quantity numeric(8,2),
  unit text,
  notes text
);
alter table public.food_variations enable row level security;
create policy "ws members rw food_variations" on public.food_variations
  for all using (is_workspace_member(workspace_id));

-- ── Log de refeições consumidas ──────────────────────────

create table public.meal_logs (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null unique,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  plan_meal_id uuid references public.meal_plan_meals(id),
  variation_id uuid references public.food_variations(id),
  date date not null,
  done boolean not null default true,
  consumed_at timestamptz,
  note text,
  updated_at timestamptz not null default now()
);
create index on public.meal_logs (workspace_id, date desc);
create unique index meal_logs_unique_per_day on public.meal_logs (workspace_id, plan_meal_id, date);
alter table public.meal_logs enable row level security;
create policy "ws members read meal_logs" on public.meal_logs
  for select using (is_workspace_member(workspace_id));
create policy "athlete writes meal_logs" on public.meal_logs
  for all using (
    workspace_id in (select id from public.workspaces where athlete_user_id = auth.uid())
  );

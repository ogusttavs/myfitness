-- ─────────────────────────────────────────────────────────────────────
-- Workout plans (template) + execução (snapshot imutável)
-- ─────────────────────────────────────────────────────────────────────

create table public.workout_plans (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  active boolean not null default false,
  created_at timestamptz not null default now()
);
create unique index workout_plans_one_active
  on public.workout_plans (workspace_id) where active;
alter table public.workout_plans enable row level security;
create policy "ws members rw workout_plans" on public.workout_plans
  for all using (is_workspace_member(workspace_id));

create table public.workout_plan_days (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.workout_plans(id) on delete cascade,
  day_index int not null check (day_index between 0 and 6),
  name text not null,
  cardio_minutes int default 0,
  unique (plan_id, day_index)
);
alter table public.workout_plan_days enable row level security;
create policy "ws via plan" on public.workout_plan_days
  for all using (plan_id in (
    select id from public.workout_plans where is_workspace_member(workspace_id)
  ));

create table public.workout_plan_exercises (
  id uuid primary key default gen_random_uuid(),
  day_id uuid not null references public.workout_plan_days(id) on delete cascade,
  exercise_id uuid not null references public.exercises_catalog(id),
  ord int not null,
  sets int not null,
  reps_target text not null,
  rest_seconds int not null
);
alter table public.workout_plan_exercises enable row level security;
create policy "ws via day" on public.workout_plan_exercises
  for all using (day_id in (
    select id from public.workout_plan_days where plan_id in (
      select id from public.workout_plans where is_workspace_member(workspace_id)
    )
  ));

create table public.exercise_variations (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  base_exercise_id uuid not null references public.exercises_catalog(id),
  name text not null,
  notes text
);
alter table public.exercise_variations enable row level security;
create policy "ws members rw variations" on public.exercise_variations
  for all using (is_workspace_member(workspace_id));

-- ── Execução ──────────────────────────────────────────────

create table public.workout_sessions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  plan_day_id uuid references public.workout_plan_days(id) on delete set null,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  plan_snapshot jsonb not null,
  created_at timestamptz not null default now()
);
create index on public.workout_sessions (workspace_id, started_at desc);
alter table public.workout_sessions enable row level security;
create policy "ws members read sessions" on public.workout_sessions
  for select using (is_workspace_member(workspace_id));
create policy "athlete writes sessions" on public.workout_sessions
  for insert with check (
    workspace_id in (select id from public.workspaces where athlete_user_id = auth.uid())
  );
create policy "athlete updates sessions" on public.workout_sessions
  for update using (
    workspace_id in (select id from public.workspaces where athlete_user_id = auth.uid())
  );

create table public.set_logs (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null unique,
  session_id uuid not null references public.workout_sessions(id) on delete cascade,
  exercise_id uuid not null references public.exercises_catalog(id),
  variation_id uuid references public.exercise_variations(id),
  set_number int not null,
  weight_kg numeric(6,2),
  reps_done int,
  rpe numeric(3,1),
  note text,
  created_at timestamptz not null default now()
);
create index on public.set_logs (session_id, set_number);
create index on public.set_logs (exercise_id, created_at desc);
alter table public.set_logs enable row level security;
create policy "ws members read sets" on public.set_logs
  for select using (session_id in (
    select id from public.workout_sessions where is_workspace_member(workspace_id)
  ));
create policy "athlete writes sets" on public.set_logs
  for insert with check (session_id in (
    select id from public.workout_sessions
    where workspace_id in (select id from public.workspaces where athlete_user_id = auth.uid())
  ));

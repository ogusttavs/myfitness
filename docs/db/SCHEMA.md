# Schema — Modo Caverna (Supabase / Postgres 15+)

> Owner: @data-engineer (Dara)
> Refs: spec.md §6, complexity.json (CDD-04, CDD-05, CDD-06), RISK-02

## Princípios

1. **Single source of permission:** `workspaces` carrega `athlete_user_id` + `coach_user_id` (nullable). Toda tabela de dados tem `workspace_id`.
2. **RLS em TUDO** — sem exceção. Catálogos globais usam policy `FOR SELECT TO authenticated USING (true)`.
3. **Idempotency:** mutations do cliente carregam `client_id UUID UNIQUE` para replay seguro.
4. **Snapshot imutável:** sessões e logs guardam JSONB do plano no momento da execução (CDD-06).
5. **Soft delete deferido para v2** — MVP usa hard delete.

---

## ER (alto nível)

```
auth.users  ──1:1── profiles
                       │
                       │ (athlete or coach)
                       ▼
                  workspaces ──┬── athlete_data (1:1)
                       │       └── weight_logs (1:N)
                       │
       ┌───────────────┼────────────────┐
       │               │                │
  workout_plans   meal_plans      progress_photos
       │               │
   plan_days      plan_meals
       │               │
   plan_exercises  plan_items
       │               │
exercise_variations  food_variations

  Catálogos (global, read-only):
  exercises_catalog
  foods_catalog

  Execução (snapshots):
  workout_sessions ── set_logs
  meal_logs
```

---

## DDL (resumo — migrations completas em `supabase/migrations/`)

### profiles

```sql
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role text not null check (role in ('athlete','coach')),
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy "self read" on public.profiles for select using (id = auth.uid());
create policy "self update" on public.profiles for update using (id = auth.uid());
```

### workspaces

```sql
create table public.workspaces (
  id uuid primary key default gen_random_uuid(),
  athlete_user_id uuid not null references public.profiles(id) on delete cascade,
  coach_user_id uuid references public.profiles(id) on delete set null,
  invite_code text unique,
  invite_expires_at timestamptz,
  created_at timestamptz not null default now(),
  unique (athlete_user_id)  -- 1 workspace por atleta no MVP
);
alter table public.workspaces enable row level security;
```

### Helper: `is_workspace_member`

```sql
create or replace function public.is_workspace_member(ws uuid)
returns boolean
language sql security definer stable as $$
  select exists (
    select 1 from public.workspaces w
    where w.id = ws
      and (w.athlete_user_id = auth.uid() or w.coach_user_id = auth.uid())
  );
$$;
```

```sql
create policy "members read workspace" on public.workspaces
  for select using (athlete_user_id = auth.uid() or coach_user_id = auth.uid());

create policy "athlete updates workspace" on public.workspaces
  for update using (athlete_user_id = auth.uid());
```

### athlete_data (1:1 com workspace)

```sql
create table public.athlete_data (
  workspace_id uuid primary key references public.workspaces(id) on delete cascade,
  age int,
  height_cm int,
  weight_kg numeric(5,2),
  level text check (level in ('iniciante','intermediario','avancado')),
  goal text,
  weekly_frequency int,
  updated_at timestamptz not null default now()
);
alter table public.athlete_data enable row level security;
create policy "members read athlete_data" on public.athlete_data
  for select using (is_workspace_member(workspace_id));
create policy "athlete writes athlete_data" on public.athlete_data
  for all using (
    workspace_id in (select id from public.workspaces where athlete_user_id = auth.uid())
  );
create policy "coach updates athlete_data" on public.athlete_data
  for update using (
    workspace_id in (select id from public.workspaces where coach_user_id = auth.uid())
  );
```

### weight_logs

```sql
create table public.weight_logs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  weight_kg numeric(5,2) not null,
  logged_at timestamptz not null default now()
);
create index on public.weight_logs (workspace_id, logged_at desc);
alter table public.weight_logs enable row level security;
create policy "ws members read" on public.weight_logs for select
  using (is_workspace_member(workspace_id));
create policy "athlete writes" on public.weight_logs for insert
  with check (workspace_id in (
    select id from public.workspaces where athlete_user_id = auth.uid()
  ));
```

### Catálogos globais

```sql
create table public.exercises_catalog (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  muscle_group text not null,
  equipment text,
  default_unit text not null default 'kg'
);
alter table public.exercises_catalog enable row level security;
create policy "all read" on public.exercises_catalog for select
  to authenticated using (true);

create table public.foods_catalog (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  default_unit text not null default 'g',
  kcal_per_unit numeric(7,2),
  protein_g numeric(6,2),
  carb_g numeric(6,2),
  fat_g numeric(6,2)
);
alter table public.foods_catalog enable row level security;
create policy "all read foods" on public.foods_catalog for select
  to authenticated using (true);
```

### Workout plans

```sql
create table public.workout_plans (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  active boolean not null default false,
  created_at timestamptz not null default now()
);
-- enforce 1 active per workspace
create unique index workout_plans_one_active
  on public.workout_plans (workspace_id) where active;

create table public.workout_plan_days (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.workout_plans(id) on delete cascade,
  day_index int not null check (day_index between 0 and 6),
  name text not null,
  cardio_minutes int default 0,
  unique (plan_id, day_index)
);

create table public.workout_plan_exercises (
  id uuid primary key default gen_random_uuid(),
  day_id uuid not null references public.workout_plan_days(id) on delete cascade,
  exercise_id uuid not null references public.exercises_catalog(id),
  ord int not null,
  sets int not null,
  reps_target text not null,           -- "8-10" ou "12"
  rest_seconds int not null
);

create table public.exercise_variations (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  base_exercise_id uuid not null references public.exercises_catalog(id),
  name text not null,
  notes text
);

-- RLS: padrão para 4 tabelas acima
-- workout_plans, _days e _exercises herdam workspace via plan
alter table public.workout_plans enable row level security;
create policy "ws read" on public.workout_plans for select
  using (is_workspace_member(workspace_id));
create policy "coach/athlete write" on public.workout_plans for all
  using (is_workspace_member(workspace_id));

alter table public.workout_plan_days enable row level security;
create policy "ws via plan" on public.workout_plan_days for all
  using (plan_id in (
    select id from public.workout_plans where is_workspace_member(workspace_id)
  ));

alter table public.workout_plan_exercises enable row level security;
create policy "ws via day" on public.workout_plan_exercises for all
  using (day_id in (
    select id from public.workout_plan_days where plan_id in (
      select id from public.workout_plans where is_workspace_member(workspace_id)
    )
  ));

alter table public.exercise_variations enable row level security;
create policy "ws members" on public.exercise_variations for all
  using (is_workspace_member(workspace_id));
```

### Meal plans (mesmo padrão)

```sql
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

create table public.meal_plan_meals (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.meal_plans(id) on delete cascade,
  ord int not null,
  name text not null
);

create table public.meal_plan_items (
  id uuid primary key default gen_random_uuid(),
  meal_id uuid not null references public.meal_plan_meals(id) on delete cascade,
  food_id uuid references public.foods_catalog(id),
  description text not null,           -- fallback texto livre
  quantity numeric(8,2),
  unit text
);

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

-- RLS análogo ao workout (omitido por brevidade — ver migration completa)
```

### Execução

```sql
create table public.workout_sessions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  plan_day_id uuid references public.workout_plan_days(id) on delete set null,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  plan_snapshot jsonb not null,         -- CDD-06
  created_at timestamptz not null default now()
);
create index on public.workout_sessions (workspace_id, started_at desc);

create table public.set_logs (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null unique,        -- idempotency (R-03)
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

create table public.meal_logs (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null unique,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  plan_meal_id uuid references public.meal_plan_meals(id),
  variation_id uuid references public.food_variations(id),
  consumed_at timestamptz not null default now(),
  note text
);
create index on public.meal_logs (workspace_id, consumed_at desc);

alter table public.workout_sessions enable row level security;
alter table public.set_logs enable row level security;
alter table public.meal_logs enable row level security;

create policy "ws members read sessions" on public.workout_sessions for select
  using (is_workspace_member(workspace_id));
create policy "athlete writes sessions" on public.workout_sessions for insert
  with check (workspace_id in (
    select id from public.workspaces where athlete_user_id = auth.uid()
  ));

create policy "ws members read sets" on public.set_logs for select
  using (session_id in (
    select id from public.workout_sessions where is_workspace_member(workspace_id)
  ));
create policy "athlete writes sets" on public.set_logs for insert
  with check (session_id in (
    select id from public.workout_sessions
    where workspace_id in (
      select id from public.workspaces where athlete_user_id = auth.uid()
    )
  ));

create policy "meal_logs ws members read" on public.meal_logs for select
  using (is_workspace_member(workspace_id));
create policy "athlete writes meal_logs" on public.meal_logs for insert
  with check (workspace_id in (
    select id from public.workspaces where athlete_user_id = auth.uid()
  ));
```

### Progress photos

```sql
create table public.progress_photos (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  angle text not null check (angle in ('front','back','side')),
  storage_path text not null,
  taken_on date not null,
  weight_kg numeric(5,2)
);
create index on public.progress_photos (workspace_id, taken_on desc);
alter table public.progress_photos enable row level security;
create policy "ws members read photos" on public.progress_photos for select
  using (is_workspace_member(workspace_id));
create policy "athlete writes photos" on public.progress_photos for insert
  with check (workspace_id in (
    select id from public.workspaces where athlete_user_id = auth.uid()
  ));
create policy "athlete deletes photos" on public.progress_photos for delete
  using (workspace_id in (
    select id from public.workspaces where athlete_user_id = auth.uid()
  ));
```

### Storage bucket

```
bucket: progress-photos (private)
path:   {workspace_id}/{yyyy-mm-dd}_{angle}_{uuid}.jpg

policy:
  select: is_workspace_member(workspace_id from path)
  insert: path begins with workspace_id of athlete=auth.uid()
  delete: same as insert
```

---

## pgtap RLS tests (RISK-02 mitigation)

```sql
-- supabase/tests/rls.test.sql
begin;
select plan(8);

-- setup: 2 atletas, 2 coaches, 2 workspaces
-- ...

-- T1: atleta A não lê workspace de atleta B
set local role authenticated;
set local request.jwt.claims = '{"sub":"<athlete_a_uuid>"}';
select is_empty(
  $$ select * from public.workspaces where athlete_user_id = '<athlete_b_uuid>' $$,
  'atleta A nao ve workspace de B'
);

-- T2: coach so escreve no workspace que coach_user_id aponta
-- T3..T8 cobrem set_logs, meal_logs, photos, plans cruzados

select * from finish();
rollback;
```

CI executa `supabase test db` em cada PR.

---

## Seed (do PDF)

`supabase/seed.sql` popula:

1. `exercises_catalog` — todos os exercícios mencionados nas 5 sessões.
2. `foods_catalog` — alimentos das 6 refeições.
3. Após primeiro signup do atleta:
   - `workspaces` é criada.
   - `athlete_data` recebe 22/80kg/175cm/avancado/Hipertrofia+PerdaGordura/5.
   - `meal_plans` ativo com 1800 kcal, P=160, C=215, G=67.
   - 6 `meal_plan_meals` + items por refeição.
   - `workout_plans` ativo "Modo Caverna 5x".
   - 5 `workout_plan_days` com seus exercícios.

(Seed chamado por edge function ou trigger `on_auth_user_created` opcional — MVP usa client-side bootstrap quando perfil é criado.)

---

## Migrations file plan

```
supabase/migrations/
  20260426000001_init_profiles.sql
  20260426000002_workspaces_and_helper.sql
  20260426000003_athlete_data_weight_logs.sql
  20260426000004_catalogs.sql
  20260426000005_workout_plans.sql
  20260426000006_meal_plans.sql
  20260426000007_execution.sql
  20260426000008_progress_photos.sql
  20260426000009_storage_bucket.sql
  20260426000010_seed_catalogs.sql
supabase/tests/
  rls_workspaces.test.sql
  rls_set_logs.test.sql
  rls_meal_logs.test.sql
  rls_photos.test.sql
```

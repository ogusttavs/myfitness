-- ─────────────────────────────────────────────────────────────────────
-- Modo Caverna — schema inicial
-- Refs: docs/db/SCHEMA.md
-- ─────────────────────────────────────────────────────────────────────

-- 1) Profiles (1:1 com auth.users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role text not null check (role in ('athlete','coach')) default 'athlete',
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

create policy "self read profile" on public.profiles
  for select using (id = auth.uid());

create policy "self insert profile" on public.profiles
  for insert with check (id = auth.uid());

create policy "self update profile" on public.profiles
  for update using (id = auth.uid());

-- 2) Workspaces (1 por atleta + opcional 1 coach)
create table public.workspaces (
  id uuid primary key default gen_random_uuid(),
  athlete_user_id uuid not null references public.profiles(id) on delete cascade,
  coach_user_id uuid references public.profiles(id) on delete set null,
  invite_code text unique,
  invite_expires_at timestamptz,
  created_at timestamptz not null default now(),
  unique (athlete_user_id)
);
alter table public.workspaces enable row level security;

-- Helper: testa se uid é membro de um workspace
create or replace function public.is_workspace_member(ws uuid)
returns boolean
language sql security definer stable as $$
  select exists (
    select 1 from public.workspaces w
    where w.id = ws
      and (w.athlete_user_id = auth.uid() or w.coach_user_id = auth.uid())
  );
$$;

create policy "members read workspace" on public.workspaces
  for select using (athlete_user_id = auth.uid() or coach_user_id = auth.uid());

create policy "athlete creates workspace" on public.workspaces
  for insert with check (athlete_user_id = auth.uid());

create policy "athlete updates workspace" on public.workspaces
  for update using (athlete_user_id = auth.uid());

-- 3) Athlete data (1:1 com workspace)
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

-- 4) Weight logs
create table public.weight_logs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  weight_kg numeric(5,2) not null,
  logged_at timestamptz not null default now()
);
create index on public.weight_logs (workspace_id, logged_at desc);
alter table public.weight_logs enable row level security;

create policy "ws members read weights" on public.weight_logs
  for select using (is_workspace_member(workspace_id));
create policy "athlete writes weights" on public.weight_logs
  for insert with check (
    workspace_id in (select id from public.workspaces where athlete_user_id = auth.uid())
  );

-- 5) Catálogos globais
create table public.exercises_catalog (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  muscle_group text not null,
  equipment text,
  default_unit text not null default 'kg'
);
alter table public.exercises_catalog enable row level security;
create policy "all read exercises" on public.exercises_catalog
  for select to authenticated using (true);

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
create policy "all read foods" on public.foods_catalog
  for select to authenticated using (true);
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
-- ─────────────────────────────────────────────────────────────────────
-- Wellness — água + suplementação
-- ─────────────────────────────────────────────────────────────────────

-- Catálogo (read-only) de suplementos do protocolo
create table public.supplements_catalog (
  id text primary key,
  name text not null,
  dose text not null,
  notes text,
  schedule_kind text not null check (schedule_kind in ('daily','weekly')),
  schedule_period text check (schedule_period in ('morning','afternoon','evening','night','any')),
  schedule_weekday int check (schedule_weekday between 0 and 6)
);
alter table public.supplements_catalog enable row level security;
create policy "all read supplements" on public.supplements_catalog
  for select to authenticated using (true);

-- Log diário de água (1 entry por workspace/dia)
create table public.water_logs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  date date not null,
  ml int not null default 0,
  updated_at timestamptz not null default now(),
  unique (workspace_id, date)
);
alter table public.water_logs enable row level security;
create policy "ws members read water" on public.water_logs
  for select using (is_workspace_member(workspace_id));
create policy "athlete writes water" on public.water_logs
  for all using (
    workspace_id in (select id from public.workspaces where athlete_user_id = auth.uid())
  );

-- Log de suplementos tomados (por workspace/dia/supplement)
create table public.supplement_logs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  supplement_id text not null references public.supplements_catalog(id),
  date date not null,
  taken_at timestamptz not null default now(),
  unique (workspace_id, supplement_id, date)
);
alter table public.supplement_logs enable row level security;
create policy "ws members read supp_logs" on public.supplement_logs
  for select using (is_workspace_member(workspace_id));
create policy "athlete writes supp_logs" on public.supplement_logs
  for all using (
    workspace_id in (select id from public.workspaces where athlete_user_id = auth.uid())
  );
-- ─────────────────────────────────────────────────────────────────────
-- Trigger de onboarding: ao criar usuário, cria profile + workspace
-- (perfil, plano de dieta e plano de treino são populados pelo seed
-- e linkados via app na primeira visita)
-- ─────────────────────────────────────────────────────────────────────

create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'athlete')
  )
  on conflict (id) do nothing;

  -- Cria workspace só se for atleta (coach é convidado, não cria workspace)
  if coalesce(new.raw_user_meta_data->>'role', 'athlete') = 'athlete' then
    insert into public.workspaces (athlete_user_id)
    values (new.id)
    on conflict (athlete_user_id) do nothing;
  end if;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
-- ─────────────────────────────────────────────────────────────────────
-- Seed canônico — protocoloGustavo_modo_caverna.pdf
-- Catálogos globais (read-only por usuários autenticados)
-- ─────────────────────────────────────────────────────────────────────

-- ── Exercícios (todos os 5 dias) ────────────────────────

insert into public.exercises_catalog (name, muscle_group, equipment) values
  -- Push
  ('Supino reto com barra', 'peito', 'barra'),
  ('Supino inclinado com haltere', 'peito', 'haltere'),
  ('Desenvolvimento com halteres', 'ombro', 'haltere'),
  ('Elevação lateral', 'ombro', 'haltere'),
  ('Tríceps corda (polia)', 'triceps', 'polia'),
  ('Tríceps testa', 'triceps', 'barra'),
  -- Pull
  ('Barra fixa (pegada pronada)', 'costas', 'barra fixa'),
  ('Remada curvada com barra', 'costas', 'barra'),
  ('Puxada frente (polia alta)', 'costas', 'polia'),
  ('Remada unilateral com haltere', 'costas', 'haltere'),
  ('Rosca direta com barra', 'biceps', 'barra'),
  ('Rosca martelo', 'biceps', 'haltere'),
  -- Legs
  ('Agachamento livre', 'pernas', 'barra'),
  ('Leg press 45 graus', 'pernas', 'maquina'),
  ('Cadeira extensora', 'quadriceps', 'maquina'),
  ('Mesa flexora', 'posterior', 'maquina'),
  ('Stiff com barra', 'posterior', 'barra'),
  ('Panturrilha em pé', 'panturrilha', 'maquina'),
  -- Upper extras
  ('Supino inclinado com barra', 'peito', 'barra'),
  ('Remada baixa (polia)', 'costas', 'polia'),
  ('Desenvolvimento militar', 'ombro', 'barra'),
  ('Crucifixo com haltere', 'peito', 'haltere'),
  ('Rosca direta', 'biceps', 'barra'),
  ('Tríceps francês', 'triceps', 'haltere'),
  -- Lower extras
  ('Agachamento sumo', 'pernas', 'barra'),
  ('Avanço com halteres', 'pernas', 'haltere'),
  ('Stiff unilateral', 'posterior', 'haltere'),
  ('Elevação de quadril', 'gluteo', 'peso corporal'),
  ('Prancha', 'core', 'peso corporal'),
  ('Abdominal infra', 'core', 'peso corporal')
on conflict (name) do nothing;

-- ── Alimentos (todos das 6 refeições) ───────────────────

insert into public.foods_catalog (name, default_unit, kcal_per_unit, protein_g, carb_g, fat_g) values
  -- Café da manhã
  ('Ovo mexido', 'unidade', 72, 6, 0.5, 5),
  ('Pão integral', 'fatia', 80, 4, 14, 1.5),
  ('Banana', 'unidade', 90, 1, 23, 0),
  ('Maçã', 'unidade', 80, 0, 21, 0),
  ('Café sem açúcar', 'xicara', 5, 0, 0, 0),
  -- Lanche
  ('Iogurte grego natural', 'g', 1, 0.1, 0.04, 0.05),
  ('Aveia em flocos', 'g', 3.8, 0.16, 0.66, 0.07),
  -- Almoço/Jantar
  ('Frango grelhado', 'g', 1.6, 0.31, 0, 0.04),
  ('Carne magra (patinho/coxão mole)', 'g', 1.6, 0.27, 0, 0.05),
  ('Peixe (tilápia/merluza)', 'g', 1.0, 0.20, 0, 0.02),
  ('Atum em água', 'g', 1.2, 0.27, 0, 0.01),
  ('Arroz branco cozido', 'g', 1.3, 0.027, 0.28, 0.003),
  ('Arroz integral cozido', 'g', 1.1, 0.025, 0.23, 0.009),
  ('Feijão cozido', 'g', 0.95, 0.06, 0.17, 0.005),
  ('Salada folhas/tomate/pepino', 'g', 0.15, 0.005, 0.025, 0),
  ('Legumes refogados', 'g', 0.4, 0.015, 0.07, 0.005),
  -- Pré/Pós-treino
  ('Batata-doce cozida', 'g', 0.86, 0.016, 0.20, 0.001),
  ('Whey protein', 'g', 4.0, 0.80, 0.08, 0.03)
on conflict (name) do nothing;

-- ── Suplementos do protocolo ────────────────────────────

insert into public.supplements_catalog (id, name, dose, notes, schedule_kind, schedule_period, schedule_weekday) values
  ('creatina',   'Creatina',   '3-5g',                'Pode ser tomada com qualquer refeição', 'daily', 'any',     null),
  ('vitamina-d', 'Vitamina D', '1 cápsula',           null,                                     'daily', 'morning', null),
  ('biotina',    'Biotina',    '1 cápsula',           null,                                     'daily', 'morning', null),
  ('minoxidil',  'Minoxidil',  'Aplicar conforme orientação', 'Antes de dormir',                'daily', 'night',   null),
  ('durateston', 'Durateston', 'Conforme protocolo',  'Toda quarta-feira',                      'weekly','any',     3)
on conflict (id) do nothing;

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

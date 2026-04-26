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

-- ─────────────────────────────────────────────────────────────────────
-- Multi-coach (1 coach pode ver vários atletas) + progress photos
-- ─────────────────────────────────────────────────────────────────────

-- 1) Tabela de relacionamento N:N coach <-> workspace
create table public.coach_workspaces (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  coach_user_id uuid not null references public.profiles(id) on delete cascade,
  invited_at timestamptz not null default now(),
  primary key (workspace_id, coach_user_id)
);
alter table public.coach_workspaces enable row level security;

create index on public.coach_workspaces (coach_user_id);

create policy "ws members read coach links" on public.coach_workspaces
  for select using (
    coach_user_id = auth.uid()
    or workspace_id in (select id from public.workspaces where athlete_user_id = auth.uid())
  );

create policy "athlete invites coach" on public.coach_workspaces
  for insert with check (
    workspace_id in (select id from public.workspaces where athlete_user_id = auth.uid())
  );

create policy "athlete revokes coach" on public.coach_workspaces
  for delete using (
    workspace_id in (select id from public.workspaces where athlete_user_id = auth.uid())
    or coach_user_id = auth.uid()
  );

-- 2) Migra dados antigos da coluna coach_user_id para a nova tabela
insert into public.coach_workspaces (workspace_id, coach_user_id)
  select id, coach_user_id
  from public.workspaces
  where coach_user_id is not null
on conflict do nothing;

-- 3) Atualiza helper is_workspace_member para usar a nova tabela
create or replace function public.is_workspace_member(ws uuid)
returns boolean
language sql security definer stable as $$
  select exists (
    select 1 from public.workspaces w
    where w.id = ws
      and (
        w.athlete_user_id = auth.uid()
        or exists (
          select 1 from public.coach_workspaces cw
          where cw.workspace_id = w.id and cw.coach_user_id = auth.uid()
        )
      )
  );
$$;

-- 4) Atualiza policies do workspaces (membros leem)
drop policy if exists "members read workspace" on public.workspaces;
create policy "members read workspace" on public.workspaces
  for select using (
    athlete_user_id = auth.uid()
    or exists (
      select 1 from public.coach_workspaces cw
      where cw.workspace_id = workspaces.id and cw.coach_user_id = auth.uid()
    )
  );

-- 5) Progress photos
create table public.progress_photos (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  angle text not null check (angle in ('front','side','back')),
  storage_path text not null,
  taken_on date not null,
  weight_kg numeric(5,2),
  note text,
  created_at timestamptz not null default now()
);
create index on public.progress_photos (workspace_id, taken_on desc);
alter table public.progress_photos enable row level security;

create policy "ws members read photos" on public.progress_photos
  for select using (is_workspace_member(workspace_id));
create policy "athlete writes photos" on public.progress_photos
  for insert with check (
    workspace_id in (select id from public.workspaces where athlete_user_id = auth.uid())
  );
create policy "athlete updates own photos" on public.progress_photos
  for update using (
    workspace_id in (select id from public.workspaces where athlete_user_id = auth.uid())
  );
create policy "athlete deletes own photos" on public.progress_photos
  for delete using (
    workspace_id in (select id from public.workspaces where athlete_user_id = auth.uid())
  );

-- 6) Storage bucket para fotos (privado)
insert into storage.buckets (id, name, public)
values ('progress-photos', 'progress-photos', false)
on conflict (id) do nothing;

-- 6.1) RLS no bucket
create policy "ws members read storage photos" on storage.objects
  for select using (
    bucket_id = 'progress-photos'
    and (storage.foldername(name))[1]::uuid in (
      select id::text::uuid from public.workspaces
      where is_workspace_member(id)
    )
  );

create policy "athlete writes storage photos" on storage.objects
  for insert with check (
    bucket_id = 'progress-photos'
    and (storage.foldername(name))[1]::uuid in (
      select id from public.workspaces where athlete_user_id = auth.uid()
    )
  );

create policy "athlete deletes own storage photos" on storage.objects
  for delete using (
    bucket_id = 'progress-photos'
    and (storage.foldername(name))[1]::uuid in (
      select id from public.workspaces where athlete_user_id = auth.uid()
    )
  );

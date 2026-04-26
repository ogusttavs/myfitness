-- ─────────────────────────────────────────────────────────────────────
-- FIX: Recursão infinita entre policies de workspaces e coach_workspaces
-- Quebra o ciclo usando funções SECURITY DEFINER que bypassam RLS.
-- ─────────────────────────────────────────────────────────────────────

-- Helper 1: testa se uid é atleta dono do workspace
create or replace function public.is_workspace_athlete(ws uuid)
returns boolean
language sql security definer stable as $$
  select exists (
    select 1 from public.workspaces w
    where w.id = ws and w.athlete_user_id = auth.uid()
  );
$$;

-- Helper 2: testa se uid é coach vinculado ao workspace
create or replace function public.is_workspace_coach(ws uuid)
returns boolean
language sql security definer stable as $$
  select exists (
    select 1 from public.coach_workspaces cw
    where cw.workspace_id = ws and cw.coach_user_id = auth.uid()
  );
$$;

-- Atualiza is_workspace_member usando os helpers
create or replace function public.is_workspace_member(ws uuid)
returns boolean
language sql security definer stable as $$
  select public.is_workspace_athlete(ws) or public.is_workspace_coach(ws);
$$;

-- Drop policies antigas que causam recursão
drop policy if exists "members read workspace" on public.workspaces;
drop policy if exists "ws members read coach links" on public.coach_workspaces;
drop policy if exists "athlete invites coach" on public.coach_workspaces;
drop policy if exists "athlete revokes coach" on public.coach_workspaces;

-- Recria policies usando funções SECURITY DEFINER (sem recursão)
create policy "members read workspace" on public.workspaces
  for select using (
    athlete_user_id = auth.uid()
    or public.is_workspace_coach(id)
  );

create policy "ws members read coach links" on public.coach_workspaces
  for select using (
    coach_user_id = auth.uid()
    or public.is_workspace_athlete(workspace_id)
  );

create policy "athlete invites coach" on public.coach_workspaces
  for insert with check (
    public.is_workspace_athlete(workspace_id)
  );

create policy "athlete revokes coach" on public.coach_workspaces
  for delete using (
    public.is_workspace_athlete(workspace_id)
    or coach_user_id = auth.uid()
  );

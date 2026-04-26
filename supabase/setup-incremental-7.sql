-- ─────────────────────────────────────────────────────────────────────
-- SQL único e auto-contido: cria tabela pending_coach_links + helpers
-- + promove gustavs.silvs como coach temporário do Gustavo.
-- Roda mesmo se setup-5 não foi aplicado.
-- ─────────────────────────────────────────────────────────────────────

-- 1) Tabela pending_coach_links (se não existe)
create table if not exists public.pending_coach_links (
  athlete_email text not null,
  coach_email text not null,
  coach_name text,
  created_at timestamptz not null default now(),
  primary key (athlete_email, coach_email)
);
alter table public.pending_coach_links enable row level security;

-- policy de select (permite ler — não tem dado sensível)
do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'pending_coach_links' and policyname = 'anyone read pending links') then
    create policy "anyone read pending links" on public.pending_coach_links
      for select to authenticated using (true);
  end if;
end $$;

-- 2) Função link_coach_by_emails (link manual)
create or replace function public.link_coach_by_emails(coach_email text, athlete_email text)
returns text
language plpgsql security definer set search_path = public
as $$
declare
  c_id uuid;
  a_id uuid;
  ws uuid;
begin
  select id into c_id from auth.users where email = coach_email limit 1;
  select id into a_id from auth.users where email = athlete_email limit 1;
  if c_id is null then return 'coach_not_found'; end if;
  if a_id is null then return 'athlete_not_found'; end if;

  select id into ws from public.workspaces where athlete_user_id = a_id;
  if ws is null then return 'workspace_not_found'; end if;

  update public.profiles
  set role = 'coach',
      full_name = case when full_name = '' then split_part(coach_email,'@',1) else full_name end
  where id = c_id;

  insert into public.coach_workspaces (workspace_id, coach_user_id)
  values (ws, c_id)
  on conflict do nothing;

  return 'linked';
end;
$$;

-- 3) Trigger atualizado: backfill Gustavo + processa pending_links
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
declare
  ws_id uuid;
  is_gustavo boolean;
  pending_athlete_id uuid;
  pending_ws uuid;
  pending record;
begin
  is_gustavo := new.email = 'gustavosilva585@gmail.com';

  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    case when is_gustavo then 'Gustavo Silva' else '' end,
    coalesce(new.raw_user_meta_data->>'role', 'athlete')
  )
  on conflict (id) do nothing;

  if coalesce(new.raw_user_meta_data->>'role', 'athlete') = 'athlete' then
    insert into public.workspaces (athlete_user_id)
    values (new.id)
    on conflict (athlete_user_id) do nothing;

    if is_gustavo then
      select id into ws_id from public.workspaces where athlete_user_id = new.id;
      if ws_id is not null then
        insert into public.athlete_data (workspace_id, age, height_cm, weight_kg, level, goal, weekly_frequency)
        values (ws_id, 22, 175, 80.0, 'avancado', 'Hipertrofia + Perda de Gordura', 5)
        on conflict (workspace_id) do nothing;
      end if;
    end if;
  end if;

  -- pending_links: este usuário é coach esperado?
  for pending in select * from public.pending_coach_links where coach_email = new.email loop
    update public.profiles
    set role = 'coach',
        full_name = case when full_name = '' then coalesce(pending.coach_name, split_part(new.email,'@',1)) else full_name end
    where id = new.id;

    select id into pending_athlete_id from auth.users where email = pending.athlete_email limit 1;
    if pending_athlete_id is not null then
      select id into pending_ws from public.workspaces where athlete_user_id = pending_athlete_id;
      if pending_ws is not null then
        insert into public.coach_workspaces (workspace_id, coach_user_id)
        values (pending_ws, new.id) on conflict do nothing;
        delete from public.pending_coach_links
        where athlete_email = pending.athlete_email and coach_email = new.email;
      end if;
    end if;
  end loop;

  -- pending_links: este usuário é atleta com coach esperado?
  for pending in select * from public.pending_coach_links where athlete_email = new.email loop
    select id into pending_athlete_id from auth.users where email = pending.coach_email limit 1;
    if pending_athlete_id is not null then
      select id into pending_ws from public.workspaces where athlete_user_id = new.id;
      if pending_ws is not null then
        insert into public.coach_workspaces (workspace_id, coach_user_id)
        values (pending_ws, pending_athlete_id) on conflict do nothing;
        delete from public.pending_coach_links
        where athlete_email = new.email and coach_email = pending.coach_email;
      end if;
    end if;
  end loop;

  return new;
end;
$$;

-- 4) Insere pending_link: gustavs.silvs será coach do Gustavo
insert into public.pending_coach_links (athlete_email, coach_email, coach_name)
values ('gustavosilva585@gmail.com', 'gustavs.silvs@gmail.com', 'Vitor Flavio (TESTE)')
on conflict (athlete_email, coach_email) do update set coach_name = excluded.coach_name;

-- 5) Se gustavs.silvs já existe, promove imediatamente
do $$
declare
  c_id uuid;
  a_id uuid;
  ws  uuid;
begin
  select id into c_id from auth.users where email = 'gustavs.silvs@gmail.com' limit 1;
  select id into a_id from auth.users where email = 'gustavosilva585@gmail.com' limit 1;

  if c_id is null then
    raise notice '✓ Coach temp ainda nao logou. Vai ser promovido ao logar pela primeira vez.';
    return;
  end if;

  update public.profiles
  set role = 'coach', full_name = 'Vitor Flavio (TESTE)'
  where id = c_id;

  delete from public.workspaces where athlete_user_id = c_id;

  if a_id is not null then
    select id into ws from public.workspaces where athlete_user_id = a_id;
    if ws is not null then
      insert into public.coach_workspaces (workspace_id, coach_user_id)
      values (ws, c_id) on conflict do nothing;

      delete from public.pending_coach_links
      where coach_email = 'gustavs.silvs@gmail.com';

      raise notice '✓ gustavs.silvs vinculado como coach do Gustavo. Pode logar.';
    end if;
  end if;
end $$;

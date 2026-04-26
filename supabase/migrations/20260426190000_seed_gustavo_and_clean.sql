-- ─────────────────────────────────────────────────────────────────────
-- 1) Limpa perfis de teste (mantém só Gustavo) e atualiza trigger
--    pra só semear dados de Gustavo se for o email dele.
-- ─────────────────────────────────────────────────────────────────────

-- Limpa athlete_data de TODOS os usuários (todos vão preencher via onboarding)
-- Mas mantém workspace + profiles intactos.
truncate table public.athlete_data restart identity;

-- Atualiza nome de profiles pra null/email pra forçar usuário definir no onboarding
update public.profiles
set full_name = ''
where id in (select id from auth.users where email != 'gustavosilva585@gmail.com');

-- ── Backfill do Gustavo ─────────────────────────────────────────

-- Se Gustavo já existe, atualiza o nome e popula athlete_data
do $$
declare
  gustavo_id uuid;
  gustavo_ws uuid;
begin
  select id into gustavo_id from auth.users where email = 'gustavosilva585@gmail.com' limit 1;
  if gustavo_id is null then
    -- Gustavo ainda não logou; trigger vai cuidar dele quando chegar
    return;
  end if;

  -- Garante profile com nome certo
  update public.profiles
  set full_name = 'Gustavo Silva'
  where id = gustavo_id;

  -- Garante workspace
  insert into public.workspaces (athlete_user_id)
  values (gustavo_id)
  on conflict (athlete_user_id) do nothing;

  select id into gustavo_ws from public.workspaces where athlete_user_id = gustavo_id;

  -- Popula athlete_data com valores do PDF
  insert into public.athlete_data (workspace_id, age, height_cm, weight_kg, level, goal, weekly_frequency)
  values (gustavo_ws, 22, 175, 80.0, 'avancado', 'Hipertrofia + Perda de Gordura', 5)
  on conflict (workspace_id) do update set
    age = excluded.age,
    height_cm = excluded.height_cm,
    weight_kg = excluded.weight_kg,
    level = excluded.level,
    goal = excluded.goal,
    weekly_frequency = excluded.weekly_frequency;
end $$;

-- ── Atualiza trigger: se for Gustavo, backfill; outros começam vazios ──

create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
declare
  ws_id uuid;
  is_gustavo boolean;
begin
  is_gustavo := new.email = 'gustavosilva585@gmail.com';

  -- profile (nome vazio pra forçar onboarding, exceto Gustavo)
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    case when is_gustavo then 'Gustavo Silva' else '' end,
    coalesce(new.raw_user_meta_data->>'role', 'athlete')
  )
  on conflict (id) do nothing;

  -- workspace só pra atleta
  if coalesce(new.raw_user_meta_data->>'role', 'athlete') = 'athlete' then
    insert into public.workspaces (athlete_user_id)
    values (new.id)
    on conflict (athlete_user_id) do nothing;

    -- Se Gustavo, backfill athlete_data com valores do PDF
    if is_gustavo then
      select id into ws_id from public.workspaces where athlete_user_id = new.id;
      if ws_id is not null then
        insert into public.athlete_data (workspace_id, age, height_cm, weight_kg, level, goal, weekly_frequency)
        values (ws_id, 22, 175, 80.0, 'avancado', 'Hipertrofia + Perda de Gordura', 5)
        on conflict (workspace_id) do nothing;
      end if;
    end if;
  end if;

  return new;
end;
$$;

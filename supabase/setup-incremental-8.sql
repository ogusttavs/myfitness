-- ─────────────────────────────────────────────────────────────────────
-- Troca email do coach temp pra +coach (truque do Gmail, sem rate limit)
-- ─────────────────────────────────────────────────────────────────────

-- 1) Limpa qualquer pending_link antigo desse atleta
delete from public.pending_coach_links
where athlete_email = 'gustavosilva585@gmail.com';

-- 2) Insere novo pending_link com o email +coach
insert into public.pending_coach_links (athlete_email, coach_email, coach_name)
values ('gustavosilva585@gmail.com', 'gustavs.silvs+coach@gmail.com', 'Vitor Flavio (TESTE)');

-- 3) Se gustavs.silvs (sem +coach) já estava promovido/vinculado, desfaz
do $$
declare
  old_id uuid;
  a_id uuid;
  ws uuid;
begin
  select id into old_id from auth.users where email = 'gustavs.silvs@gmail.com' limit 1;
  if old_id is not null then
    select id into a_id from auth.users where email = 'gustavosilva585@gmail.com' limit 1;
    if a_id is not null then
      select id into ws from public.workspaces where athlete_user_id = a_id;
      if ws is not null then
        delete from public.coach_workspaces
        where workspace_id = ws and coach_user_id = old_id;
      end if;
    end if;
    -- Volta a ser atleta normal (libera pra usar como atleta de teste depois)
    update public.profiles
    set role = 'athlete', full_name = ''
    where id = old_id;
  end if;
end $$;

-- 4) Se gustavs.silvs+coach já existe, promove agora
do $$
declare
  c_id uuid;
  a_id uuid;
  ws uuid;
begin
  select id into c_id from auth.users where email = 'gustavs.silvs+coach@gmail.com' limit 1;
  select id into a_id from auth.users where email = 'gustavosilva585@gmail.com' limit 1;

  if c_id is null then
    raise notice '✓ +coach ainda nao logou. Sera promovido ao logar pela 1a vez.';
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
      where coach_email = 'gustavs.silvs+coach@gmail.com';

      raise notice '✓ +coach vinculado. Pode logar.';
    end if;
  end if;
end $$;

-- ─────────────────────────────────────────────────────────────────────
-- Promove gustavs.silvs@gmail.com a coach temporário do Gustavo
-- (será substituído pelo email real do Vitor Flavio depois)
-- ─────────────────────────────────────────────────────────────────────

-- 1) Atualiza pending_coach_link com o email temporário
update public.pending_coach_links
set coach_email = 'gustavs.silvs@gmail.com',
    coach_name  = 'Vitor Flavio (TESTE)'
where coach_name like 'Vitor Flavio%';

-- 2) Se o usuário já existe (logou antes como atleta), promove ele agora
do $$
declare
  c_id uuid;
  a_id uuid;
  ws  uuid;
begin
  select id into c_id from auth.users where email = 'gustavs.silvs@gmail.com' limit 1;
  select id into a_id from auth.users where email = 'gustavosilva585@gmail.com' limit 1;

  if c_id is null then
    raise notice 'Coach temp ainda nao logou. Trigger vai cuidar quando logar pela primeira vez.';
    return;
  end if;

  -- vira coach
  update public.profiles
  set role = 'coach',
      full_name = 'Vitor Flavio (TESTE)'
  where id = c_id;

  -- coach nao precisa de workspace proprio — apaga (cascade limpa athlete_data, weight_logs etc)
  delete from public.workspaces where athlete_user_id = c_id;

  -- vincula como coach do Gustavo
  if a_id is not null then
    select id into ws from public.workspaces where athlete_user_id = a_id;
    if ws is not null then
      insert into public.coach_workspaces (workspace_id, coach_user_id)
      values (ws, c_id)
      on conflict do nothing;

      -- consome o pending link
      delete from public.pending_coach_links
      where coach_email = 'gustavs.silvs@gmail.com';

      raise notice 'Coach temporario vinculado ao workspace do Gustavo.';
    end if;
  end if;
end $$;

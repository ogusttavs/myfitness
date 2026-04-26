-- ─────────────────────────────────────────────────────────────────────
-- Troca email do coach temp pra ogusttavs@gmail.com
-- ─────────────────────────────────────────────────────────────────────

-- 1) Limpa pending_link antigo
delete from public.pending_coach_links
where athlete_email = 'gustavosilva585@gmail.com';

-- 2) Insere novo
insert into public.pending_coach_links (athlete_email, coach_email, coach_name)
values ('gustavosilva585@gmail.com', 'ogusttavs@gmail.com', 'Vitor Flavio (TESTE)');

-- 3) Se ogusttavs já existe (logou antes), promove imediatamente
do $$
declare
  c_id uuid;
  a_id uuid;
  ws uuid;
begin
  select id into c_id from auth.users where email = 'ogusttavs@gmail.com' limit 1;
  select id into a_id from auth.users where email = 'gustavosilva585@gmail.com' limit 1;

  if c_id is null then
    raise notice '✓ ogusttavs ainda nao logou. Sera promovido ao logar pela 1a vez.';
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
      delete from public.pending_coach_links where coach_email = 'ogusttavs@gmail.com';
      raise notice '✓ ogusttavs vinculado como coach do Gustavo. Pode logar.';
    end if;
  end if;
end $$;

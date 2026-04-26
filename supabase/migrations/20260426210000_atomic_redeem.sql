-- ─────────────────────────────────────────────────────────────────────
-- RPC atomico: redeem_invite_code
-- Faz lookup, valida expiração, cria coach_workspaces, atualiza profile,
-- limpa código — tudo em uma transação. Evita estado inconsistente.
-- ─────────────────────────────────────────────────────────────────────

create or replace function public.redeem_invite_code(code text)
returns text
language plpgsql security definer set search_path = public
as $$
declare
  ws record;
  uid uuid := auth.uid();
  email_local text;
begin
  if uid is null then
    return 'unauthenticated';
  end if;

  select id, invite_expires_at, athlete_user_id
    into ws
    from public.workspaces
    where invite_code = upper(code)
    limit 1;

  if not found then
    return 'invalid_code';
  end if;

  if ws.invite_expires_at is not null and ws.invite_expires_at < now() then
    return 'expired';
  end if;

  if ws.athlete_user_id = uid then
    return 'cannot_invite_self';
  end if;

  -- Cria vínculo coach
  insert into public.coach_workspaces (workspace_id, coach_user_id)
  values (ws.id, uid)
  on conflict do nothing;

  -- Promove a coach (mantém nome se já tem)
  select split_part(email, '@', 1) into email_local from auth.users where id = uid;
  update public.profiles
  set role = 'coach',
      full_name = case when full_name = '' or full_name is null then email_local else full_name end
  where id = uid;

  -- Apaga workspace de atleta dele se existia (coaches não têm workspace próprio)
  delete from public.workspaces where athlete_user_id = uid;

  -- Limpa código (one-time use)
  update public.workspaces
  set invite_code = null, invite_expires_at = null
  where id = ws.id;

  return 'ok';
end;
$$;

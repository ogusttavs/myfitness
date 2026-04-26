-- ─────────────────────────────────────────────────────────────────────
-- Trigger de onboarding: ao criar usuário, cria profile + workspace
-- (perfil, plano de dieta e plano de treino são populados pelo seed
-- e linkados via app na primeira visita)
-- ─────────────────────────────────────────────────────────────────────

create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'athlete')
  )
  on conflict (id) do nothing;

  -- Cria workspace só se for atleta (coach é convidado, não cria workspace)
  if coalesce(new.raw_user_meta_data->>'role', 'athlete') = 'athlete' then
    insert into public.workspaces (athlete_user_id)
    values (new.id)
    on conflict (athlete_user_id) do nothing;
  end if;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

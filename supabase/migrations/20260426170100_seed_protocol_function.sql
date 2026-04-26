-- ─────────────────────────────────────────────────────────────────────
-- Função pra popular o protocolo Modo Caverna num workspace.
-- Idempotente: se workspace já tem plano ativo, não duplica.
-- ─────────────────────────────────────────────────────────────────────

create or replace function public.seed_modo_caverna_protocol(ws uuid)
returns void
language plpgsql security definer
set search_path = public
as $$
declare
  workout_plan_id uuid;
  meal_plan_id uuid;
  day_id uuid;
  meal_id uuid;
begin
  -- só roda se quem chamou for membro do workspace
  if not is_workspace_member(ws) then
    raise exception 'not a workspace member';
  end if;

  -- ───── WORKOUT PLAN ─────
  -- Aborta se já existe um plano ativo
  if exists (select 1 from workout_plans where workspace_id = ws and active) then
    return;
  end if;

  insert into workout_plans (workspace_id, name, active)
  values (ws, 'Modo Caverna 5x', true)
  returning id into workout_plan_id;

  -- DIA 1 — PUSH
  insert into workout_plan_days (plan_id, day_index, name, cardio_minutes)
  values (workout_plan_id, 0, 'PUSH', 20)
  returning id into day_id;
  insert into workout_plan_exercises (day_id, exercise_id, ord, sets, reps_target, rest_seconds) values
    (day_id, (select id from exercises_catalog where name='Supino reto com barra'), 1, 4, '8-10', 90),
    (day_id, (select id from exercises_catalog where name='Supino inclinado com haltere'), 2, 3, '10-12', 75),
    (day_id, (select id from exercises_catalog where name='Desenvolvimento com halteres'), 3, 3, '10-12', 75),
    (day_id, (select id from exercises_catalog where name='Elevação lateral'), 4, 3, '12-15', 60),
    (day_id, (select id from exercises_catalog where name='Tríceps corda (polia)'), 5, 3, '12', 60),
    (day_id, (select id from exercises_catalog where name='Tríceps testa'), 6, 3, '10', 60);

  -- DIA 2 — PULL
  insert into workout_plan_days (plan_id, day_index, name, cardio_minutes)
  values (workout_plan_id, 1, 'PULL', 20)
  returning id into day_id;
  insert into workout_plan_exercises (day_id, exercise_id, ord, sets, reps_target, rest_seconds) values
    (day_id, (select id from exercises_catalog where name='Barra fixa (pegada pronada)'), 1, 4, '6-10', 90),
    (day_id, (select id from exercises_catalog where name='Remada curvada com barra'), 2, 4, '8-10', 90),
    (day_id, (select id from exercises_catalog where name='Puxada frente (polia alta)'), 3, 3, '10-12', 75),
    (day_id, (select id from exercises_catalog where name='Remada unilateral com haltere'), 4, 3, '10-12', 60),
    (day_id, (select id from exercises_catalog where name='Rosca direta com barra'), 5, 3, '10', 60),
    (day_id, (select id from exercises_catalog where name='Rosca martelo'), 6, 3, '12', 60);

  -- DIA 3 — LEGS
  insert into workout_plan_days (plan_id, day_index, name, cardio_minutes)
  values (workout_plan_id, 2, 'LEGS', 20)
  returning id into day_id;
  insert into workout_plan_exercises (day_id, exercise_id, ord, sets, reps_target, rest_seconds) values
    (day_id, (select id from exercises_catalog where name='Agachamento livre'), 1, 4, '8-10', 90),
    (day_id, (select id from exercises_catalog where name='Leg press 45 graus'), 2, 3, '10-12', 90),
    (day_id, (select id from exercises_catalog where name='Cadeira extensora'), 3, 3, '12-15', 60),
    (day_id, (select id from exercises_catalog where name='Mesa flexora'), 4, 3, '12-15', 60),
    (day_id, (select id from exercises_catalog where name='Stiff com barra'), 5, 3, '10-12', 75),
    (day_id, (select id from exercises_catalog where name='Panturrilha em pé'), 6, 3, '15-20', 60);

  -- DIA 4 — UPPER
  insert into workout_plan_days (plan_id, day_index, name, cardio_minutes)
  values (workout_plan_id, 3, 'UPPER', 20)
  returning id into day_id;
  insert into workout_plan_exercises (day_id, exercise_id, ord, sets, reps_target, rest_seconds) values
    (day_id, (select id from exercises_catalog where name='Supino inclinado com barra'), 1, 4, '8-10', 90),
    (day_id, (select id from exercises_catalog where name='Remada baixa (polia)'), 2, 3, '10-12', 75),
    (day_id, (select id from exercises_catalog where name='Desenvolvimento militar'), 3, 3, '10', 75),
    (day_id, (select id from exercises_catalog where name='Crucifixo com haltere'), 4, 3, '12', 60),
    (day_id, (select id from exercises_catalog where name='Elevação lateral'), 5, 2, '12-15', 60),
    (day_id, (select id from exercises_catalog where name='Rosca direta'), 6, 3, '10', 60),
    (day_id, (select id from exercises_catalog where name='Tríceps francês'), 7, 3, '10', 60);

  -- DIA 5 — LOWER
  insert into workout_plan_days (plan_id, day_index, name, cardio_minutes)
  values (workout_plan_id, 4, 'LOWER', 20)
  returning id into day_id;
  insert into workout_plan_exercises (day_id, exercise_id, ord, sets, reps_target, rest_seconds) values
    (day_id, (select id from exercises_catalog where name='Agachamento sumo'), 1, 4, '10-12', 90),
    (day_id, (select id from exercises_catalog where name='Avanço com halteres'), 2, 3, '12 cada', 75),
    (day_id, (select id from exercises_catalog where name='Cadeira extensora'), 3, 3, '15', 60),
    (day_id, (select id from exercises_catalog where name='Stiff unilateral'), 4, 3, '12', 60),
    (day_id, (select id from exercises_catalog where name='Elevação de quadril'), 5, 3, '15', 60),
    (day_id, (select id from exercises_catalog where name='Prancha'), 6, 3, '40-60s', 60),
    (day_id, (select id from exercises_catalog where name='Abdominal infra'), 7, 3, '15-20', 60);

  -- ───── MEAL PLAN ─────
  if exists (select 1 from meal_plans where workspace_id = ws and active) then
    return;
  end if;

  insert into meal_plans (workspace_id, name, active, kcal_target, protein_g, carb_g, fat_g)
  values (ws, '1.800 kcal — Recomp', true, 1800, 160, 215, 67)
  returning id into meal_plan_id;

  -- Refeição 1: Café da Manhã
  insert into meal_plan_meals (plan_id, ord, name, scheduled_time)
  values (meal_plan_id, 1, 'Café da Manhã', '07:00')
  returning id into meal_id;
  insert into meal_plan_items (meal_id, description, est_kcal, est_protein_g, est_carb_g, est_fat_g) values
    (meal_id, '3 ovos mexidos ou estrelados', 215, 18, 1, 15),
    (meal_id, '2 fatias de pão integral', 160, 8, 28, 3),
    (meal_id, '1 fruta (banana ou maçã)', 90, 1, 23, 0),
    (meal_id, 'Café sem açúcar', 5, 0, 0, 0);

  -- Refeição 2: Lanche
  insert into meal_plan_meals (plan_id, ord, name, scheduled_time)
  values (meal_plan_id, 2, 'Lanche', '10:00')
  returning id into meal_id;
  insert into meal_plan_items (meal_id, description, est_kcal, est_protein_g, est_carb_g, est_fat_g) values
    (meal_id, '170g de iogurte grego natural', 170, 17, 6, 8),
    (meal_id, '25g de aveia', 95, 4, 17, 2),
    (meal_id, '1 fruta pequena', 60, 1, 15, 0);

  -- Refeição 3: Almoço
  insert into meal_plan_meals (plan_id, ord, name, scheduled_time)
  values (meal_plan_id, 3, 'Almoço', '13:00')
  returning id into meal_id;
  insert into meal_plan_items (meal_id, description, est_kcal, est_protein_g, est_carb_g, est_fat_g) values
    (meal_id, '150g de frango grelhado ou carne magra', 240, 45, 0, 5),
    (meal_id, '3 colheres de arroz branco ou integral', 155, 3, 33, 0),
    (meal_id, '1 concha de feijão', 75, 5, 13, 0),
    (meal_id, 'Salada à vontade (folhas, tomate, pepino)', 30, 1, 5, 0);

  -- Refeição 4: Pré-Treino
  insert into meal_plan_meals (plan_id, ord, name, scheduled_time)
  values (meal_plan_id, 4, 'Pré-Treino', '16:00')
  returning id into meal_id;
  insert into meal_plan_items (meal_id, description, est_kcal, est_protein_g, est_carb_g, est_fat_g) values
    (meal_id, '1 batata-doce média (120g)', 105, 2, 24, 0),
    (meal_id, '80g de frango ou atum', 120, 22, 0, 3);

  -- Refeição 5: Pós-Treino
  insert into meal_plan_meals (plan_id, ord, name, scheduled_time)
  values (meal_plan_id, 5, 'Pós-Treino', '19:00')
  returning id into meal_id;
  insert into meal_plan_items (meal_id, description, est_kcal, est_protein_g, est_carb_g, est_fat_g) values
    (meal_id, '30g de whey com água ou leite desnatado', 120, 24, 2, 1),
    (meal_id, '1 banana pequena', 75, 1, 19, 0),
    (meal_id, 'Sem whey: substituir por 150g de frango ou 3 ovos', 0, 0, 0, 0);

  -- Refeição 6: Jantar
  insert into meal_plan_meals (plan_id, ord, name, scheduled_time)
  values (meal_plan_id, 6, 'Jantar', '22:00')
  returning id into meal_id;
  insert into meal_plan_items (meal_id, description, est_kcal, est_protein_g, est_carb_g, est_fat_g) values
    (meal_id, '150g de peixe, frango ou carne magra', 220, 38, 0, 6),
    (meal_id, '2 colheres de arroz ou batata-doce', 100, 2, 22, 0),
    (meal_id, 'Legumes refogados ou salada', 50, 2, 8, 1);
end;
$$;

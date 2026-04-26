-- ─────────────────────────────────────────────────────────────────────
-- Seed canônico — protocoloGustavo_modo_caverna.pdf
-- Catálogos globais (read-only por usuários autenticados)
-- ─────────────────────────────────────────────────────────────────────

-- ── Exercícios (todos os 5 dias) ────────────────────────

insert into public.exercises_catalog (name, muscle_group, equipment) values
  -- Push
  ('Supino reto com barra', 'peito', 'barra'),
  ('Supino inclinado com haltere', 'peito', 'haltere'),
  ('Desenvolvimento com halteres', 'ombro', 'haltere'),
  ('Elevação lateral', 'ombro', 'haltere'),
  ('Tríceps corda (polia)', 'triceps', 'polia'),
  ('Tríceps testa', 'triceps', 'barra'),
  -- Pull
  ('Barra fixa (pegada pronada)', 'costas', 'barra fixa'),
  ('Remada curvada com barra', 'costas', 'barra'),
  ('Puxada frente (polia alta)', 'costas', 'polia'),
  ('Remada unilateral com haltere', 'costas', 'haltere'),
  ('Rosca direta com barra', 'biceps', 'barra'),
  ('Rosca martelo', 'biceps', 'haltere'),
  -- Legs
  ('Agachamento livre', 'pernas', 'barra'),
  ('Leg press 45 graus', 'pernas', 'maquina'),
  ('Cadeira extensora', 'quadriceps', 'maquina'),
  ('Mesa flexora', 'posterior', 'maquina'),
  ('Stiff com barra', 'posterior', 'barra'),
  ('Panturrilha em pé', 'panturrilha', 'maquina'),
  -- Upper extras
  ('Supino inclinado com barra', 'peito', 'barra'),
  ('Remada baixa (polia)', 'costas', 'polia'),
  ('Desenvolvimento militar', 'ombro', 'barra'),
  ('Crucifixo com haltere', 'peito', 'haltere'),
  ('Rosca direta', 'biceps', 'barra'),
  ('Tríceps francês', 'triceps', 'haltere'),
  -- Lower extras
  ('Agachamento sumo', 'pernas', 'barra'),
  ('Avanço com halteres', 'pernas', 'haltere'),
  ('Stiff unilateral', 'posterior', 'haltere'),
  ('Elevação de quadril', 'gluteo', 'peso corporal'),
  ('Prancha', 'core', 'peso corporal'),
  ('Abdominal infra', 'core', 'peso corporal')
on conflict (name) do nothing;

-- ── Alimentos (todos das 6 refeições) ───────────────────

insert into public.foods_catalog (name, default_unit, kcal_per_unit, protein_g, carb_g, fat_g) values
  -- Café da manhã
  ('Ovo mexido', 'unidade', 72, 6, 0.5, 5),
  ('Pão integral', 'fatia', 80, 4, 14, 1.5),
  ('Banana', 'unidade', 90, 1, 23, 0),
  ('Maçã', 'unidade', 80, 0, 21, 0),
  ('Café sem açúcar', 'xicara', 5, 0, 0, 0),
  -- Lanche
  ('Iogurte grego natural', 'g', 1, 0.1, 0.04, 0.05),
  ('Aveia em flocos', 'g', 3.8, 0.16, 0.66, 0.07),
  -- Almoço/Jantar
  ('Frango grelhado', 'g', 1.6, 0.31, 0, 0.04),
  ('Carne magra (patinho/coxão mole)', 'g', 1.6, 0.27, 0, 0.05),
  ('Peixe (tilápia/merluza)', 'g', 1.0, 0.20, 0, 0.02),
  ('Atum em água', 'g', 1.2, 0.27, 0, 0.01),
  ('Arroz branco cozido', 'g', 1.3, 0.027, 0.28, 0.003),
  ('Arroz integral cozido', 'g', 1.1, 0.025, 0.23, 0.009),
  ('Feijão cozido', 'g', 0.95, 0.06, 0.17, 0.005),
  ('Salada folhas/tomate/pepino', 'g', 0.15, 0.005, 0.025, 0),
  ('Legumes refogados', 'g', 0.4, 0.015, 0.07, 0.005),
  -- Pré/Pós-treino
  ('Batata-doce cozida', 'g', 0.86, 0.016, 0.20, 0.001),
  ('Whey protein', 'g', 4.0, 0.80, 0.08, 0.03)
on conflict (name) do nothing;

-- ── Suplementos do protocolo ────────────────────────────

insert into public.supplements_catalog (id, name, dose, notes, schedule_kind, schedule_period, schedule_weekday) values
  ('creatina',   'Creatina',   '3-5g',                'Pode ser tomada com qualquer refeição', 'daily', 'any',     null),
  ('vitamina-d', 'Vitamina D', '1 cápsula',           null,                                     'daily', 'morning', null),
  ('biotina',    'Biotina',    '1 cápsula',           null,                                     'daily', 'morning', null),
  ('minoxidil',  'Minoxidil',  'Aplicar conforme orientação', 'Antes de dormir',                'daily', 'night',   null),
  ('durateston', 'Durateston', 'Conforme protocolo',  'Toda quarta-feira',                      'weekly','any',     3)
on conflict (id) do nothing;

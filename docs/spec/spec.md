# Spec — MyFitness "Modo Caverna"

> **Source documents (Article IV — No Invention):**
> - `docs/spec/requirements.json` (FRs/NFRs/CONs)
> - `docs/spec/complexity.json` (CDDs/RISKs)
> - `docs/spec/research.json` (R-01..R-07)
> - `protocoloGustavo_modo_caverna.pdf` (seed)
>
> Toda afirmação abaixo é rastreável a um destes IDs. Trechos sem rastreabilidade são erro de spec.

---

## 1. Visão

App **mobile-first** (Expo + React Native + TypeScript) para o atleta **Gustavo** gerenciar dieta e treino segundo o protocolo "Modo Caverna" (ref: PDF), com colaboração de **1 coach** que edita o plano e cadastra variações. Foco no **registro de séries com fricção zero** e **cronômetro de descanso confiável** (mesmo em background). [FR-01, FR-08, NFR-01, CON-02]

**Não é:** marketplace, multi-tenant, integração com wearables, web/desktop. [outOfScope]

---

## 2. Atores e papéis

| Ator | Permissões | Origem |
|---|---|---|
| **Atleta** (Gustavo) | read:plan, write:execution, write:meal-log, write:photos | requirements.actors[athlete] |
| **Coach** (convidado) | read:*, write:plan, write:variations, write:notes | requirements.actors[coach] |

Modelo de permissão: **workspace** com `athlete_user_id` (NOT NULL) + `coach_user_id` (nullable). RLS por `workspace_id`. [CDD-04, R-02]

---

## 3. Capabilities (épicos)

### EPIC-1 — Foundation
**Objetivo:** Projeto Expo rodando, theme aplicado, auth funcional, Supabase conectado.

- App boot com Expo SDK estável + TS strict + expo-router. [CON-01]
- Theme tokens "Modo Caverna" via NativeWind v4. [CON-08, R-04]
- Fonts: Inter (UI) + Bebas Neue (números). [CON-08, R-04]
- Supabase client + auth (email + magic link). [NFR-05]
- Navegação base: tabs (Hoje, Treino, Dieta, Progresso, Perfil).

**Acceptance:** App abre em iOS Simulator + Android Emulator, login completa, deep-link de magic link funciona.

### EPIC-2 — Profile + Coach Invite
**Objetivo:** Atleta cadastra perfil, gera convite para coach.

- CRUD de perfil (idade, peso, altura, nível, objetivo, frequência) — seed do PDF na 1ª carga. [FR-01, FR-13]
- Histórico de pesagens (lista + adicionar pesagem com data).
- Geração de código de convite (6 chars, expira 48h). [FR-11]
- Tela de coach: redeem code → vincula ao workspace.

**Acceptance:** Coach com código consegue acessar dados do atleta; sem código, RLS bloqueia.

### EPIC-3 — Diet (plano + variações + log)
**Objetivo:** Plano alimentar editável + variações + registro de aderência.

- Render de 6 refeições com itens (alimento, quantidade, unidade). [FR-02, FR-13]
- Coach edita itens (quantidade, alimento, observações). [FR-12]
- Coach cadastra variações por item (ex.: arroz → batata-doce 150g). [FR-03]
- Atleta marca refeição como feita; pode escolher variação. [FR-04]
- Aderência diária = % refeições marcadas; visível no Hoje.

**Acceptance:** Coach troca item, atleta vê na próxima abertura; atleta marca refeição, aparece com timestamp e variação escolhida.

### EPIC-4 — Workout (plano + variações)
**Objetivo:** Plano de treino semanal editável + variações de exercícios.

- Render de 5 dias com exercícios ordenados, séries, reps-alvo, descanso, cardio. [FR-05, FR-13]
- Coach edita exercício, séries, reps, descanso, ordem. [FR-12]
- Coach cadastra variações por exercício (ex.: Supino reto barra → Smith). [FR-06]
- Atleta seleciona variação no momento da execução.
- Catálogo global de exercícios (read-only) + variations por workspace. [CDD-05]

**Acceptance:** Coach reordena exercícios; atleta vê nova ordem. Coach cria variação; atleta vê opção no picker.

### EPIC-5 — Execution + Timer (CORAÇÃO DO APP)
**Objetivo:** Registro rápido de séries + cronômetro de descanso confiável.

- Tela "Treino de hoje" com lista de exercícios + checkpoints de séries. [FR-07]
- Por série: input de carga (stepper -/+ 2.5kg), reps (stepper -/+ 1), RPE opcional, nota opcional. [R-06]
- Histórico inline: "última: 60kg × 10" abaixo do input. [R-06]
- Confirmar série → grava + auto-start timer + scroll pra próxima. [FR-08]
- **Timer:** ring countdown grande (Bebas Neue), -15s/+15s, pause/resume, skip, custom. [FR-08]
- **Background:** scheduled notification com som custom + haptic ao zerar. [CDD-02, R-01, R-07]
- **Drift:** Date.now() como verdade, tick 200ms só pra UI. [CDD-01, NFR-02]
- **Persistência:** timer state em MMKV; restaura ao reabrir app. [R-01]
- **Keep-awake:** tela acesa durante sessão. [FR-08]
- **Offline:** mutations otimistas com idempotency UUID; replay ao reconectar. [NFR-04, CDD-03, R-03]
- Progressão de carga: sugere +2.5kg ou +1 rep se atingiu top range nas últimas 2 sessões. [FR-09]
- PR badge ember quando bate recorde absoluto.
- Plano = template, sessão = snapshot imutável. [CDD-06]

**Acceptance:**
- Cronômetro: drift <1s/min em sessão de 60min (NFR-02), dispara em background com app fechado, som + haptic OK.
- Registro: tempo médio para registrar 1 série < 8s (success metric).
- Offline: registrar 8 séries sem rede → reconectar → todas sincronizam sem duplicar.

### EPIC-6 — Progress (fotos + dashboard coach)
**Objetivo:** Fotos de progresso + resumo para coach.

- Upload foto (frente/costas/lateral) com data e peso. [FR-14]
- Compressão local 1080p q=0.8 antes do upload. [R-05]
- Storage: bucket privado `progress-photos`, path `{workspace_id}/{date}_{angle}_{uuid}.jpg`. [R-05]
- Galeria com filtro por ângulo + comparativo lado-a-lado entre 2 datas.
- Dashboard coach: aderência (%), treinos completados, volume por grupo muscular, evolução peso, últimas fotos. [FR-15]
- **Sem realtime** — refresh ao abrir/pull-to-refresh. [CON-07]

**Acceptance:** Atleta sobe foto, coach vê em <1s ao refresh; atleta sem foto, dashboard mostra placeholder.

---

## 4. Arquitetura técnica

### Stack [CON-01, complexity.architectureDecision]

```
Cliente (Expo SDK + RN + TS)
├── Routing: expo-router (file-based)
├── Styling: NativeWind v4 (Tailwind RN)
├── State client: Zustand
├── State server: TanStack Query v5 + persistQueryClient + MMKV
├── Forms: react-hook-form + zod
├── Animations: react-native-reanimated v3
├── Native: expo-notifications, expo-haptics, expo-audio,
│           expo-keep-awake, expo-image-picker,
│           expo-image-manipulator, react-native-mmkv
└── Lib: @supabase/supabase-js v2

Backend (Supabase BaaS)
├── Postgres 15+ com RLS
├── Auth (email + magic link)
├── Storage (bucket privado progress-photos)
└── Edge Functions: evitar no MVP

Build/Deploy
├── EAS Build (preview + production)
├── EAS Update (OTA)
└── Channels: development, preview, production
```

### Estrutura de módulos

```
app/                      # expo-router routes
  (auth)/                 # login, magic-link
  (tabs)/                 # hoje, treino, dieta, progresso, perfil
  workout/[sessionId]/    # tela de execução
src/
  features/               # bounded contexts
    diet/
    workout/
    execution/
    timer/
    photos/
    coach/
  components/             # design system
  lib/
    supabase/             # client + types + RLS helpers
    timer/                # engine pura (testável)
    storage/              # MMKV wrappers
  stores/                 # zustand
  queries/                # TanStack Query hooks
  theme/                  # tokens Modo Caverna
supabase/
  migrations/             # SQL
  seed.sql                # seed do PDF
  tests/                  # pgtap RLS tests
```

### Decisões críticas (do complexity.json)

| ID | Decisão |
|---|---|
| CDD-01 | Timer engine = classe TS pura, hook expõe estado |
| CDD-02 | Background timer via scheduled notification |
| CDD-03 | Offline-first: TanStack Query + MMKV + UUID idempotency |
| CDD-04 | RLS por `workspace_id` |
| CDD-05 | Catálogo global + variations por workspace |
| CDD-06 | Plano = template; Sessão = snapshot imutável |

---

## 5. Theme — "Modo Caverna" tokens [CON-08]

```ts
export const theme = {
  colors: {
    bg: { obsidian: '#0A0A0B', cave: '#141416', elevated: '#1C1C1F' },
    border: { smoke: '#2A2A2E' },
    text: { bone: '#F5F5F4', ash: '#A1A1AA' },
    accent: { ember: '#FF6B1A', glow: '#FFB084' },
    state: { moss: '#4ADE80', amber: '#FBBF24', blood: '#EF4444' },
  },
  fonts: {
    sans: 'Inter',
    display: 'BebasNeue',
    mono: 'SpaceGroteskMono',
  },
  radius: { sm: 8, md: 12, lg: 16, full: 9999 },
  spacing: { /* 4, 8, 12, 16, 24, 32, 48, 64 */ },
};
```

---

## 6. Data model (high-level — detalhado por @data-engineer)

```
profiles (1:1 com auth.users)
  id, full_name, role: 'athlete' | 'coach', created_at

workspaces
  id, athlete_user_id (FK → profiles), coach_user_id (FK → profiles, nullable),
  invite_code, invite_expires_at

athlete_data (1:1 com workspace, athlete-only)
  workspace_id, age, height_cm, weight_kg, level, goal, weekly_frequency

weight_logs
  id, workspace_id, weight_kg, logged_at

-- Catálogo global (read-only para clientes)
exercises_catalog
  id, name, muscle_group, equipment, default_unit

foods_catalog
  id, name, default_unit, kcal_per_unit, protein_g, carb_g, fat_g

-- Plans (templates editáveis pelo coach)
workout_plans
  id, workspace_id, name, active (only one active per workspace)

workout_plan_days
  id, plan_id, day_index (0-6), name, cardio_minutes

workout_plan_exercises
  id, day_id, exercise_id (FK catalog), order, sets, reps_target, rest_seconds

exercise_variations
  id, workspace_id, base_exercise_id, name, notes

meal_plans
  id, workspace_id, name, active, kcal_target, protein_g, carb_g, fat_g

meal_plan_meals
  id, plan_id, order, name (Café, Lanche...)

meal_plan_items
  id, meal_id, food_id (FK catalog), quantity, unit

food_variations (substituições)
  id, workspace_id, base_item_id, food_id (alternativo), quantity, unit, notes

-- Execução (snapshots imutáveis)
workout_sessions
  id, workspace_id, plan_day_id, started_at, finished_at, plan_snapshot JSONB

set_logs
  id, session_id, exercise_id, variation_id (nullable),
  set_number, weight_kg, reps_done, rpe, note,
  client_id UUID UNIQUE,  -- idempotency
  created_at

meal_logs
  id, workspace_id, plan_meal_id, variation_id (nullable),
  consumed_at, note, client_id UUID UNIQUE

progress_photos
  id, workspace_id, angle: 'front'|'back'|'side',
  storage_path, taken_on DATE, weight_kg
```

RLS: toda tabela com `workspace_id` filtra por `is_workspace_member(workspace_id, auth.uid())`. [CDD-04, RISK-02 → mitigado por pgtap]

---

## 7. NFRs e como atendemos

| NFR | Como cumprimos |
|---|---|
| NFR-01 mobile-first Expo | Stack inteiro RN/Expo, sem web |
| NFR-02 timer drift <1s/min | CDD-01 (Date.now() source) |
| NFR-03 dark + Modo Caverna | Tokens fixos, sem light mode |
| NFR-04 offline-first | CDD-03 (TanStack + MMKV + UUID) |
| NFR-05 auth Supabase | @supabase/supabase-js v2 |
| NFR-06 RLS | CDD-04 + pgtap obrigatório |
| NFR-07 notifications locais | expo-notifications scheduled |
| NFR-08 acessibilidade | Touch targets >=56pt em telas de execução, AA contrast |

---

## 8. Métricas de sucesso

- 100% das séries de um treino registradas sem sair da tela. [requirements.successMetrics]
- Timer 0 falhas em 30 dias.
- Coach edita exercício; atleta vê em <1 abertura.
- Tempo médio para registrar 1 série < 8s.

---

## 9. Riscos e mitigação

| Risk | Mitigação | Severity |
|---|---|---|
| Timer drift iOS background | CDD-02 + smoke test device real | MEDIUM |
| RLS leak | pgtap obrigatório no CI | HIGH |
| Sync duplicatas | UUID idempotency client-side | MEDIUM |
| EAS cota | Expo Go local; EAS só preview/prod | LOW |

---

## 10. Out of scope explícito

Marketplace, pagamentos, wearables, IA form check, geração de plano por IA, chat coach<>atleta, web/desktop, multi-plano simultâneo, realtime do coach, light mode. [requirements.outOfScope]

---

## 11. Próximos passos do pipeline

1. **Critique (@qa)** → `docs/spec/critique.json`
2. **Plan (@architect)** → `docs/spec/implementation.yaml` (épicos + ordem + dependências)
3. **UX (@ux-design-expert)** → `docs/ux/front-end-spec.md` (wireframes, fluxos)
4. **DB (@data-engineer)** → `docs/db/SCHEMA.md` + migrations + pgtap
5. **Stories (@sm)** → `docs/stories/*.md`

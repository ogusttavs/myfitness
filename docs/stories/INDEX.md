# Stories Index — Modo Caverna

Cada story segue o template `.aiox-core/development/templates/story-tmpl.yaml`. Status: Draft → Validated → Ready → InProgress → InReview → Done.

## EPIC-1 Foundation
- [1.1](1.1.bootstrap-expo.md) — Bootstrap Expo + TS + expo-router
- [1.2](1.2.theme-tokens.md) — NativeWind + tokens Modo Caverna + fonts
- [1.3](1.3.supabase-client.md) — Supabase client + envs + types
- [1.4](1.4.auth-flow.md) — Auth (email + magic link) + deep linking
- [1.5](1.5.tab-navigation.md) — Tabs + design system primitives
- [1.6](1.6.ci-pipeline.md) — CI (lint, typecheck, jest, pgtap)

## EPIC-2 Profile + Coach Invite
- 2.1 — Migration workspaces/profiles/athlete_data/weight_logs + RLS
- 2.2 — Onboarding atleta + seed do PDF
- 2.3 — Tela perfil + edição + pesagens
- 2.4 — Geração e redeem de invite code
- 2.5 — Revoke coach access

## EPIC-3 Diet
- 3.1 — Migration meal_plans/meals/items/variations/logs
- 3.2 — Seed plano alimentar
- 3.3 — Tela Dieta + macros
- 3.4 — Edição (coach)
- 3.5 — Variações de alimento
- 3.6 — Marcar refeição + variação
- 3.7 — Aderência diária no Hoje

## EPIC-4 Workout
- 4.1 — Migration workout_plans/days/exercises/variations
- 4.2 — Seed catálogo + 5 dias
- 4.3 — Tela Treino + drill-down
- 4.4 — Edição (coach)
- 4.5 — Variações de exercício

## EPIC-5 Execution + Timer (CORE)
- [5.1](5.1.timer-engine.md) — Timer engine + tests ✅
- 5.2 — useTimer hook + MMKV
- 5.3 — Scheduled notifications + permission + fallback
- [5.4](5.4.timer-ring.md) — RestTimerRing component ✅
- 5.5 — Migration sessions/set_logs
- 5.6 — Tela de execução
- 5.7 — Confirmar série → grava + auto-timer + scroll
- 5.8 — Histórico inline
- 5.9 — Plan snapshot
- 5.10 — Sugestão de progressão
- 5.11 — PR badge
- 5.12 — Keep-awake

## EPIC-6 Progress
- 6.1 — Migration + bucket photos
- 6.2 — Upload (picker + manipulator)
- 6.3 — Galeria + filtro
- 6.4 — Comparativo before/after
- 6.5 — Dashboard coach

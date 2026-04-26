# Review AIOX — Modo Caverna (2026-04-26)

> Snapshot dos 3 agentes AIOX rodados em paralelo: **@qa**, **@architect**, **@ux-design-expert**.

---

## 📊 Scores consolidados

| Dimensão | Score | Veredito |
|---|---|---|
| **Quality (QA)** | 68/100 | CONCERNS |
| **Architecture** | 6/10 | OK estrutural; CDD-06 não implementado é o gap crítico |
| **UX** | 7.5/10 | Forte na execução; faltam microinterações de celebração |

---

## 🔴 Top 5 ações urgentes (ordenadas por valor/custo)

### 1. **Regenerar `database.types.ts` via Supabase CLI** ⏱ 15min · 🔥 alto valor
```bash
npx supabase gen types typescript --project-id eunhwmaeatzswebkuyzn > apps/web/src/lib/supabase/database.types.ts
```
- Remove os 12+ `as never` espalhados
- Permite remover `typescript.ignoreBuildErrors: true` em `next.config.ts`
- Tipo safety real em mutations de produção

### 2. **Implementar CDD-06 (snapshots imutáveis)** ⏱ ~2 dias · 🔥🔥 crítico
- Hoje: sessão de treino é Zustand local; dados somem se limpar cache
- Coach não vê treino do atleta em tempo real
- `plan_snapshot` JSONB existe no schema mas NUNCA é populado
- Migrar `useWorkoutSession` (Zustand) → TanStack Query + `workout_sessions`/`set_logs` no Supabase
- Ao iniciar sessão: serializar `plan_day` em snapshot JSONB
- Ao confirmar série: `INSERT set_logs` com `client_id` UUID (idempotência)
- **Desbloqueia:** relatórios reais, edição coach com preservação de histórico, sync multi-device

### 3. **Fix race conditions com `Promise.all`** ⏱ 1h · 🔥 alto
- `useAthleteProfile.ts:38-40` e `app/coach/[workspaceId]/page.tsx:30,64` quebram silenciosamente quando uma das queries falha
- Envolver em try/catch + tratar parciais; se uma falha → considerar fallback
- Causa do "loop de onboarding" antigo

### 4. **Adicionar pgtap RLS tests no CI** ⏱ ~3h · 🔥 alto valor (mitiga RISK-02)
- `supabase/tests/rls_*.test.sql` já sketched em `docs/db/SCHEMA.md`
- Validam RLS por workspace_id em todos cenários (atleta A vs B, coach vs atleta, etc.)
- Rodar `supabase test db` em GitHub Actions

### 5. **Microinterações de feedback** ⏱ 2-3h · 🔥 alto UX
- **Série confirmada**: confetti emoji 🔥💪 600ms + haptic Medium + som tipo "ting"
- **Timer 0**: ring SVG com `drop-shadow` glow intensificando + número pulsando
- **Carga sobe (PR)**: scale-110 + text-glow no número de volume na SessionBar (~300ms)
- **Cards de atleta**: stagger reveal `opacity-0 translate-y-4 → opacity-100` com delay por índice (`/progresso`, `/relatorios`)

---

## 🟡 Quality Gate (@qa) — Issues encontradas

| Severidade | Categoria | Arquivo:linha | Descrição | Fix |
|---|---|---|---|---|
| HIGH | error-handling | `app/coach/[workspaceId]/page.tsx:30,64` | `Promise.all` sem error handling — uma query falha derruba tudo | try/catch + mensagens user-friendly |
| HIGH | race-condition | `OnboardingGuard.tsx:22-36` | Lógica circular se `useAthleteProfile` retorna loading=false com data=null em `/onboarding` | adicionar `initializing` state explícito |
| HIGH | type-safety | `src/lib/supabase/*` | 12+ `as never` mascarando incompatibilidade types | regenerar via CLI |
| MEDIUM | async-error | `coach/queries.ts:96-111` | Steps após coach link insert não tem catch — server fica inconsistente | wrap em try/catch ou SQL function transactional |
| MEDIUM | unhandled-promise | `OnboardingForm.tsx:83-85` | `weight_logs` insert não checa erro | `if (error) setError(...)` antes do redirect |
| MEDIUM | cache-race | `useAthleteProfile.ts:38-40` | Promise.all parcial → hasOnboarded=false errado → loop | validar response structure |
| MEDIUM | tests | `src/features/*` | 0 testes além de `RestTimer.test.ts` | priorizar onboarding/coach redeem/logSet com MSW |
| MEDIUM | middleware | `middleware.ts:26` | `auth.getUser()` sem catch — sessão expira mais rápido | try/catch + log |
| LOW | observability | `ExerciseCard.tsx:276` | `playFinishBeep` catch silencia tudo | logar exceto NotSupportedError |

### Coverage gaps de testes

| Componente | Status |
|---|---|
| `RestTimer` | ✅ 100% (11 tests) |
| `OnboardingForm.submit` | ❌ 0% |
| `useRedeemInvite` | ❌ 0% |
| `ExerciseCard` (logSet/undo) | ❌ 0% |
| `OnboardingGuard` (redirect logic) | ❌ 0% |
| `useAthleteProfile` (parciais) | ❌ 0% |

---

## 🟠 Architecture (@architect) — Drift dos CDDs

| CDD | Status |
|---|---|
| **CDD-01** Timer engine puro | ✅ Implementado |
| CDD-02 Background notification | ❌ Não aplicável (web) |
| **CDD-03** Offline-first MMKV | ⚠️ Parcial — Zustand local OK, persistQueryClient não integrado |
| **CDD-04** RLS workspace | ✅ Implementado (faltam pgtap tests) |
| **CDD-05** Catálogos global + variations | ✅ Schema; ❌ UI de variations não exposta ao coach |
| **CDD-06** Plano=template, Sessão=snapshot | ❌ **NÃO IMPLEMENTADO — bloqueador** |

### Riscos arquiteturais (HIGH)

1. **Sessões em Zustand localStorage puro** — clear cache = treinos perdidos; coach não vê em tempo real
2. **Sem pgtap RLS tests no CI** — risco de regressão silenciosa em RLS policies
3. **`as never` casts ocultam quebras de schema** — Supabase mudou? Build não pega

### Tech debt acumulado

- `database.types.ts` hand-rolled (183 linhas) → regenerar
- `typescript.ignoreBuildErrors: true` → remover assim que types corretos
- Middleware deprecation (Next 16 sugere `proxy.ts`)
- Apenas `seed_modo_caverna_protocol` como template SQL — abstrair quando vier o 2º

---

## 🟢 UX (@ux-design-expert) — Issues priorizadas

### P0 — quebra UX
- **`HojeClient`**: card "TREINO DE HOJE" sem feedback tátil. Add `active:scale-[0.98] active:shadow-[0_0_32px_rgba(255,107,26,0.35)]`
- **`ExerciseCard`**: série ativa sem indicador visual claro. Add `border-l-4 border-ember bg-ember/5` + animate-pulse na série atual

### P1 — polish importante
- **`SessionBar`**: kg sobe sem animação. Add scale-110 + text-glow transient (300ms) quando volume muda
- **`MealDetailSheet`**: grid 4-col denso em mobile. Mudar pra grid-cols-2 com kcal destacado
- **`BottomNav`**: ativos só mudam cor. Add scale-110 + lift sutil

### P2 — nice
- **`ProgressoClient`**: cards de upload parecem fotos finalizadas. ImagePlus maior + transparência maior na hover
- **`SessionSummary`**: muito vazio na celebração. Confetti + haptic Heavy + som triunfo
- **`CoachPage` redeem**: sem feedback até validar. Add ✓ ao completar 6 chars

### Telas que mais precisam de iteração visual

1. **Execução de treino** — coração do app, merece mais punch (glow na série ativa, próxima série inline preview, ring com drop-shadow intensificando nos últimos 5s)
2. **Hoje (landing)** — próxima refeição com clock pulsante; cards de refeição com gap maior + blur sutil
3. **Coach painel** — falta indicação de "atualizado agora" em verde nos atletas com atividade recente

### Pontos fortes
- Execução de treino: 9/10 (steppers gigantes, hierarquia clara, fricção zero)
- Paleta consistente em todas as telas (instagrammável)
- Meal sheet + auto-save de notas + Progresso fluido

### Recomendação UX
Antes da próxima sessão de stage, deploy:
1. Confetti emoji shower em logSet
2. Pulse acelerado no timer + ring com glow nos últimos 5s
3. Stagger reveal nas listas de Progresso e Relatórios

E auditar contraste em **luz forte** (academia/cozinha em dia ensolarado).

---

## 🛤️ Plano consolidado

### Sprint 1 (próximas 2 semanas)
1. Regenerar `database.types.ts` (15min) — destrava tudo
2. Fix race conditions (`Promise.all` + OnboardingGuard) (1h)
3. Implementar CDD-06: snapshots imutáveis + migrar Zustand → Supabase (4-6h)
4. Microinterações P0 + P1 (3-4h)

### Sprint 2 (semanas 3-4)
5. Adicionar pgtap RLS tests no CI (3h)
6. Coach edita exercícios/refeições/variações (~2 dias)
7. Testes unitários críticos (onboarding, coach redeem, logSet) (2-3h)

### Sprint 3+
8. Fotos comparativas before/after
9. Web Push notifications
10. Multi-plano (cutting/bulking)

---

> **Documento gerado em 2026-04-26** pelos agentes AIOX @qa, @architect, @ux-design-expert. Re-rodar a cada release maior.

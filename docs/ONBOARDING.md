# Onboarding — Modo Caverna

> **Documento principal pra qualquer agente (Claude, Codex, Cursor, etc.) entender o projeto em 5 minutos.**
> Atualizar sempre que houver mudança arquitetural ou de processo.

---

## 1. O que é

App **web mobile-first** para o **Gustavo Silva** (atleta) gerenciar treino e dieta segundo o protocolo "Modo Caverna" (hipertrofia + recomposição corporal). Single-user no MVP, com plano de adicionar 1 coach via convite quando o backend entrar.

**Documento-fonte canônico:** `protocoloGustavo_modo_caverna.pdf` (raiz do repo).
- Perfil: 22 anos, 80kg, 1.75m, Avançado, Hipertrofia + Perda de Gordura
- Dieta: 1800 kcal · 160P / 215C / 67G · 6 refeições
- Treino: 5x/semana (Push/Pull/Legs/Upper/Lower)

**Princípio Article IV (No Invention):** dados não podem divergir do PDF. Calorias estimadas estão marcadas com `~` no UI.

---

## 2. Acesso à produção

| Item | Valor |
|---|---|
| **URL pública** | https://web-xi-neon-37.vercel.app |
| **GitHub** | https://github.com/ogusttavs/myfitness |
| **Vercel project** | `web` em `ogusttavs-projects` |
| **Owner** | gustavs.silvs@gmail.com / GitHub @ogusttavs |
| **Banco de dados** | ❌ não provisionado (tudo em localStorage por dispositivo) |
| **Auth** | ❌ ainda não — qualquer pessoa que abre a URL tem dados isolados |

### Como instalar no iPhone como app

1. Safari → URL acima
2. Compartilhar → "Adicionar à Tela de Início"
3. Vira ícone "Caverna" (PWA manifest configurado)

### Como atualizar produção

```bash
cd apps/web
vercel --prod --yes
```

Quando o auto-deploy via GitHub estiver conectado (manual no painel Vercel), basta `git push origin main`.

#### Conectar auto-deploy (TODO manual)

1. https://vercel.com/ogusttavs-projects/web/settings/git
2. Connect Git Repository → escolher `ogusttavs/myfitness`
3. Root Directory: `apps/web`
4. Production Branch: `main`

---

## 3. Stack técnica

| Camada | Tecnologia | Notas |
|---|---|---|
| Framework | Next.js 15.x App Router | Turbopack ativo, typedRoutes ativo |
| Linguagem | TypeScript strict | `noUncheckedIndexedAccess: true`, `noImplicitOverride: true` |
| Styling | Tailwind CSS 3 + shadcn/ui | Apenas `Button` adicionado até agora |
| State client | Zustand 5 + persist (localStorage) | Sempre usar `useHydrated()` ao ler |
| State server | TanStack Query 5 | Configurado mas ainda não usado (sem backend) |
| Fonts | Inter / Bebas Neue / Space Grotesk | via `next/font/google` |
| Ícones | lucide-react | |
| Tests | Vitest + happy-dom | `RestTimer.test.ts` cobre engine |
| Hosting | Vercel | Edge / SSG mix; tudo o que dá é static |
| Repo | GitHub (HTTPS via gh CLI) | |

### Por que não Expo / mobile nativo (decisão histórica)

Pivotamos de Expo para Next.js em 2026-04-26. Motivos:
- Distribuição: link no WhatsApp vs App Store / Expo Go / TestFlight
- Custo: $0 vs $99/ano Apple Dev
- Iteração: `vercel --prod` em 30s vs build EAS 5-10min
- Trade-off aceito: **iOS Safari não suporta `navigator.vibrate`**, então timer usa só som + flash visual no iPhone (no Android funciona)

Pasta `apps/mobile/` está mantida como referência mas **não usar** — é legacy.

---

## 4. Estrutura do repo

```
modo-caverna/
├── CLAUDE.md                       ← briefing rápido
├── README.md                       ← visão de marketing/setup
├── AGENTS.md                       ← AIOX-managed (não editar manualmente)
├── protocoloGustavo_modo_caverna.pdf  ← FONTE CANÔNICA
│
├── apps/
│   ├── web/                        ← APP ATIVO
│   │   ├── app/                    ← rotas (App Router)
│   │   ├── components/ui/          ← shadcn primitives
│   │   ├── src/
│   │   │   ├── components/         ← UI custom (AppShell, BottomNav, Sheet, ...)
│   │   │   ├── data/protocol.ts    ← seed do PDF (perfil + dieta + treino + suplementos)
│   │   │   ├── features/           ← bounded contexts (hoje, execution, diet, relatorios)
│   │   │   ├── lib/                ← timer engine, supabase clients, cn, idempotency
│   │   │   ├── stores/             ← Zustand (workoutSession, mealLog, wellness)
│   │   │   └── theme/tokens.ts     ← tokens Modo Caverna
│   │   ├── public/manifest.webmanifest
│   │   ├── tailwind.config.ts
│   │   └── vitest.config.ts
│   └── mobile/                     ← LEGACY (Expo) — não tocar
│
├── docs/
│   ├── ONBOARDING.md               ← este arquivo
│   ├── spec/                       ← Spec Pipeline AIOX
│   │   ├── requirements.json
│   │   ├── complexity.json         ← decisões críticas (CDD-01..06), riscos
│   │   ├── research.json
│   │   ├── spec.md                 ← spec executável
│   │   ├── critique.json           ← QA gate APPROVED 4.2/5
│   │   └── implementation.yaml     ← 30 stories planejadas
│   ├── ux/front-end-spec.md        ← wireframes ASCII + tokens
│   ├── db/SCHEMA.md                ← schema Supabase (a aplicar)
│   └── stories/                    ← stories Done / em backlog
│       └── INDEX.md
│
├── .aiox-core/                     ← framework AIOX (NÃO MODIFICAR — L1/L2 protegidas)
└── .claude/                        ← config Claude Code + rules
```

---

## 5. Comandos do dia-a-dia

```bash
# Setup local (clone fresh)
cd apps/web && npm install
cp .env.example .env.local

# Dev
npm run dev                   # http://localhost:3000

# Validação antes de PR
npm run typecheck             # tsc --noEmit
npm run lint                  # next lint
npm test                      # vitest run
npm run build                 # valida build prod

# Deploy
vercel --prod --yes           # publica em produção
vercel ls                     # lista deploys
vercel logs <url>             # logs de runtime
```

---

## 6. Convenções de código

- **Server Components por padrão** — só usa `'use client'` quando precisa de hooks/state.
- **Stores Zustand** sempre lidos com `useHydrated()` antes do primeiro acesso para evitar SSR mismatch.
- **Path aliases:** `@/*` → `src/*`, `@app/*` → `app/*`, `@ui/*` → `components/ui/*`.
- **Sem console.log** em código de produção (warn ok pra avisar dev de env vars faltantes).
- **Imports** ordenados: stdlib → third-party → @/ → relativos.
- **Arquivos < 300 linhas** preferencialmente. Quebrar em sub-componentes quando crescer.
- **Datas**: `YYYY-MM-DD` (string) para chaves de log diário; `Date.now()` (epoch ms) para timestamps.

### Tema "Modo Caverna" — paleta fixa

| Token Tailwind | Hex | Uso |
|---|---|---|
| `obsidian` | `#0A0A0B` | bg base |
| `cave` | `#141416` | cards |
| `elevated` | `#1C1C1F` | inputs, botões secundários |
| `smoke` | `#2A2A2E` | borders |
| `bone` | `#F5F5F4` | texto primário |
| `ash` | `#A1A1AA` | texto secundário |
| `mute` | `#6B6B70` | hint, helper |
| `ember` | `#FF6B1A` | **accent único** — CTA, PR, timer ativo |
| `ember-glow` | `#FFB084` | hover/highlight ember |
| `moss` | `#4ADE80` | sucesso, série completada |
| `amberx` | `#FBBF24` | warning |
| `blood` | `#EF4444` | erro, deletar |

**Fontes:** Inter (UI) · Bebas Neue (números/títulos) · Space Grotesk (mono).

---

## 7. Stores e contratos

### `useWorkoutSession`
```ts
{ active: WorkoutSession | null, history: WorkoutSession[] }
- startSession(dayCode)
- finishSession() → returns finished session
- logSet({ exerciseKey, exerciseName, setNumber, weightKg, reps })
- removeLastSet(exerciseKey)
- cancelSession()
```
Helpers: `totalVolumeKg(s)`, `sessionDurationMs(s)`, `formatDuration(ms)`.

### `useMealLog`
```ts
{ entries: MealLogEntry[] }
- toggleDone(mealOrd, date)
- setNote(mealOrd, date, note)        // auto-save com debounce no UI
- clear(mealOrd, date)
- isDone(mealOrd, date), getEntry(mealOrd, date), forDate(date)
```

### `useWellness`
```ts
{ waterMlByDate: Record<date, ml>, supplementsTaken: Record<`${date}::${id}`, true> }
- addWater(ml, date?), resetWater(date?), waterFor(date?)
- toggleSupplement(id, date?), isSupplementTaken(id, date?)
```

---

## 8. Decisões arquiteturais relevantes

| ID | Decisão | Por quê |
|---|---|---|
| CDD-01 | Timer engine = classe TS pura | Testável sem RN/React, drift-free via `Date.now()` |
| CDD-03 | Offline-first | Usuário na academia sem sinal precisa registrar séries |
| CDD-06 | Plano = template; Sessão = snapshot | Coach editar plano não pode reescrever histórico |
| 2026-04-26 | Pivot Expo → Next.js | Distribuição mais simples, sem App Store |
| 2026-04-26 | localStorage MVP | Sem Supabase ainda — entregar valor antes do backend |

---

## 9. Roadmap

**Done ✅**
- Bootstrap Next.js + theme + PWA
- Tela Hoje (treino + refeições + água + suplementos + próxima refeição)
- Tela Treino + drill em dia + execução com timer integrado
- Tela Dieta com sheet de detalhe + observações por dia
- Tela Relatórios (KPIs semana, gráfico volume, observações)
- Persistência localStorage (Zustand persist v2 com migração)
- Deploy Vercel produção

**Próximo (priorizado)**
1. **Auto-deploy GitHub→Vercel** (manual no painel — ver §2)
2. **Domínio custom** (ex: caverna.gustavosilva.dev)
3. **Supabase** — provisionar projeto, aplicar `docs/db/SCHEMA.md`, migrar localStorage → DB
4. **Auth** — magic link via Supabase
5. **Coach via convite** (workspaces + RLS já desenhado)
6. **Foto de progresso** (Supabase Storage)
7. **Variações de exercício/alimento** editáveis pelo coach
8. **PR badge + sugestão de progressão**

**Out of scope (MVP+v1)**
- App nativo, marketplace, pagamentos, IA, smartwatch, chat coach<>atleta, web push avançado.

---

## 10. Onde aprender mais

- **Spec completa:** `docs/spec/spec.md`
- **Decisões e riscos:** `docs/spec/complexity.json`
- **Wireframes + tokens:** `docs/ux/front-end-spec.md`
- **Schema do Supabase planejado:** `docs/db/SCHEMA.md`
- **Stories:** `docs/stories/INDEX.md`
- **Constitution AIOX:** `.aiox-core/constitution.md` (regras imutáveis do framework)

---

## 11. Quem é quem

- **Owner / Atleta:** Gustavo Silva (gustavs.silvs@gmail.com)
- **Coach:** TBD (será convidado quando Supabase entrar)
- **Agente principal:** Claude Code (Opus 4.7) via `.claude/` config + AIOX framework

---

> **Quando atualizar este doc:** mudança de stack, deploy URL, decisão arquitetural, novo store, mudança de fluxo principal. Pequenos ajustes de UI não precisam ser refletidos aqui.

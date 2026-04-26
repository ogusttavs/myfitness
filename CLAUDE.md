# CLAUDE.md — Modo Caverna (briefing rápido)

> **Antes de fazer QUALQUER coisa, leia [docs/ONBOARDING.md](docs/ONBOARDING.md).** Este arquivo é só o resumo de 30 segundos.

## O que é

App pessoal **web** (Next.js 15 + Vercel) para o **Gustavo Silva** gerenciar treino e dieta segundo o protocolo "Modo Caverna" (hipertrofia + recomposição corporal). Mobile-first. Tema dark fixo.

Documento-fonte canônico: [`protocoloGustavo_modo_caverna.pdf`](protocoloGustavo_modo_caverna.pdf) — não inventar dados fora dele.

## Estrutura

```
apps/web/         ← APP ATIVO (Next.js 15 + Tailwind + shadcn)
apps/mobile/      ← legacy (Expo) — NÃO USAR, mantido como referência
docs/
  ONBOARDING.md   ← LEIA PRIMEIRO
  spec/           ← Spec Pipeline AIOX (requirements/complexity/research/spec/critique/plan)
  ux/             ← wireframes + design tokens
  db/SCHEMA.md    ← schema Supabase (ainda não provisionado)
  stories/        ← stories de desenvolvimento (status Draft → Done)
.aiox-core/       ← framework AIOX, NÃO MODIFICAR
```

## Produção

- **URL:** https://web-xi-neon-37.vercel.app
- **Repo:** https://github.com/ogusttavs/myfitness
- **Hosting:** Vercel (projeto `web` em `ogusttavs-projects`)
- **Banco:** ❌ ainda não — tudo localStorage por dispositivo (próxima fase é Supabase)

## Comandos

```bash
cd apps/web
npm run dev          # http://localhost:3000
npm run build        # validar build prod
npm run typecheck    # tsc --noEmit
npm run lint
npm test             # vitest

# Deploy
vercel --prod --yes  # publica em produção
```

## Princípios não-negociáveis

1. **Web only** — pivotamos de Expo. Mobile foi descartado por simplicidade de distribuição.
2. **Dark mode** fixo, paleta "Modo Caverna" (obsidian + ember). Sem light mode.
3. **Mobile-first** — todas telas centradas em `max-w-md`. Touch targets ≥44pt.
4. **Sem SSR mismatch** — qualquer leitura de store persistido (Zustand) usa `useHydrated()`.
5. **Não inventar** — dados do PDF são canônicos. Calorias estimadas estão marcadas como `~`.
6. **Timer engine puro** — `src/lib/timer/RestTimer.ts` é TS puro, sem React. Não acoplar a frameworks.

## Onde está o quê (mapa rápido)

| Tela | Rota | Componente principal |
|---|---|---|
| Hoje | `/` | `src/features/hoje/HojeClient.tsx` |
| Treino (lista 5 dias) | `/treino` | `src/features/execution/TreinoClient.tsx` |
| Dia de treino | `/treino/[code]` | `src/features/execution/WorkoutDayClient.tsx` |
| Dieta | `/dieta` | `app/dieta/page.tsx` + `MealDetailSheet` |
| Relatórios | `/relatorios` | `src/features/relatorios/RelatoriosClient.tsx` |
| Perfil | `/perfil` | `app/perfil/page.tsx` |

| Store (Zustand persist) | Responsabilidade |
|---|---|
| `src/stores/workoutSession.ts` | sessão ativa + histórico de treinos |
| `src/stores/mealLog.ts` | refeições feitas + observações por dia |
| `src/stores/wellness.ts` | água + suplementação por dia |

| Dado seed | Onde |
|---|---|
| Perfil + macros + 6 refeições + 5 dias treino + suplementos | `src/data/protocol.ts` |

## Stack travada (não trocar sem discutir)

- Next.js 15 App Router · TS strict · Tailwind 3 · shadcn/ui (apenas Button até agora)
- Zustand v5 + persist (localStorage)
- Supabase (planejado, não conectado)
- Vercel hosting · GitHub repo

## Regras de commit

- Conventional commits: `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`
- Co-author Claude quando aplicável
- Nunca commitar `.env`, segredos, ou node_modules

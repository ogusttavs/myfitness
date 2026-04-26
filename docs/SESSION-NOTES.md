# Session Notes — 2026-04-26 (sessão longa, ~6h)

> Pickup point pra próxima sessão. **Leia primeiro.**

---

## ⏭️ Continue daqui (próxima sessão)

### O que fazer ASSIM que reiniciar

1. **Verificar MCPs carregados:**
   - `supabase` (https://mcp.supabase.com/mcp?project_ref=eunhwmaeatzswebkuyzn) — pra rodar SQL direto no banco
   - `playwright` (`@playwright/mcp@latest`) — pra dirigir Chrome
   - Vercel (já estava — list_projects, get_project, etc)

2. **Aplicar último SQL pendente:** `supabase/setup-incremental-10.sql` (cria função `redeem_invite_code`)
   - Verificação rápida via curl: `curl -s -X POST "https://eunhwmaeatzswebkuyzn.supabase.co/rest/v1/rpc/redeem_invite_code" -H "apikey: sb_publishable_3ij28_W-UaUYL0diCY0HwA_qBo8tHe3" -H "Content-Type: application/json" -d '{"code":"X"}'` — se retorna `"unauthenticated"`, função existe ✓ (já está aplicado conforme última verificação)

3. **Destravar login do coach** — opções:
   - Esperar rate limit Supabase resetar (1h)
   - **Configurar Resend SMTP** (caminho recomendado): https://resend.com → API key → Supabase Auth → SMTP Settings (host smtp.resend.com, port 465, user `resend`, sender `onboarding@resend.dev`)

4. **Login do coach pra testar:** email `ogusttavs@gmail.com` (pre-vinculado como coach do Gustavo via `pending_coach_links`)

5. **Regenerar database.types.ts** (precisa de access token):
   ```bash
   npx supabase login            # interativo, abre browser
   npx supabase gen types typescript --project-id eunhwmaeatzswebkuyzn \
     > apps/web/src/lib/supabase/database.types.ts
   # Depois: remover `typescript.ignoreBuildErrors: true` em next.config.ts
   # e remover todos `as never` casts
   ```

---

## ✅ Feito nessa sessão

### Spec Pipeline AIOX (12 fases)
- requirements.json (15 FRs, 8 NFRs, 8 CONs)
- complexity.json (score 14, STANDARD, 6 CDDs, 4 RISKs)
- research.json (7 tópicos)
- spec.md (6 epics rastreáveis)
- critique.json (APPROVED 4.2/5)
- implementation.yaml (30 stories planejadas)

### Pivot Expo → Next.js (decisão arquitetural)
- Justificativa: distribuição mais simples (URL vs App Store), $0 vs $99/ano, deploy 30s vs 5-10min
- Trade-off: sem `navigator.vibrate` no iOS Safari (substituído por som + flash visual + haptic Android)

### App completo (apps/web — Next.js 16)
**Telas (12):**
- `/login` — magic link via Supabase
- `/onboarding` — form (nome, idade, peso, altura, nível, objetivo, frequência) com auto-save em cache pra evitar loop
- `/` Hoje — landing (treino dia, próxima refeição, 6 refeições toggleáveis, água com +/-, suplementos do dia, macros consumidas)
- `/treino` — lista 5 dias com badges "hoje" e "feito esta semana"
- `/treino/[code]` — execução com SessionBar (cronômetro + volume kg ao vivo + glow), ExerciseCard com séries logáveis, timer integrado por exercício, SessionSummary com confetti
- `/dieta` — 6 refeições com sheet de detalhe, observação por dia (auto-save debounce 600ms)
- `/progresso` — pesagem com gráfico SVG + histórico stagger reveal, upload fotos por ângulo (frente/lado/costas) com Supabase Storage signed URLs
- `/perfil` — dados dinâmicos do banco, botão editar (volta pra onboarding pré-preenchido), card de convite coach, link relatórios
- `/relatorios` — KPIs semana, gráfico volume, treinos recentes, observações
- `/coach` — lista atletas vinculados, redeem invite code via RPC atômica
- `/coach/[workspaceId]` — painel atleta com KPIs, treinos, fotos, botão "aplicar Modo Caverna"
- `/guia-coach` — HTML printable em PDF com 8 seções

**Stack consolidado:**
- Next.js 16 + TypeScript strict + Turbopack
- Tailwind 3 + shadcn/ui (Button, Sheet, EmptyState, Skeleton)
- Zustand 5 + persist localStorage
- TanStack Query 5 + QueryClientProvider
- @supabase/ssr (browser + server clients) + middleware refresh
- next/font (Inter, Bebas Neue, Space Grotesk)
- lucide-react

### Backend Supabase
- Projeto `eunhwmaeatzswebkuyzn` em São Paulo
- 17 tabelas + RLS em todas
- Helpers SECURITY DEFINER (`is_workspace_athlete`, `is_workspace_coach`, `is_workspace_member`) — quebra recursão
- Bucket privado `progress-photos` com RLS por workspace
- Catálogos seed: 30 exercícios + 18 alimentos + 5 suplementos do PDF
- Trigger `handle_new_user`: cria profile/workspace, backfill Gustavo, processa pending_coach_links
- Função `seed_modo_caverna_protocol(ws)`: clona protocolo do PDF
- Função `redeem_invite_code(code)`: atômica, valida + cria vínculo + promove a coach
- Função `link_coach_by_emails(coach, athlete)`: link manual

### Auth + Roles
- Magic link via Supabase
- AuthGuard (redireciona pra /login)
- OnboardingGuard (atleta sem dados → /onboarding; coach → /coach)
- `useActiveWorkspace`: lê role do profile, retorna workspace null pra coach
- `useAthleteProfile`: Promise.allSettled, loading inclui workspace loading

### Coach features
- N:N coach ↔ workspaces via `coach_workspaces`
- Atleta gera código 48h em Perfil → "Convite pro Coach"
- Coach cola código em /coach → "adicionar atleta"
- Coach vê painel completo do atleta (KPIs, treinos, fotos)
- Coach pode aplicar protocolo Modo Caverna em atleta sem plano
- `pending_coach_links`: pre-vínculos que ativam ao primeiro login

### Microinterações (do REVIEW.md)
- `src/lib/celebrate.ts`: emojis flutuantes 🔥💪⚡ + haptic + beep curto ao confirmar série
- ExerciseCard: série ativa com border-l-4 ember + bg ember/5 + número pulsando + botão glow
- SessionBar: número de volume com text-shadow glow + animação pop ao mudar
- SessionSummary: confetti shower no abrir + haptic Heavy
- ProgressoClient: stagger reveal nas listas (peso + fotos)
- Tailwind keyframes: `pop`, `slideUp`

### Quality fixes (do REVIEW.md)
- `useAthleteProfile`: Promise.allSettled (falha parcial não derruba)
- `coach/[ws]` page: Promise.allSettled + helper `ok()`
- `middleware.ts`: try/catch em `auth.getUser`
- `OnboardingForm`: `weight_logs` insert error tratado (warn, não bloqueia)
- `useRedeemInvite`: usa RPC atômica (sem inconsistência se passo intermediário falha)

### CDD-06 (parcial)
- `src/features/execution/syncSession.ts`: adapter Zustand → Supabase
- `workout_sessions.plan_snapshot` populado ao iniciar (best-effort)
- `set_logs` com `client_id` UUID (idempotência)
- `finished_at` marcado ao finalizar
- Coach já consegue ver treinos em (quase) tempo real

### Deploy
- Vercel projeto `web` em `ogusttavs-projects` (orgId team_66jqNss7YfqH9yIIp1cPNOiH, projectId prj_O4tsz9SJ6fxJvqOPUZTN04boiOUa)
- Auto-deploy via GitHub connect
- Root Directory: `apps/web`
- Production Branch: `main`
- URL pública: https://web-xi-neon-37.vercel.app
- Env vars NEXT_PUBLIC_SUPABASE_URL + ANON_KEY em production + development

### MCPs configurados (`.mcp.json`)
```json
{
  "supabase": "https://mcp.supabase.com/mcp?project_ref=eunhwmaeatzswebkuyzn&features=docs%2Caccount%2Cdatabase%2C..."
  "playwright": "npx @playwright/mcp@latest"
}
```

---

## 📋 SQLs aplicados (em ordem)

| Arquivo | Status | O que fez |
|---|---|---|
| `supabase/setup.sql` | ✅ aplicado | Schema inicial completo (15 tabelas, RLS, catálogos seed, trigger) |
| `supabase/setup-incremental-2.sql` | ✅ aplicado | Multi-coach (`coach_workspaces` N:N) + photos + bucket storage |
| `supabase/setup-incremental-3.sql` | ✅ aplicado | Fix recursão RLS (helpers SECURITY DEFINER) |
| `supabase/setup-incremental-4.sql` | ✅ aplicado | Limpa dados de teste + backfill Gustavo |
| `supabase/setup-incremental-5.sql` | ❌ não aplicado | (substituído por 7) |
| `supabase/setup-incremental-6.sql` | ❌ deu erro (faltava tabela) | (substituído por 7) |
| `supabase/setup-incremental-7.sql` | ❓ status incerto | `pending_coach_links` + helpers + promove `gustavs.silvs` |
| `supabase/setup-incremental-8.sql` | ❓ aplicado mas inútil | Troca pra `+coach` (rate limit é por projeto, não destrava) |
| `supabase/setup-incremental-9.sql` | ❓ status incerto | Troca pra `ogusttavs@gmail.com` |
| `supabase/setup-incremental-10.sql` | ✅ função existe | RPC `redeem_invite_code` atômica |

**Verificação rápida:** rode `curl -s -X POST "https://eunhwmaeatzswebkuyzn.supabase.co/rest/v1/rpc/redeem_invite_code" -H "apikey: sb_publishable_3ij28_W-UaUYL0diCY0HwA_qBo8tHe3" -H "Content-Type: application/json" -d '{"code":"X"}'` — deve retornar `"unauthenticated"` (significa que a função existe).

---

## 🐛 Tech debt aberto

| Item | Bloqueio | Prioridade |
|---|---|---|
| `database.types.ts` hand-rolled (12+ `as never` casts) | Precisa `npx supabase login` interativo | Alta — destrava tipo safety |
| `next.config.ts: typescript.ignoreBuildErrors: true` | Espera fix acima | Alta — junto com o anterior |
| `middleware.ts` deprecation warning (Next 16 sugere `proxy.ts`) | — | Baixa |
| 0 testes além de `RestTimer.test.ts` | — | Média (recomendar onboarding/coach redeem/logSet) |
| Coach edita exercícios/séries/refeições/variações | UI não existe | Média (botão "aplicar Modo Caverna" funciona, falta CRUD manual) |
| Pgtap RLS tests no CI | Precisa GitHub Actions setup | Alta (mitiga RISK-02) |
| Email rate limit Supabase free tier | Configurar Resend SMTP (5min) | Alta — bloqueia testes |

---

## 🔐 Contas / credenciais

| O quê | Valor |
|---|---|
| Email atleta Gustavo | `gustavosilva585@gmail.com` (perfil completo, plano ativo) |
| Email coach temp | `ogusttavs@gmail.com` (pre-vinculado em `pending_coach_links`, aguarda primeiro login) |
| Email atleta de teste extra | `gustavs.silvs@gmail.com` (sem dados — pode ser usado de teste atleta novo) |
| Email Vitor real | TBD — quando enviar, rodar `update pending_coach_links set coach_email='X' where coach_name like 'Vitor%'` |
| Supabase URL | `https://eunhwmaeatzswebkuyzn.supabase.co` |
| Supabase publishable key | `sb_publishable_3ij28_W-UaUYL0diCY0HwA_qBo8tHe3` (em `.env.local` + Vercel envs) |
| GitHub | https://github.com/ogusttavs/myfitness |
| Vercel | https://vercel.com/ogusttavs-projects/web |

---

## 📂 Documentos relevantes

- `CLAUDE.md` — briefing 30s
- `docs/STATUS.md` — snapshot done/pending (atualizar próxima sessão)
- `docs/ONBOARDING.md` — guia full pra agentes
- `docs/REVIEW.md` — review consolidado dos 3 agentes AIOX (QA + Architect + UX)
- `docs/SESSION-NOTES.md` — **este arquivo** (pickup point)
- `docs/spec/` — Spec Pipeline AIOX
- `docs/db/SCHEMA.md` — schema completo
- `docs/stories/` — stories de desenvolvimento

---

## 📋 Roadmap pra próxima sessão (sugestão)

### Sprint 1 (1 sessão)
1. Reload Claude Code → MCPs ativos
2. Verificar SQLs aplicados via Supabase MCP
3. Configurar Resend SMTP via Playwright MCP (dirigir Chrome)
4. Login coach end-to-end (testar fluxo completo)
5. Regenerar `database.types.ts` (npx supabase login + gen types)
6. Remover `as never` + `ignoreBuildErrors`

### Sprint 2 (1-2 sessões)
1. Coach UI completa: editar exercícios, séries, reps, descanso, ordem; cadastrar variações
2. Comparativo de fotos before/after
3. Migrar 100% dos stores Zustand pra Supabase (fonte de verdade no banco)
4. Web Push notifications (lembretes refeição, suplemento)

### Sprint 3+
1. Pgtap RLS tests no CI (GitHub Actions)
2. Multi-plano por atleta (cutting/bulking)
3. Renomear projeto Vercel pra `modo-caverna`
4. Custom domain
5. Testes unitários críticos

---

## ⚠️ Coisas a NÃO esquecer

- Vitor real (email) — substituir `ogusttavs@gmail.com` no `pending_coach_links` quando ele mandar
- Coach `ogusttavs@gmail.com` virou coach permanente pra teste; caso queira voltar pra atleta normal: `update profiles set role='athlete', full_name='' where id=(select id from auth.users where email='ogusttavs@gmail.com');`
- Os 30 exercícios + 18 alimentos do catálogo são `to authenticated` — só usuários logados leem (anon não vê)
- `.env.local` tem credenciais Supabase (não commitado, gitignored)
- Pasta `apps/mobile/` é legacy do pivot Expo — não usar

---

> Atualizar este arquivo a cada sessão grande.

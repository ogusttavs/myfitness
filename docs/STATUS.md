# Status — Modo Caverna

> Snapshot atualizado em **2026-04-26 (sessão 2)**. Atualize sempre que avançar/regredir.
>
> 📍 **Pickup point detalhado** da última sessão: [SESSION-NOTES.md](SESSION-NOTES.md)
> 📊 **Review AIOX** (QA+Arch+UX) com ações priorizadas: [REVIEW.md](REVIEW.md)

---

## 🌐 URLs

| O quê | URL |
|---|---|
| **Produção** | https://web-xi-neon-37.vercel.app |
| GitHub | https://github.com/ogusttavs/myfitness |
| Vercel | https://vercel.com/ogusttavs-projects/web |
| Supabase | https://supabase.com/dashboard/project/eunhwmaeatzswebkuyzn |
| Guia do Coach (PDF) | https://web-xi-neon-37.vercel.app/guia-coach |

---

## 👥 Contas

| Email | Papel | Status |
|---|---|---|
| `gustavosilva585@gmail.com` | Atleta (Gustavo Silva, 22a, 80kg, 175cm, Avançado) | ✅ Completo, dados do PDF aplicados |
| `gustavs.silvs@gmail.com` | Atleta de teste (sem dados) | ⚠️ Pode ser usado de teste |
| `ogusttavs@gmail.com` | Coach temp (Vitor Flavio TESTE) | ⏳ Pre-vinculado, aguardando primeiro login (bloqueado por rate limit) |
| TBD (Vitor real) | Coach do Gustavo | ⏳ Aguardando email real do Vitor |

---

## ✅ Done

### Spec & Documentação
- [x] AIOX Spec Pipeline completo (`docs/spec/`): requirements, complexity, research, spec.md, critique, implementation.yaml
- [x] Wireframes + tokens em `docs/ux/front-end-spec.md`
- [x] Schema banco em `docs/db/SCHEMA.md`
- [x] Onboarding pra agentes em `docs/ONBOARDING.md`
- [x] CLAUDE.md raiz com briefing 30s
- [x] README.md raiz com URL prod e quick start

### App (Next.js + Tailwind + shadcn)
- [x] Bootstrap Next.js 16 + TypeScript strict + Turbopack
- [x] Tema "Modo Caverna" (obsidian + ember) — paleta dark fixa
- [x] Fonts Inter / Bebas Neue / Space Grotesk via next/font
- [x] PWA manifest + apple-web-app meta (Add-to-Home no iPhone)
- [x] Bottom nav 5 tabs: Hoje · Treino · Dieta · Progresso · Perfil
- [x] Stack: TanStack Query + Zustand + lucide-react + class-variance-authority
- [x] shadcn/ui Button primitive
- [x] Sheet (bottom-modal) reutilizável
- [x] EmptyState + Skeleton + cn helper

### Funcionalidades
- [x] **Auth**: magic link via Supabase + middleware refresh + AuthGuard
- [x] **Onboarding** (`/onboarding`): formulário completo (nome, idade, peso, altura, nível, objetivo, frequência) com auto-redirect; OnboardingGuard força preenchimento
- [x] **Tela Hoje** (`/`): treino do dia, próxima refeição, 6 refeições com toggle, água (com botões +/-), suplementos do dia (Creatina, Vit D, Biotina, Minoxidil, Durateston quartas), macros consumidas vs alvo
- [x] **Tela Treino** (`/treino`): lista 5 dias com badges "hoje" e "feito"
- [x] **Tela Treino Dia** (`/treino/[code]`): iniciar/finalizar sessão com cronômetro de duração + volume kg ao vivo, registrar séries (carga + reps com steppers), timer de descanso integrado por exercício (auto-start ao confirmar série) com som + vibração + flash visual + contagem regressiva, modal de summary ao finalizar (duração, volume, séries)
- [x] **Tela Dieta** (`/dieta`): 6 refeições com macros consolidados, sheet de detalhe ao clicar com itens + kcal individuais + textarea de observação por dia (auto-save), checkbox lateral pra toggle rápido
- [x] **Tela Progresso** (`/progresso`): pesagem rápida com gráfico SVG + histórico, upload de fotos por ângulo (frente/lado/costas) com Supabase Storage signed URLs, galeria com filtro
- [x] **Tela Perfil** (`/perfil`): dados dinâmicos do banco, botão "editar" volta pra onboarding pré-preenchido, card de convite pro coach com geração de código 48h + share/copy, link pra relatórios, recomendações do PDF, logout
- [x] **Tela Relatórios** (`/relatorios`): 4 KPIs da semana (volume kg, refeições, água, sequência), gráfico volume por dia, detalhe diário, treinos recentes, observações de refeições recentes
- [x] **Painel Coach** (`/coach`): lista atletas vinculados com avatar inicial, redeem de invite code (6 chars)
- [x] **Painel Coach Atleta** (`/coach/[workspaceId]`): KPIs do atleta, status do plano (ativo/sem) com botão "aplicar Modo Caverna", treinos recentes, fotos
- [x] **Guia Coach** (`/guia-coach`): documento HTML printable em PDF com 8 seções (como entrar, painel, editar treino/dieta, boas práticas, segurança)

### Backend (Supabase)
- [x] Projeto Supabase em São Paulo
- [x] Auth com magic link configurado, Site URL + Redirect URLs
- [x] Schema completo (15 tabelas): profiles, workspaces, athlete_data, weight_logs, exercises_catalog, foods_catalog, supplements_catalog, workout_plans/days/exercises/sessions/set_logs, meal_plans/meals/items/logs, food_variations, water_logs, supplement_logs, progress_photos, coach_workspaces, pending_coach_links
- [x] RLS em TODAS as tabelas, com helpers SECURITY DEFINER pra evitar recursão (is_workspace_athlete, is_workspace_coach, is_workspace_member)
- [x] Bucket `progress-photos` privado com RLS
- [x] Catálogos seed: 30 exercícios + 18 alimentos + 5 suplementos do PDF
- [x] Trigger `handle_new_user`: cria profile + workspace, backfill Gustavo, processa pending_coach_links
- [x] Função `seed_modo_caverna_protocol(ws)`: clona protocolo do PDF (5 dias treino + 6 refeições) num workspace
- [x] Função `link_coach_by_emails(coach, athlete)`: link manual rápido
- [x] Backfill do Gustavo: profile + athlete_data com valores do PDF

### Deploy
- [x] Vercel projeto criado, GitHub conectado, auto-deploy via push
- [x] Root Directory: `apps/web` (config no painel)
- [x] Env vars NEXT_PUBLIC_SUPABASE_URL + ANON_KEY em production + development
- [x] Builds estáveis ~25-40s

### MCPs
- [x] Vercel MCP autorizado (read-only)
- [x] Supabase MCP adicionado em `.mcp.json` (precisa reload de sessão pra ativar tools)

---

## ⚠️ Bloqueado / em espera

| Item | Bloqueio | Solução |
|---|---|---|
| **Login coach** | Rate limit Supabase free tier (~3-4 emails/h global) | Esperar 30-60min OU configurar Resend SMTP (5min, 3000/dia free) |
| **Email real do Vitor Flavio** | Aguardando você passar | Quando chegar: SQL pra trocar `pending_coach_links.coach_email` |
| **Aplicar setup-incremental-9.sql** | Bloqueado pelo rate limit (não bloqueia o SQL em si — pode rodar agora se quiser) | Roda quando quiser (já tá no `supabase/setup-incremental-9.sql`) |

---

## 🛤️ Pendente / Próximos passos

### Curto prazo (próxima sessão)
1. **Configurar Resend SMTP** — destrava emails ilimitados (5min)
2. **Testar fluxo coach end-to-end** — login, ver atletas, aplicar Modo Caverna em atleta novo, edição
3. **Substituir email temp pelo email real do Vitor** quando chegar
4. **Renomear projeto Vercel** de `web` para `modo-caverna` (URL `modo-caverna.vercel.app`)

### Médio prazo (features que faltam)
1. **Coach edita planos** — atualmente coach só pode "aplicar Modo Caverna" (clone do PDF). Falta editar exercício individual, séries, reps, descanso, ordem; cadastrar variações de exercício e alimento; ajustar macros-alvo.
2. **Migrar Zustand → Supabase** — workoutSession, mealLog, wellness ainda usam localStorage. Migrar pra Supabase pra:
   - Compartilhar dados entre dispositivos do mesmo usuário
   - Coach ver registros em tempo real
   - Não perder dados ao limpar cache
3. **Snapshot de planos em sessões** — quando atleta inicia treino, gravar `plan_snapshot` JSONB pra manter histórico imutável mesmo se coach editar plano depois (CDD-06)
4. **Idempotency client_id** nas mutations de set_logs — necessário pra retry offline sem duplicar
5. **Notificações push** (Web Push API) — alertas pra refeições, suplementos, fim do treino
6. **Comparativo de fotos** before/after — escolher 2 datas e ver lado-a-lado

### Longo prazo / nice-to-have
- Multi-plano (cutting/bulking) por atleta
- Marketplace de protocolos
- IA pra sugerir progressão de carga
- Integração com Apple Health / Google Fit
- Modo light (atualmente só dark)
- App nativo via Capacitor (se PWA não bastar)

---

## 📦 Arquivos SQL pendentes de aplicação

Ordem cronológica (cada arquivo era a "próxima migration" no momento). Se você sumiu por uns dias e quer estar 100% atualizado, rode em ordem ignorando os que já aplicou:

| Arquivo | O que faz | Status estimado |
|---|---|---|
| `supabase/setup.sql` | Schema inicial completo | ✅ Aplicado |
| `supabase/setup-incremental-2.sql` | Multi-coach + photos + storage | ✅ Aplicado |
| `supabase/setup-incremental-3.sql` | Fix recursão RLS | ✅ Aplicado |
| `supabase/setup-incremental-4.sql` | Limpa testes + backfill Gustavo | ✅ Aplicado |
| `supabase/setup-incremental-5.sql` | pending_coach_links + helpers | ❌ Não aplicado (substituído pelo 7) |
| `supabase/setup-incremental-6.sql` | Promove gustavs.silvs como coach | ❌ Não aplicado (deu erro) |
| `supabase/setup-incremental-7.sql` | Versão auto-contida do 5+6 | ❓ Não confirmado |
| `supabase/setup-incremental-8.sql` | Troca pra +coach (não funcionou — rate limit é por projeto) | ❌ Aplicado mas sem efeito útil |
| `supabase/setup-incremental-9.sql` | Troca pra ogusttavs@gmail.com | ❓ Pendente / sem efeito por rate limit no login |

**Fonte de verdade:** o conteúdo das tabelas no Supabase. O SQL é só pra criar/atualizar.

---

## 🐛 Bugs conhecidos / tech debt

- **TypeScript types do Database**: `src/lib/supabase/database.types.ts` foi escrito à mão e não bate 100% com o shape esperado pelo supabase-js v2 (PostgrestVersion 12). Resultado: muitas mutations precisam `as never`. **Fix definitivo:** rodar `npx supabase gen types typescript --project-id eunhwmaeatzswebkuyzn` quando MCP estiver ativo.
- **next.config.ts** tem `typescript.ignoreBuildErrors: true` por causa do problema acima. Remover assim que types regenerados.
- **Middleware deprecation warning**: Next 16 sugere migrar `middleware.ts` → `proxy.ts`. Funciona mas warning a cada build.
- **Apenas Modo Caverna seed** disponível como template. Se quiser outros protocolos, criar funções SQL análogas (ex: `seed_cutting_intensivo_protocol(ws)`).

---

## 📊 Métricas

- **Stories Done:** 12
- **Páginas em produção:** 11 (`/`, `/login`, `/onboarding`, `/treino`, `/treino/[code]`, `/dieta`, `/progresso`, `/perfil`, `/relatorios`, `/coach`, `/coach/[ws]`, `/guia-coach`)
- **Tabelas no banco:** 17
- **Linhas de SQL aplicadas:** ~700
- **Linhas de código (apps/web):** ~3.500
- **Build time produção:** 25-40s
- **Bundle size First Load:** ~150kB (otimizado)

---

> Próxima atualização: depois do login do coach + Resend configurado + algumas iterações de UX.

---

## 🆕 Sessão 2 (2026-04-26 noite)

### O que foi feito

**Quality fixes do REVIEW.md:**
- ✅ `useAthleteProfile`: Promise.allSettled (falha parcial não derruba)
- ✅ `coach/[ws]` page: Promise.allSettled + helper `ok()` pra mapear errors
- ✅ `middleware.ts`: try/catch em `auth.getUser`
- ✅ `OnboardingForm`: `weight_logs` insert error tratado
- ✅ `useRedeemInvite`: nova RPC atômica `redeem_invite_code` (sem inconsistência)

**Microinterações UX P0+P1:**
- ✅ `src/lib/celebrate.ts`: emojis flutuantes 🔥💪⚡ + haptic + beep ao confirmar série
- ✅ ExerciseCard: série ativa com border-l-4 ember + bg + número pulsando + botão glow
- ✅ SessionBar: número volume com text-shadow glow + animação pop
- ✅ SessionSummary: confetti shower no abrir + haptic Heavy
- ✅ ProgressoClient: stagger reveal nas listas
- ✅ Tailwind: keyframes `pop` + `slideUp`

**CDD-06 parcial:**
- ✅ `src/features/execution/syncSession.ts` — Zustand → Supabase em background
- ✅ `workout_sessions.plan_snapshot` populado (best-effort)
- ✅ `set_logs` com `client_id` UUID (idempotência)
- ✅ `finished_at` marcado ao finalizar
- Coach já vê treinos em (quase) tempo real

**MCPs adicionados:**
- ✅ Supabase MCP em `.mcp.json` (precisa reload pra ativar tools)
- ✅ Playwright MCP em `.mcp.json` (precisa reload — vai dirigir Chrome real)

**Novos SQLs:**
- ✅ `setup-incremental-10.sql`: função `redeem_invite_code` atômica (verificada como existente)

**Documentação:**
- ✅ `docs/SESSION-NOTES.md` (novo) — pickup point completo
- ✅ `docs/REVIEW.md` (novo) — review consolidado dos 3 agentes AIOX
- ✅ `CLAUDE.md` aponta pra docs novos
- ✅ `docs/STATUS.md` atualizado (este arquivo)

### Bloqueios persistentes

- ⏳ Email rate limit Supabase (free tier ~3-4/h global) — login do coach travado. Solução: configurar Resend SMTP (5min)
- ⏳ Email real do Vitor Flavio
- ⏳ Regenerar `database.types.ts` precisa de `npx supabase login` interativo

### O que fazer ao reiniciar Claude Code

1. Verificar Supabase + Playwright MCPs carregados
2. Configurar Resend SMTP via Playwright (dirigir Chrome)
3. Login coach end-to-end
4. Regenerar types Supabase + remover `as never` casts

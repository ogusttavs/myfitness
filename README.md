# Modo Caverna — Monorepo

App **web** (Next.js + Vercel) para gestão de treino e dieta segundo o protocolo "Modo Caverna" (hipertrofia + recomposição corporal). Atleta executa, coach edita o plano e cadastra variações.

## Estrutura

```
apps/
  web/              # Next.js 15 + TypeScript + Tailwind + shadcn (ATIVO)
  mobile/           # Expo (legacy — mantido como referência, não usar)
supabase/           # migrations + seeds + RLS tests (a criar)
docs/
  spec/             # AIOX Spec Pipeline
  ux/               # front-end-spec.md
  db/               # SCHEMA.md
  stories/          # stories de desenvolvimento
.aiox-core/         # framework AIOX (não modificar)
.claude/            # configuração Claude Code
protocoloGustavo_modo_caverna.pdf  # documento-fonte (seed canônico)
```

## Quick start

```bash
cd apps/web
npm install
cp .env.example .env.local   # preencher Supabase
npm run dev                  # http://localhost:3000
```

Para "instalar" no iPhone (depois do deploy):
1. Abre a URL no Safari
2. Compartilhar → Adicionar à Tela de Início
3. Vira ícone "Caverna" como app normal

## Deploy (Vercel)

```bash
# uma vez:
npx vercel link

# a cada push:
git push    # Vercel deploya automaticamente

# manual:
npx vercel --prod
```

Configurar `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` no dashboard da Vercel (Settings → Environment Variables).

## Stack

| Camada | Tecnologia |
|---|---|
| App | **Next.js 15 App Router** + TypeScript strict |
| Styling | Tailwind + shadcn/ui + tokens "Modo Caverna" (dark) |
| State | Zustand + TanStack Query v5 (offline persister via localStorage) |
| Backend | Supabase (Postgres + Auth + Storage + RLS) |
| Hosting | **Vercel** (CI/CD automático no push) |
| PWA | manifest + apple-web-app meta para Add-to-Home |

## Paleta Modo Caverna

| Token | Hex | Uso |
|---|---|---|
| `obsidian` | `#0A0A0B` | bg base |
| `cave` | `#141416` | cards |
| `ember` | `#FF6B1A` | CTA / PR / timer ativo |
| `bone` | `#F5F5F4` | texto primário |
| `moss` | `#4ADE80` | série completada |

## Documentação principal

- **Visão e escopo:** [docs/spec/spec.md](docs/spec/spec.md)
- **Decisões técnicas:** [docs/spec/complexity.json](docs/spec/complexity.json)
- **Wireframes:** [docs/ux/front-end-spec.md](docs/ux/front-end-spec.md)
- **Schema do DB:** [docs/db/SCHEMA.md](docs/db/SCHEMA.md)
- **Backlog:** [docs/stories/INDEX.md](docs/stories/INDEX.md)

## Notas de pivot (2026-04-26)

Pivotamos de Expo (mobile nativo) para Next.js (web + PWA) por simplicidade de distribuição:
- Sem App Store / sem $99 Apple Developer
- Coach instala via URL (Add to Home Screen no iPhone)
- Deploy Vercel = `git push`
- Timer engine portada sem alterações (TS puro)
- Trade-off aceito: sem vibração no iOS Safari (substituída por som + flash visual)

# Modo Caverna — Web

Next.js 15 App Router + TypeScript + Tailwind + shadcn/ui + Supabase.

## Setup

```bash
cd apps/web
npm install
cp .env.example .env.local   # preencher Supabase
npm run dev                  # http://localhost:3000
```

## Scripts

- `dev` — Next dev server (http://localhost:3000)
- `build` — produção
- `start` — start prod
- `lint` — eslint
- `typecheck` — tsc --noEmit
- `test` — vitest

## Deploy (Vercel)

1. Push pro GitHub
2. Vercel → New Project → import repo → escolhe `apps/web` como root
3. Configura env vars `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy. URL pública sai em ~30s. Manda pro coach.

PWA: já configurado (`/manifest.webmanifest` + meta apple-web-app). No iPhone, Safari → Compartilhar → Adicionar à Tela de Início.

## Estrutura

```
app/                  # rotas (App Router)
  layout.tsx          # raiz com fonts + theme dark
  page.tsx            # /
  timer-demo/page.tsx # /timer-demo
components/ui/        # shadcn primitives
src/
  components/         # custom (RestTimerRing)
  lib/
    timer/            # engine pura + hook + tests
    supabase/         # browser + server clients
    cn.ts, idempotency.ts
  theme/              # tokens Modo Caverna
```

## Refs
- Specs: `../../docs/spec/`
- Wireframes: `../../docs/ux/front-end-spec.md`
- Schema: `../../docs/db/SCHEMA.md`

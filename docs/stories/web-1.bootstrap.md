# Story WEB-1 — Bootstrap Next.js + Tailwind + shadcn (pivot)

**Status:** Done
**Owner:** @dev

## Goal
Migrar de Expo para Next.js 15 (App Router) + Tailwind + shadcn/ui, mantendo paleta Modo Caverna e timer engine.

## Acceptance Criteria
- [x] `apps/web/` com Next.js 15 + TS strict + path aliases (`@/*`, `@app/*`, `@ui/*`)
- [x] Tailwind config com paleta Modo Caverna mapeada (obsidian, cave, ember, etc.)
- [x] Fonts Inter + Bebas Neue + Space Grotesk via `next/font/google`
- [x] PWA manifest + apple-web-app meta (Add to Home Screen no iOS)
- [x] shadcn `Button` primitive criado em `components/ui/`
- [x] Tela inicial `/` com "CAVERNA" + CTA ember
- [x] Tela `/timer-demo` com `RestTimerRing` + Wake Lock + WebAudio beep
- [x] Supabase clients (browser + server SSR via `@supabase/ssr`)
- [x] Vitest configurado para rodar tests do timer engine

## File List
- apps/web/package.json
- apps/web/tsconfig.json
- apps/web/next.config.ts
- apps/web/tailwind.config.ts
- apps/web/postcss.config.mjs
- apps/web/vitest.config.ts
- apps/web/.eslintrc.json
- apps/web/app/layout.tsx
- apps/web/app/page.tsx
- apps/web/app/globals.css
- apps/web/app/timer-demo/page.tsx
- apps/web/components/ui/button.tsx
- apps/web/src/components/RestTimerRing.tsx
- apps/web/src/lib/cn.ts
- apps/web/src/lib/idempotency.ts
- apps/web/src/lib/timer/RestTimer.ts (portado de mobile, sem mudanças)
- apps/web/src/lib/timer/RestTimer.test.ts (portado, roda via vitest com globals)
- apps/web/src/lib/timer/useTimer.ts (portado)
- apps/web/src/lib/supabase/client.ts (createBrowserClient)
- apps/web/src/lib/supabase/server.ts (createServerClient com cookies)
- apps/web/src/lib/supabase/database.types.ts (mesmos tipos)
- apps/web/src/theme/tokens.ts
- apps/web/public/manifest.webmanifest
- apps/web/public/icon.svg
- apps/web/.env.example
- apps/web/.gitignore
- apps/web/README.md
- vercel.json (root config)

## Dev Notes
- Timer engine **não mudou 1 linha** — TS puro, scheduler injetável, drift-free.
- Vitest auto-globals expõem `describe/test/expect` igual ao jest; nenhum import necessário.
- `useTimer` também portado direto — usa só `useState/useRef/useEffect`, nenhum RN-specific.
- Som ao zerar via WebAudio API (3 beeps senoidais) — não exige asset.
- Wake Lock API liga `screen` para manter tela acesa durante o descanso.
- iOS Safari NÃO suporta `navigator.vibrate` — feedback fica como som + animação visual (`animate-pulseTimer`) + cor moss ao zerar.
- shadcn Button criado direto (sem rodar CLI) — apenas o primitive necessário pro MVP.

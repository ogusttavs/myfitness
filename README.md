# Modo Caverna

App **web mobile-first** para gestão de treino e dieta segundo o protocolo "Modo Caverna" (hipertrofia + recomposição corporal). Atleta executa, coach edita o plano (futuro).

> **🌐 Produção:** https://web-xi-neon-37.vercel.app
> **📚 Para agentes / contribuidores:** leia [`docs/ONBOARDING.md`](docs/ONBOARDING.md) **antes de qualquer mudança**.

---

## Quick start

```bash
git clone https://github.com/ogusttavs/myfitness
cd myfitness/apps/web
npm install
npm run dev               # http://localhost:3000
```

## Instalar no iPhone como app

1. Abrir https://web-xi-neon-37.vercel.app no Safari
2. Compartilhar → "Adicionar à Tela de Início"
3. Vira ícone "Caverna" — abre fullscreen como app

## Stack

| Camada | Tecnologia |
|---|---|
| App | Next.js 15 App Router + TypeScript strict |
| Styling | Tailwind 3 + shadcn/ui + tema "Modo Caverna" (dark fixo) |
| State | Zustand 5 + persist localStorage |
| Hosting | Vercel |
| Repo | https://github.com/ogusttavs/myfitness |

> **Banco:** ainda não. Tudo em localStorage por dispositivo. Próximo passo: Supabase.

## Estrutura

```
apps/web/         ← APP ATIVO (Next.js)
apps/mobile/      ← legacy Expo (não usar)
docs/
  ONBOARDING.md   ← guia para agentes/devs
  spec/           ← Spec Pipeline AIOX
  ux/             ← wireframes + design tokens
  db/SCHEMA.md    ← schema Supabase planejado
  stories/        ← stories de desenvolvimento
.aiox-core/       ← framework AIOX
.claude/          ← config Claude Code
protocoloGustavo_modo_caverna.pdf   ← fonte canônica
```

## Comandos

```bash
cd apps/web
npm run dev          # dev local
npm run build        # validar build prod
npm run typecheck
npm run lint
npm test             # vitest

vercel --prod --yes  # deploy produção
```

## Paleta Modo Caverna

| Token | Hex | Uso |
|---|---|---|
| `obsidian` | `#0A0A0B` | bg base |
| `cave` | `#141416` | cards |
| `ember` | `#FF6B1A` | accent (CTA, PR, timer ativo) |
| `bone` | `#F5F5F4` | texto primário |
| `moss` | `#4ADE80` | sucesso, série feita |

## Documentação principal

- **Briefing rápido (Claude):** [CLAUDE.md](CLAUDE.md)
- **Onboarding completo:** [docs/ONBOARDING.md](docs/ONBOARDING.md)
- **Visão e escopo:** [docs/spec/spec.md](docs/spec/spec.md)
- **Decisões técnicas:** [docs/spec/complexity.json](docs/spec/complexity.json)
- **Wireframes:** [docs/ux/front-end-spec.md](docs/ux/front-end-spec.md)
- **Schema do DB:** [docs/db/SCHEMA.md](docs/db/SCHEMA.md)
- **Backlog:** [docs/stories/INDEX.md](docs/stories/INDEX.md)

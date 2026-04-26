# Modo Caverna — Mobile

Expo + React Native + TypeScript app.

## Setup

```bash
npm install
cp .env.example .env  # preencher com credenciais Supabase
npm run ios        # ou: npm run android
```

## Scripts

- `start` — Expo dev server
- `ios` / `android` — abre simulador
- `lint` — eslint
- `typecheck` — tsc --noEmit
- `test` — jest

## Stack

- Expo SDK 54 + React Native 0.81 + TS strict
- expo-router (file-based routing)
- NativeWind v4 (Tailwind RN)
- Zustand + TanStack Query (offline-first via MMKV persister)
- Supabase (auth + db + storage)

## Estrutura

```
app/                  # rotas (expo-router)
src/
  theme/              # tokens Modo Caverna
  components/         # design system
  features/           # bounded contexts
  lib/                # supabase, timer, storage
  stores/             # zustand
  queries/            # TanStack Query hooks
```

Refs: `../../docs/spec/spec.md`

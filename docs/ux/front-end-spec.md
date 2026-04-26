# Front-End Spec — Modo Caverna

> Owner: @ux-design-expert (Uma)
> Refs: spec.md, complexity.json, research.json (R-04, R-06)

---

## 1. Princípios de design

1. **Fricção zero no treino** — registrar série em <8s, máximo 2 taps por interação principal. (R-06)
2. **Um foco por tela** — não competir por atenção; números grandes mandam.
3. **Dark caverna, ember vivo** — preto é silêncio; ember (`#FF6B1A`) só em CTA, PR e timer ativo.
4. **Tipografia hierárquica** — Bebas Neue para números (peso, reps, timer); Inter para tudo o resto.
5. **Toque generoso** — touch targets ≥56pt nas telas de execução (mãos suadas/luvas).
6. **Instagrammável** — composições limpas, contraste alto, cards 1:1 prontos pra screenshot.

---

## 2. Design tokens

```ts
export const tokens = {
  color: {
    bg: { obsidian: '#0A0A0B', cave: '#141416', elevated: '#1C1C1F' },
    border: { smoke: '#2A2A2E' },
    text: { bone: '#F5F5F4', ash: '#A1A1AA', mute: '#6B6B70' },
    accent: { ember: '#FF6B1A', glow: '#FFB084' },
    state: { moss: '#4ADE80', amber: '#FBBF24', blood: '#EF4444' },
  },
  font: {
    sans: 'Inter',
    display: 'BebasNeue',  // números do timer e peso
    mono: 'SpaceGrotesk',
  },
  fontSize: {
    xs: 12, sm: 14, base: 16, lg: 18, xl: 24, '2xl': 32, '3xl': 48, timer: 96,
  },
  radius: { sm: 8, md: 12, lg: 16, xl: 20, full: 9999 },
  spacing: [0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 96],
  shadow: { glow: '0 0 32px rgba(255, 107, 26, 0.35)' },
  motion: { fast: 150, base: 240, slow: 400 },
};
```

---

## 3. Mapa de navegação

```
(auth)/
  login          → email + magic link
  redeem-code    → coach insere código

(tabs)/
  hoje           ← landing pós-login
  treino         → plano semanal + dia atual
  dieta          → 6 refeições + macros
  progresso      → fotos + gráficos
  perfil         → dados, coach, settings

workout/[sessionId]   → tela de execução fullscreen (sem tab bar)
photos/upload         → câmera/galeria
photos/compare        → before/after
```

---

## 4. Wireframes ASCII

### 4.1 Tela "Hoje" (landing)

```
┌─────────────────────────────┐
│  HOJE        Sex 26 Abr     │  ← header com data
│                             │
│  ┌───────────────────────┐  │
│  │ TREINO DE HOJE        │  │  ← card hero ember-glow
│  │ DIA 1 — PUSH          │  │
│  │ 6 exercícios · 60 min │  │
│  │ ▶ INICIAR             │  │  ← CTA ember
│  └───────────────────────┘  │
│                             │
│  ALIMENTAÇÃO (3/6)          │
│  ┌──────┬──────┬──────┐     │
│  │ 07h  │ 10h  │ 13h  │     │  ← refeições do dia
│  │ ✓    │ ✓    │ ✓    │     │
│  └──────┴──────┴──────┘     │
│  ┌──────┬──────┬──────┐     │
│  │ 16h  │ 19h  │ 22h  │     │
│  │ ○    │ ○    │ ○    │     │
│  └──────┴──────┴──────┘     │
│                             │
│  RESUMO                     │
│  ┌───────────────────────┐  │
│  │ Macros 1230/1800 kcal │  │
│  │ ████████░░ 68%        │  │
│  └───────────────────────┘  │
└─────────────────────────────┘
[Hoje] Treino  Dieta  Prog  Perfil
```

### 4.2 Tela de execução (CORE — EPIC-5)

```
┌─────────────────────────────┐
│ ← PUSH · Dia 1     12:34    │
│                             │
│ 1/6 · SUPINO RETO           │  ← exercício atual
│ Última: 60kg × 10 (2d atrás)│  ← histórico inline
│                             │
│  ┌─────────────────────┐    │
│  │ SÉRIE 1 ✓ 60kg × 10 │    │  ← série completa (moss)
│  └─────────────────────┘    │
│  ┌─────────────────────┐    │
│  │ SÉRIE 2  [ATUAL]    │    │  ← ember pulse
│  │                     │    │
│  │   PESO     REPS     │    │
│  │  ┌─────┐  ┌─────┐   │    │
│  │  │ 60  │  │ 10  │   │    │  ← Bebas Neue 48pt
│  │  └─────┘  └─────┘   │    │
│  │   kg                │    │
│  │  − +     − +        │    │  ← steppers gigantes
│  │                     │    │
│  │  RPE: ○○○○●○○○○○    │    │  ← opcional
│  │                     │    │
│  │  [ CONFIRMAR SÉRIE ]│    │  ← CTA ember
│  └─────────────────────┘    │
│  ┌─────────────────────┐    │
│  │ SÉRIE 3  pending    │    │
│  └─────────────────────┘    │
│                             │
│ Variação ▾  ⓘ Notas         │
└─────────────────────────────┘
```

### 4.3 Cronômetro de descanso (overlay sheet)

```
┌─────────────────────────────┐
│         DESCANSO            │
│                             │
│         ╭─────╮             │
│        ╱       ╲            │
│       │   90    │           │  ← Bebas Neue 96pt
│       │   ──    │           │
│       │   90s   │           │
│        ╲       ╱            │
│         ╰─────╯             │  ← ring animado ember
│                             │
│   −15s    [II]    +15s     │  ← controles 64pt
│                             │
│         [ PULAR ]           │  ← skip ash
│                             │
│  Próxima: SUPINO série 3    │
└─────────────────────────────┘
```

Animação:
- Ring drena ember → glow ao chegar em 5s.
- Última volta: pulse 1Hz no número.
- Em t=0: haptic Heavy + som; ring vira moss; auto-fecha em 1s.

### 4.4 Plano de Dieta

```
┌─────────────────────────────┐
│ DIETA       1800 kcal/dia   │
│                             │
│ P 160g · C 215g · G 67g     │  ← chips de macro
│                             │
│ 1. CAFÉ DA MANHÃ ─────────  │
│  ○ 3 ovos mexidos           │
│  ○ 2 fatias pão integral    │
│  ○ 1 fruta (banana ou maçã) │  ← variações no tap
│  ○ Café sem açúcar          │
│  [ MARCAR REFEIÇÃO ✓ ]      │
│                             │
│ 2. LANCHE ─────────────────  │
│  ○ 170g iogurte grego       │
│  ○ 25g aveia                │
│  ○ 1 fruta pequena          │
│  [ MARCAR REFEIÇÃO ✓ ]      │
│ ...                         │
└─────────────────────────────┘
```

Coach (mesma tela com modo edição):
- Tap longo no item → bottom sheet "Editar" / "Adicionar variação" / "Remover".
- Header mostra badge `MODO COACH` ember-outline.

### 4.5 Plano de Treino

```
┌─────────────────────────────┐
│ TREINO       5x/semana      │
│                             │
│ ┌──────────┐ ┌──────────┐   │
│ │ DIA 1    │ │ DIA 2    │   │  ← cards 2 col
│ │ PUSH     │ │ PULL     │   │
│ │ 6 exerc. │ │ 6 exerc. │   │
│ │ ─        │ │ ─        │   │
│ │ ▶        │ │ ▶        │   │
│ └──────────┘ └──────────┘   │
│ ┌──────────┐ ┌──────────┐   │
│ │ DIA 3    │ │ DIA 4    │   │
│ │ LEGS     │ │ UPPER    │   │
│ │ ...      │ │ ...      │   │
│ └──────────┘ └──────────┘   │
│ ┌──────────┐                │
│ │ DIA 5    │                │
│ │ LOWER    │                │
│ └──────────┘                │
└─────────────────────────────┘
```

### 4.6 Progresso — fotos

```
┌─────────────────────────────┐
│ PROGRESSO      [+ FOTO]     │
│                             │
│ Frente · Costas · Lado      │  ← chip filter
│                             │
│ ┌─────┐ ┌─────┐ ┌─────┐    │
│ │ Abr │ │ Mar │ │ Fev │    │  ← grid 3 col
│ │ 80kg│ │ 82kg│ │ 84kg│    │
│ └─────┘ └─────┘ └─────┘    │
│                             │
│ [ COMPARAR DUAS DATAS ]     │  ← CTA
│                             │
│ EVOLUÇÃO DE PESO            │
│   80 ─                      │
│   82 ─\                     │  ← gráfico
│   84 ─ \___                 │
│        ┴────                │
└─────────────────────────────┘
```

---

## 5. Componentes do design system (primitives)

| Componente | Notas |
|---|---|
| `Button` | variant: primary (ember bg), secondary (smoke border), ghost. Min height 56pt. |
| `Stepper` | botões grandes − +, long-press accelera. Display Bebas Neue. |
| `Card` | bg cave, border smoke 1px, radius lg. |
| `Sheet` | bottom modal blurry. expo-blur |
| `Heading` | h1 32 / h2 24 / h3 18, Inter semibold |
| `Display` | números grandes Bebas Neue |
| `Chip` | macros, filtros — radius full |
| `RingTimer` | SVG ring animado Reanimated |
| `SetCard` | 3 estados: pending (ash), current (ember pulse), done (moss check) |

---

## 6. Microinterações chave

- **Confirmar série:** haptic Light + card vira moss (240ms cross-fade) + scroll-into-view da próxima série + sheet do timer slide-up (Reanimated spring).
- **Timer zero:** haptic Heavy x3 + som 'timer-end.wav' + ring vira moss + auto-dismiss em 1s.
- **PR bagde:** confetti ember-glow no card + push haptic + texto "NOVO PR".
- **Coach editou:** badge "atualizado" ember-outline no item por 24h.

---

## 7. Acessibilidade

- Touch targets ≥56pt em telas de execução; ≥44pt no resto.
- Contraste: ember sobre obsidian = 4.7:1 (AA passa).
- Suporte a Dynamic Type via NativeWind text scaling — testar até `xxxLarge`.
- Voice-over: labels descritivos em todos os botões; números do timer falados a cada 10s no último 30s.

---

## 8. Telas que precisam de mockup hi-fi (handoff Figma — futuro)

1. Hoje (landing)
2. Execução de treino (estado: série em andamento + sheet do timer)
3. Comparativo de fotos before/after
4. Dashboard do coach

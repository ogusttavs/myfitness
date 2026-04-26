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
    display: 'BebasNeue',
    mono: 'SpaceGrotesk',
  },
  fontSize: {
    xs: 12, sm: 14, base: 16, lg: 18, xl: 24, '2xl': 32, '3xl': 48, timer: 96,
  },
  radius: { sm: 8, md: 12, lg: 16, xl: 20, full: 9999 },
  spacing: [0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 96] as const,
  motion: { fast: 150, base: 240, slow: 400 },
} as const;

export type Tokens = typeof tokens;

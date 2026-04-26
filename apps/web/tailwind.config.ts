import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Modo Caverna palette
        obsidian: '#0A0A0B',
        cave: '#141416',
        elevated: '#1C1C1F',
        smoke: '#2A2A2E',
        bone: '#F5F5F4',
        ash: '#A1A1AA',
        mute: '#6B6B70',
        ember: {
          DEFAULT: '#FF6B1A',
          glow: '#FFB084',
        },
        moss: '#4ADE80',
        amberx: '#FBBF24',
        blood: '#EF4444',
        // shadcn semantic mappings (todos apontam pros tokens caverna)
        background: '#0A0A0B',
        foreground: '#F5F5F4',
        card: '#141416',
        'card-foreground': '#F5F5F4',
        popover: '#1C1C1F',
        'popover-foreground': '#F5F5F4',
        primary: '#FF6B1A',
        'primary-foreground': '#0A0A0B',
        secondary: '#1C1C1F',
        'secondary-foreground': '#F5F5F4',
        muted: '#1C1C1F',
        'muted-foreground': '#A1A1AA',
        accent: '#1C1C1F',
        'accent-foreground': '#F5F5F4',
        destructive: '#EF4444',
        'destructive-foreground': '#F5F5F4',
        border: '#2A2A2E',
        input: '#2A2A2E',
        ring: '#FF6B1A',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-bebas)', 'Impact', 'sans-serif'],
        mono: ['var(--font-grotesk)', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        timer: ['96px', { lineHeight: '1', letterSpacing: '-0.02em' }],
      },
      borderRadius: {
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '20px',
      },
      keyframes: {
        pulseTimer: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.06)' },
        },
        pop: {
          '0%': { transform: 'scale(1)' },
          '40%': { transform: 'scale(1.18)' },
          '100%': { transform: 'scale(1)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        pulseTimer: 'pulseTimer 1s ease-in-out infinite',
        pop: 'pop 300ms ease-out',
        slideUp: 'slideUp 250ms ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;

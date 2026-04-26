/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        obsidian: '#0A0A0B',
        cave: '#141416',
        elevated: '#1C1C1F',
        smoke: '#2A2A2E',
        bone: '#F5F5F4',
        ash: '#A1A1AA',
        mute: '#6B6B70',
        ember: '#FF6B1A',
        glow: '#FFB084',
        moss: '#4ADE80',
        amber: '#FBBF24',
        blood: '#EF4444',
      },
      fontFamily: {
        sans: ['Inter'],
        display: ['BebasNeue'],
        mono: ['SpaceGrotesk'],
      },
      fontSize: {
        timer: '96px',
      },
    },
  },
  plugins: [],
};

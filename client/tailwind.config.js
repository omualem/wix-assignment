/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './**/*.{js,jsx,ts,tsx,html}'
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        surface: {
          50: 'rgba(255,255,255,0.03)',
          100: 'rgba(255,255,255,0.06)',
          200: 'rgba(255,255,255,0.09)',
          300: 'rgba(255,255,255,0.12)',
        },
        accent: {
          DEFAULT: '#818cf8',
          light: '#a5b4fc',
          dark: '#6366f1',
          glow: 'rgba(129,140,248,0.25)',
        },
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.25rem',
      },
      boxShadow: {
        glass: '0 8px 32px rgba(0,0,0,0.3)',
        'glass-sm': '0 4px 16px rgba(0,0,0,0.2)',
        glow: '0 0 20px rgba(129,140,248,0.3)',
        'glow-lg': '0 0 40px rgba(129,140,248,0.2)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: 0, transform: 'translateY(-8px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: 0, transform: 'scale(0.95)' },
          '100%': { opacity: 1, transform: 'scale(1)' },
        },
        'slide-right': {
          '0%': { opacity: 0, transform: 'translateX(20px)' },
          '100%': { opacity: 1, transform: 'translateX(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 15px rgba(129,140,248,0.3)' },
          '50%': { boxShadow: '0 0 30px rgba(129,140,248,0.5)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out',
        'scale-in': 'scale-in 0.2s ease-out',
        'slide-right': 'slide-right 0.3s ease-out',
        shimmer: 'shimmer 2s infinite linear',
        'pulse-glow': 'pulse-glow 2s infinite ease-in-out',
      },
    },
  },
  plugins: [],
};

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"IBM Plex Sans Arabic"', '"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"Inter"', 'monospace'],
      },
      colors: {
        primary: {
          50: '#ecfdf5', 100: '#d1fae5', 200: '#a7f3d0', 300: '#6ee7b7', 400: '#34d399',
          500: '#10b981', 600: '#059669', 700: '#047857', 800: '#065f46', 900: '#064e3b', 950: '#022c22',
        },
        accent: {
          50: '#fffbeb', 100: '#fef3c7', 200: '#fde68a', 300: '#fcd34d', 400: '#fbbf24',
          500: '#d4a72c', 600: '#b8891c', 700: '#946c12', 800: '#765514', 900: '#624713',
        },
        success: {
          50: '#f0fdf4', 100: '#dcfce7', 200: '#bbf7d0', 300: '#86efac', 400: '#4ade80',
          500: '#22c55e', 600: '#16a34a', 700: '#15803d', 800: '#166534', 900: '#14532d',
        },
        warning: {
          50: '#fffbeb', 100: '#fef3c7', 200: '#fde68a', 300: '#fcd34d', 400: '#fbbf24',
          500: '#f59e0b', 600: '#d97706', 700: '#b45309', 800: '#92400e', 900: '#78350f',
        },
        danger: {
          50: '#fef2f2', 100: '#fee2e2', 200: '#fecaca', 300: '#fca5a5', 400: '#f87171',
          500: '#ef4444', 600: '#dc2626', 700: '#b91c1c', 800: '#991b1b', 900: '#7f1d1d',
        },
        ink: {
          50: '#f7f8f3', 100: '#e8ece7', 200: '#d5ddd7', 300: '#bdc9c1', 400: '#8a9a91',
          500: '#617168', 600: '#46574e', 700: '#33453d', 800: '#22352d', 900: '#14251f', 950: '#091710',
        },
      },
      boxShadow: {
        card: '0 12px 34px rgb(20 37 31 / .055), 0 2px 8px rgb(20 37 31 / .035)',
        'card-hover': '0 20px 48px rgb(20 37 31 / .10), 0 6px 16px rgb(20 37 31 / .055)',
        elevated: '0 28px 80px rgb(20 37 31 / .14), 0 8px 24px rgb(20 37 31 / .07)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out', 'slide-up': 'slideUp 0.4s ease-out', 'slide-in': 'slideIn 0.3s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite', 'shimmer': 'shimmer 1.5s linear infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(8px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        slideIn: { '0%': { opacity: '0', transform: 'translateX(-8px)' }, '100%': { opacity: '1', transform: 'translateX(0)' } },
        pulseSoft: { '0%, 100%': { opacity: '1' }, '50%': { opacity: '0.7' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
      },
    },
  },
  plugins: [],
};
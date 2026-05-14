/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        arete: {
          bg:      '#0C0A08',
          surface: '#13110E',
          border:  '#2A2520',
          gold:    '#C9A84C',
          bronze:  '#8B7355',
          text:    '#E8E0D0',
          muted:   '#6B5F4E',
          faint:   '#3D3428',
          danger:  '#8B3A3A',
          success: '#4A6741',
          divider: '#1E1A15',
        },
      },
      fontFamily: {
        cormorant: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        garamond:  ['"EB Garamond"', 'Georgia', 'serif'],
        cinzel:    ['Cinzel', 'Georgia', 'serif'],
        mono:      ['"JetBrains Mono"', 'monospace'],
      },
      animation: {
        'dash-rotate': 'dashRotate 6s linear infinite',
        'fade-in':     'fadeIn 0.4s ease forwards',
        'saved':       'savedPulse 2s ease forwards',
      },
      keyframes: {
        dashRotate: {
          from: { transform: 'rotate(0deg)' },
          to:   { transform: 'rotate(360deg)' },
        },
        fadeIn: {
          from: { opacity: 0 },
          to:   { opacity: 1 },
        },
        savedPulse: {
          '0%':   { opacity: 0 },
          '15%':  { opacity: 1 },
          '70%':  { opacity: 1 },
          '100%': { opacity: 0 },
        },
      },
    },
  },
  plugins: [],
}

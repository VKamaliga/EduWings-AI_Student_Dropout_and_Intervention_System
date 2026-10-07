/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#FAF5FF',
          100: '#F3E8FF',
          200: '#E9D5FF',
          300: '#D8B4FE',
          400: '#C084FC',
          500: '#A855F7',
          600: '#9333EA',
          700: '#7E22CE',
          800: '#6B21A8',
          900: '#581C87',
          primary: '#7C3AED',
          accent: '#EC4899',
        },
        risk: {
          low: '#34D399',       // Mint / sage green
          'low-bg': 'rgba(52, 211, 153, 0.14)',
          'low-border': 'rgba(52, 211, 153, 0.35)',
          medium: '#FBBF24',    // Peach / amber
          'medium-bg': 'rgba(251, 191, 36, 0.14)',
          'medium-border': 'rgba(251, 191, 36, 0.35)',
          high: '#EC4899',      // Pink / magenta
          'high-bg': 'rgba(236, 72, 153, 0.16)',
          'high-border': 'rgba(236, 72, 153, 0.4)',
        },
        dark: {
          bg: '#0D0822',
          surface: '#150E33',
          'surface-hover': '#1C1344',
          card: 'rgba(26, 16, 60, 0.65)',
          border: 'rgba(168, 85, 247, 0.22)',
          'border-subtle': 'rgba(255, 255, 255, 0.08)',
        },
        light: {
          bg: '#F9F8FD',
          surface: '#FFFFFF',
          'surface-hover': '#F5F3FF',
          card: '#FFFFFF',
          border: '#E8E4F8',
          'border-subtle': '#F0EDFD',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(15, 10, 36, 0.37)',
        'glass-glow': '0 0 25px -5px rgba(168, 85, 247, 0.25)',
        'card-light': '0 4px 20px -2px rgba(124, 58, 237, 0.06)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};

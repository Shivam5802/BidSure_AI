import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './features/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#F0F5FF',
          100: '#E0EBFF',
          200: '#C7D9FE',
          300: '#A4C0FD',
          400: '#759EFA',
          500: '#4876F6',
          600: '#2554EB',
          700: '#1D3FD8',
          800: '#1E35AF',
          900: '#0F1E54',
          950: '#0A1233',
        },
        gov: {
          navy: '#123B63',
          deepNavy: '#082B4C',
          primaryBlue: '#1464B4',
          accentBlue: '#2B78C5',
          bg: '#F3F8FC',
          border: '#D9E3EC',
          text: '#17324D',
          muted: '#52677A',
          success: '#238B57',
          warning: '#C98200',
          error: '#B83232',
          slate: '#1C2541',
          steel: '#3A506B',
          light: '#F8FAFC',
        },
        compliance: {
          valid: '#238B57',
          warning: '#C98200',
          error: '#B83232',
          info: '#1464B4',
        },
      },
      fontFamily: {
        sans: [
          'var(--font-inter)',
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
        serif: [
          'var(--font-merriweather)',
          'Merriweather',
          'Source Serif 4',
          'Georgia',
          'serif',
        ],
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;

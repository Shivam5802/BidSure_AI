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
          navy: '#0B132B',
          slate: '#1C2541',
          steel: '#3A506B',
          light: '#F8FAFC',
          border: '#E2E8F0',
        },
        compliance: {
          valid: '#059669',
          warning: '#D97706',
          error: '#DC2626',
          info: '#2563EB',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;

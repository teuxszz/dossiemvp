/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: 'var(--bg-primary)',
          secondary: 'var(--bg-secondary)',
          tertiary: 'var(--bg-tertiary)',
        },
        ink: {
          primary: 'var(--ink-primary)',
          secondary: 'var(--ink-secondary)',
          tertiary: 'var(--ink-tertiary)',
        },
        line: {
          DEFAULT: 'var(--line)',
          strong: 'var(--line-strong)',
        },
        // Sidebar — sempre escura (navy), igual ao site de referência.
        sidebar: {
          DEFAULT: 'var(--sidebar-bg)',
          fg: 'var(--sidebar-fg)',
          active: 'var(--sidebar-active)',
          accent: 'var(--sidebar-accent)',
          border: 'var(--sidebar-border)',
        },
        // Paleta navy + ciano (alinhada ao design de referência CONSEJ).
        // Hex literais (não var()) para preservar os modificadores de opacidade do Tailwind (bg-brand/10 etc.).
        brand: {
          DEFAULT: '#1ab8dd', // accent ciano vívido
          dark: '#0f8aac',
          glow: '#6fd8ef',
          soft: 'var(--brand-soft)',
        },
        good: { DEFAULT: '#20b691', bar: '#20b691', soft: 'var(--good-soft)' },
        warn: { DEFAULT: '#f6a823', deep: '#f6a823', soft: 'var(--warn-soft)' },
        bad: { DEFAULT: '#e23645', bar: '#e23645', soft: 'var(--bad-soft)' },
      },
      borderRadius: {
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '20px',
        '3xl': '24px',
      },
      fontFamily: {
        sans: ['Manrope', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Sora', 'Manrope', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(0,0,0,0.18), 0 1px 3px rgba(0,0,0,0.22)',
        pop: '0 8px 24px rgba(0,0,0,0.35)',
        glow: '0 8px 24px -6px var(--brand-soft)',
      },
    },
  },
  plugins: [],
}

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
        brand: {
          DEFAULT: '#185FA5',
          dark: '#0C447C',
          soft: '#E6F1FB',
        },
        good: { DEFAULT: '#3B6D11', bar: '#639922', soft: '#EAF3DE' },
        warn: { DEFAULT: '#BA7517', deep: '#854F0B', soft: '#FAEEDA' },
        bad: { DEFAULT: '#A32D2D', bar: '#E24B4A', soft: '#FCEBEB' },
      },
      borderRadius: {
        md: '8px',
        lg: '12px',
        xl: '16px',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(16,24,40,0.04), 0 1px 3px rgba(16,24,40,0.06)',
        pop: '0 8px 24px rgba(16,24,40,0.12)',
      },
    },
  },
  plugins: [],
}

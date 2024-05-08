/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    colors: {
      primary: {
        50: '#eff6ff',
        100: '#dbeafe',
        200: '#bfdbfe',
        300: '#93c5fd',
        400: '#60a5fa',
        500: '#3b82f6',
        600: '#2563eb',
        700: '#1d4ed8',
        800: '#1e40af',
        900: '#1e3a8a',
      },
      secondary: {
        50: '#f8fafc',
        100: '#f1f5f9',
        200: '#e2e8f0',
        300: '#cbd5e1',
        400: '#94a3b8',
        500: '#64748b',
        600: '#475569',
        700: '#334155',
        800: '#1e293b',
        900: '#0f172a',
      },
      skill: {
        0: '#64748b',
        1: '#93c5fd',
        2: '#3b82f6',
      },
    },
    fontFamily: {
      'body': [
        'Inter',
        'ui-sans-serif',
        'system-ui',
        '-apple-system',
        'system-ui',
        'Segoe UI',
        'Roboto',
        'Helvetica Neue',
        'Arial',
        'Noto Sans',
        'sans-serif',
        'Apple Color Emoji',
        'Segoe UI Emoji',
        'Segoe UI Symbol',
        'Noto Color Emoji'
      ],
      'sans': [
        'Inter',
        'ui-sans-serif',
        'system-ui',
        '-apple-system',
        'system-ui',
        'Segoe UI',
        'Roboto',
        'Helvetica Neue',
        'Arial',
        'Noto Sans',
        'sans-serif',
        'Apple Color Emoji',
        'Segoe UI Emoji',
        'Segoe UI Symbol',
        'Noto Color Emoji'
      ]
    },
    extend: {
      spacing: {
        '8xl': '96rem',
        '9xl': '128rem',
      },
      borderRadius: {
        'none': '0',
        'sm': '.125rem',
        DEFAULT: '.25rem',
        'lg': '.5rem',
        'xl': '1rem',
        '2xl': '2rem',
      },
      screens: {
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
      colors: {
        current: 'currentColor',
        content: {
          title: '#e2e8f0',
          subtitle: '#cbd5e1',
          header: '#f1f5f9',
          body: '#cbd5e1',
          accent: '#94a3b8',
          date: '#94a3b8',
          skill: '#f1f5f9',
          outline: '#e2e8f0',
          boxbg: '#475569',
          boxhl: '#64748b',
          icons: '#e2e8f0',
        },  
      }
    }    
  },
}
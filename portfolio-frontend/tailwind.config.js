/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563eb',
          dark: '#1d4ed8',
        },
        secondary: {
          DEFAULT: '#0891b2',
          dark: '#06b6d4',
        },
        accent: '#22c55e',
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'border-flow': 'border-flow 2s linear infinite',
        'shake': 'shake 0.5s cubic-bezier(.36,.07,.19,.97) both',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%, 100%': { opacity: 1, boxShadow: '0 0 20px rgba(37, 99, 235, 0.5)' },
          '50%': { opacity: 0.6, boxShadow: '0 0 30px rgba(37, 99, 235, 0.8)' },
        },
        'border-flow': {
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '200% 50%' },
        },
        shake: {
          '10%, 90%': { transform: 'translate3d(-1px, 0, 0)' },
          '20%, 80%': { transform: 'translate3d(2px, 0, 0)' },
          '30%, 50%, 70%': { transform: 'translate3d(-4px, 0, 0)' },
          '40%, 60%': { transform: 'translate3d(4px, 0, 0)' },
        },
      },
      backgroundImage: {
        'circuit-pattern': "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M54.627 0l.83.828-1.415 1.415L51.8 0h2.827zM5.373 0l-.83.828L5.96 2.243 8.2 0H5.374zM48.97 0l3.657 3.657-1.414 1.414L46.143 0h2.828zM11.03 0L7.372 3.657 8.787 5.07 13.857 0H11.03zm32.284 0L49.8 6.485 48.384 7.9l-7.9-7.9h2.83zM16.686 0L10.2 6.485 11.616 7.9l7.9-7.9h-2.83zM38.284 0l7.9 7.9-1.415 1.413-9.9-9.9h2.828zM21.657 0l-7.9 7.9 1.415 1.413 9.9-9.9h-2.828zM3.415 0L0 3.414v2.828l4.93-4.93L3.414 0zm55.17 0l-4.93 4.93 1.517 1.517L60 1.816V0h-1.415zM36.147 0L26.76 9.388l1.414 1.414L36.17 2.828l8.485 8.485 1.414-1.414L36.147 0zM38.57 0L28.284 10.284 29.7 11.7l12.728-12.728h-3.858zM12.604 0L0 12.604v3.858L15.577 2.828 17 1.414 15.577 0h-2.973zm6.485 0L4.93 14.142 6.344 15.56l15.556-15.556h-2.81zM45.255 0L32.53 12.728l1.414 1.414L45.254 2.828 58.627 16.2 60 14.787 45.254 0zm15.916 1.414L49.1 13.485 50.514 14.9 62.544 2.87l-1.414-1.415zM62.544 0L47.385 15.16l1.414 1.414L60 5.373V0h2.544zM0 5.373v2.828l4.93-4.93L3.414 1.756.001 5.17V0h1.415v5.372zm0 5.656l3.415-3.414 1.414 1.413L0 14.142v-3.113zm0 5.656l6.344-6.343 1.414 1.414L0 19.798v-3.113zM0 8.2V0h3.858L0 3.857V8.2zm0 5.657V8.2l6.344 6.344-1.415 1.414L0 11.31v2.544zm0 5.657v-5.657l6.344 6.343-1.415 1.415L0 16.97v2.544zm0 5.657v-5.657l6.344 6.343-1.415 1.415L0 22.627v2.544zm0 5.657v-5.657l6.344 6.343-1.415 1.415L0 28.284v2.544zm0 5.657v-5.657l6.344 6.343-1.415 1.415L0 33.94v2.544z' fill='%232563eb' fill-opacity='0.05' fill-rule='evenodd'/%3E%3C/svg%3E\")",
      },
    },
    fontFamily: {
      mono: ['JetBrains Mono', 'monospace'],
      sans: ['Inter', 'system-ui', 'sans-serif'],
      code: ['Fira Code', 'monospace'],
    },
  },
  plugins: [],
}
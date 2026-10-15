/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        health: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
        aarogya: {
          primary: '#0d9488',    // teal-600
          secondary: '#059669',  // emerald-600
          accent: '#10b981',     // emerald-500
          dark: '#0f172a',       // slate-900
          surface: '#f8fafc',    // slate-50
          card: '#ffffff',
          border: '#e2e8f0',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(13, 148, 136, 0.08)',
        'glow': '0 0 15px rgba(20, 184, 166, 0.35)',
      }
    },
  },
  plugins: [],
}

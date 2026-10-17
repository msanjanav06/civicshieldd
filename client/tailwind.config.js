/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#f0f4f9',
          100: '#e1e9f2',
          200: '#c3d3e6',
          300: '#95b4d4',
          400: '#618fc0',
          500: '#3d72a8',
          600: '#2b5889',
          700: '#22466f',
          800: '#1b3859',
          900: '#0f1f33',
          950: '#0a1422',
        },
        civic: {
          slate: '#0f172a',
          surface: '#f8fafc',
          border: '#e2e8f0',
          primary: '#1e3a8a',
          accent: '#0284c7',
        }
      },
    },
  },
  plugins: [],
}

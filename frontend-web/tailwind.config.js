/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Paleta inspirada en la bandera de Guatemala
        primary: {
          50:  '#eff7ff',
          100: '#daecff',
          500: '#1e88e5',
          600: '#1976d2',
          700: '#1565c0',
          900: '#0d47a1',
        },
        verde: '#16a34a',
        amarillo: '#eab308',
        rojo: '#dc2626',
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

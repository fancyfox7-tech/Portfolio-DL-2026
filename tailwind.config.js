/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./*.html",
    "./work/*.html",
    "./js/**/*.js",
  ],
  theme: {
    extend: {
      colors: {
        bg:      'var(--color-bg)',
        text:    'var(--color-text)',
        accent:  'var(--color-accent)',
        border:  'var(--color-border)',
        surface: 'var(--color-surface)',
      },
      fontFamily: {
        mono: ['Fira Code', 'monospace'],
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

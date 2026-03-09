/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./*.html"],
  theme: {
    extend: {
      fontFamily: {
        outfit: ['Outfit', 'sans-serif'],
        cormorant: ['Cormorant Garamond', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        navy: {
          950: '#03021a',
          900: '#08064a',
          800: '#0a0840',
        },
        crimson: {
          DEFAULT: '#a51c30',
          dark:    '#c0392b',
          light:   '#e05050',
        },
        gold: '#c8a46a',
      }
    },
  },
  plugins: [],
}

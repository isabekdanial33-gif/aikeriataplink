/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        obsidian: '#0a0a0f',
        charcoal: '#12121a',
        gold: {
          light: '#e8d5b7',
          DEFAULT: '#d4af7a',
          dark: '#b8945f',
        },
        champagne: '#e8d5b7',
      },
    },
  },
  plugins: [],
};

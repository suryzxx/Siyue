/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./App.tsx",
    "./index.tsx",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2DA194',
        'primary-light': '#EAF6F5',
        'purple-main': '#9254DE',
        'purple-light': '#F3F0FF',
        'text-main': '#333333',
        'text-sub': '#8C8C8C',
        'bg-gray': '#F5F7F9',
      }
    },
  },
  plugins: [],
}
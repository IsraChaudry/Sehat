/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        primary: '#1D9E75',
        emergency: '#E24B4A',
        urgent: '#EF9F27',
        routine: '#639922',
        followup: '#378ADD',
      },
    },
  },
  plugins: [],
}

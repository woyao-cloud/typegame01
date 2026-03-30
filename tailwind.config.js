/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'sky-blue': '#87CEEB',
        'cloud-white': '#FFFFFF',
        'grass-green': '#4ade80',
        'warning-yellow': '#fbbf24',
        'error-red': '#ef4444',
        'text-dark': '#2D3748',
      },
    },
  },
  plugins: [],
};

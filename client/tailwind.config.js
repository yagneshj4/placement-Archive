/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'accent-violet': '#7C3AED',
        'accent-teal': '#0D9488',
        'accent-gold': '#F59E0B',
        'bg-deep': '#0A0A0F',
        'bg-mid': '#0F101A',
        'card-dark': '#131422',
        'card-border': '#2A2A3A'
      },
      animation: {
        'gradient-x': 'gradient-x 3s ease infinite',
      },
      keyframes: {
        'gradient-x': {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          },
        },
      },
    },
  },
  plugins: [],
}

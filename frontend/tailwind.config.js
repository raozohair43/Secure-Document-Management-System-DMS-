/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      // tailwind.config.js
theme: {
  extend: {
    keyframes: {
      'fade-in-up': {
        '0%': { opacity: '0', transform: 'translateY(10px)' },
        '100%': { opacity: '1', transform: 'translateY(0)' },
      }
    },
    animation: {
      'fade-in-up': 'fade-in-up 0.4s ease-out',
    }
  },
}
    }, // We will add our minimal color palette here later
  },
  plugins: [],
}
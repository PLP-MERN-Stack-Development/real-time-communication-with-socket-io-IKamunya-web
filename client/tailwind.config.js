/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        discord: {
          primary: '#5865F2',
          green: '#3BA55D',
          gray: {
            950: '#202225',
            900: '#2F3136',
            800: '#36393F',
            700: '#40444B',
            600: '#4F545C',
            400: '#96989D',
            300: '#B9BBBE',
            200: '#D4D7DC'
          }
        }
      }
    },
  },
  plugins: [],
}
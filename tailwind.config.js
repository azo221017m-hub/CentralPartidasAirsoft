/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        tactical: {
          black: '#0a0a0a',
          darkgreen: '#1a2e1a',
          green: '#2d4a2d',
          olive: '#4a5c3a',
          lightolive: '#6b7c4a',
          orange: '#d4620a',
          lightorange: '#e87c2a',
          sand: '#c8b87a',
          lightsand: '#e0d09a',
          gray: '#3a3a3a',
        }
      }
    },
  },
  plugins: [],
}


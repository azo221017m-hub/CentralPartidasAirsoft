/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta oficial basada en el brandbook Central de Partidas Airsoft
        cpa: {
          primary: '#485D2A',        // Verde militar principal del brandbook
          secondary: '#2E3A1E',      // Verde más oscuro
          dark: '#111214',          // Negro principal
          gray: '#2A2D31',          // Gris medio
          sand: '#D6C8AA',          // Arena/beige
          white: '#FFFFFF',         // Blanco
          accent: '#485D2A',        // Verde de acento
        },
        // Mantener colores ops por compatibilidad temporal
        ops: {
          primary: '#485D2A',        
          secondary: '#2E3A1E',      
          accent: '#485D2A',         
          dark: '#111214',          
          'dark-gray': '#2A2D31',   
          gray: '#2A2D31',          
          'light-gray': '#D6C8AA',  
          'text-light': '#FFFFFF',  
          'text-dim': '#D6C8AA',    
          orange: '#485D2A',        
        },
        // Mantener colores tácticos existentes por compatibilidad
        tactical: {
          black: '#111214',
          darkgreen: '#2E3A1E',
          green: '#485D2A',
          olive: '#2A2D31',
          lightolive: '#D6C8AA',
          orange: '#485D2A',
          lightorange: '#485D2A',
          sand: '#D6C8AA',
          lightsand: '#FFFFFF',
          gray: '#2A2D31',
        }
      },
      fontFamily: {
        'squadron': ['Squadron', 'Orbitron', 'monospace'],  // Tipografía principal del brandbook
        'military': ['Squadron', 'Orbitron', 'monospace'],
        'tactical': ['Rajdhani', 'sans-serif'],
      },
      backgroundImage: {
        'cpa-gradient': 'linear-gradient(135deg, #111214 0%, #2E3A1E 50%, #485D2A 100%)',
        'tactical-gradient': 'linear-gradient(135deg, #111214 0%, #2A2D31 50%, #485D2A 100%)',
        'green-gradient': 'linear-gradient(135deg, #485D2A 0%, #2E3A1E 100%)',
      }
    },
  },
  plugins: [],
}


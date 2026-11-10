/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        void: {
          950: '#030305',
          900: '#070709',
          850: '#0d0e14',
          800: '#13141f',
          700: '#1b1d2e',
        },
        gold: {
          400: '#FFE169',
          500: '#FFD700',
          600: '#D4AF37',
          700: '#B8860B',
        },
        violet: {
          400: '#C084FC',
          500: '#A855F7',
          600: '#8A2BE2',
          700: '#7E22CE',
        },
        electric: {
          400: '#38BDF8',
          500: '#00E5FF',
          600: '#0284C7',
          700: '#0369A1',
        }
      },
      fontFamily: {
        sans: ['Cinzel', 'Inter', 'sans-serif'],
        display: ['Orbitron', 'Cinzel', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'neon-gold': '0 0 20px rgba(255, 215, 0, 0.45)',
        'neon-blue': '0 0 20px rgba(0, 229, 255, 0.45)',
        'neon-violet': '0 0 25px rgba(138, 43, 226, 0.45)',
        'hologram': '0 0 35px rgba(0, 229, 255, 0.25), inset 0 0 25px rgba(138, 43, 226, 0.25)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 3s ease-in-out infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        glow: {
          '0%': { filter: 'drop-shadow(0 0 10px rgba(0, 229, 255, 0.5))' },
          '100%': { filter: 'drop-shadow(0 0 25px rgba(255, 215, 0, 0.8))' },
        }
      }
    },
  },
  plugins: [],
}

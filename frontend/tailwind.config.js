/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        soil: '#2C1A0E',
        bark: '#4A2E1A',
        moss: '#1B3A2D',
        leaf: '#2D6A4F',
        sprout: '#52B788',
        mint: '#95D5B2',
        cream: '#F5F0E8',
        gold: '#D4A853',
        sun: '#F2CC60',
        parchment: '#FDFCF8',
        // keep old primary for compat
        primary: {
          50: '#f0f9e8',
          100: '#d9f0c7',
          200: '#bee7a2',
          300: '#a3dd7c',
          400: '#8cd560',
          500: '#52B788',
          600: '#2D6A4F',
          700: '#1B3A2D',
          800: '#2C1A0E',
          900: '#1a0f06',
        },
        botanical: {
          earth: '#4A2E1A',
          cream: '#F5F0E8',
          sun: '#F2CC60',
          sage: '#95D5B2',
        },
      },
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        display: ['Playfair Display', 'Georgia', 'serif'],
        mono: ['Space Mono', 'monospace'],
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.6s cubic-bezier(.22,.68,0,1.2)',
        'bounce-slow': 'bounce 3s infinite',
        'sway': 'plantSway 4s ease-in-out infinite',
        'gps-blip': 'gpsBlip 2s infinite',
        'shimmer': 'shimmer 1.5s infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { transform: 'translateY(24px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        plantSway: { '0%,100%': { transform: 'translateX(-50%) rotate(0deg)' }, '25%': { transform: 'translateX(-50%) rotate(1.5deg)' }, '75%': { transform: 'translateX(-50%) rotate(-1.5deg)' } },
        gpsBlip: { '0%,100%': { boxShadow: '0 0 0 0 rgba(82,183,136,0.6)' }, '50%': { boxShadow: '0 0 0 8px rgba(82,183,136,0)' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
      },
      boxShadow: {
        'glow-green': '0 0 30px rgba(82,183,136,0.35)',
        'glow-gold': '0 0 30px rgba(212,168,83,0.4)',
        'glass': '0 40px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
      },
    },
  },
  plugins: [],
}

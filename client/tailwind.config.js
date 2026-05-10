/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
        outfit: ['Outfit', 'sans-serif'],
      },
      colors: {
        background: '#02040a',
        foreground: '#f8fafc',
        premium: {
          bg: '#02040a',
          card: 'rgba(15, 23, 42, 0.3)',
          border: 'rgba(255, 255, 255, 0.08)',
          accent: '#3b82f6',
          text: '#f8fafc',
          muted: '#94a3b8',
          subtle: '#64748b',
        },
        status: {
          usable: '#10b981', // Green
          attention: '#f59e0b', // Amber
          issue: '#ef4444', // Red
          unavailable: '#475569', // Grey
        }
      },
      backdropBlur: {
        premium: '20px',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}


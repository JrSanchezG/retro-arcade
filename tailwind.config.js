/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        arcade: {
          darkest: '#030206',
          darker: '#080511',
          dark: '#0f0b1e',
          surface: '#16112c',
          panel: '#1f183d',
          gold: '#ffd700',
          amber: '#f59e0b',
          purple: '#8b5cf6',
          violet: '#a855f7',
          darkpurple: '#3b0764',
          cyan: '#00f0ff',
          sky: '#38bdf8',
          neon: '#06b6d4',
          red: '#ef4444',
          green: '#22c55e',
        }
      },
      fontFamily: {
        pixel: ['"Press Start 2P"', 'monospace'],
        retro: ['Silkscreen', 'monospace'],
        arcade: ['VT323', 'monospace'],
        sans: ['Chakra Petch', 'sans-serif'],
      },
      boxShadow: {
        'neon-gold': '0 0 15px rgba(255, 215, 0, 0.45), 0 0 30px rgba(255, 215, 0, 0.2)',
        'neon-purple': '0 0 15px rgba(168, 85, 247, 0.45), 0 0 30px rgba(168, 85, 247, 0.2)',
        'neon-cyan': '0 0 15px rgba(0, 240, 255, 0.45), 0 0 30px rgba(0, 240, 255, 0.2)',
        'arcade-inset': 'inset 0 0 20px rgba(0, 240, 255, 0.15), inset 0 2px 5px rgba(255, 215, 0, 0.2)',
        'pixel-border': '4px 4px 0px 0px #000000',
      },
      animation: {
        'blink-fast': 'blink 0.8s step-start infinite',
        'marquee': 'marquee 25s linear infinite',
        'scanline': 'scanline 8s linear infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        'pulse-glow': {
          '0%, 100%': { filter: 'drop-shadow(0 0 8px rgba(0, 240, 255, 0.7))' },
          '50%': { filter: 'drop-shadow(0 0 16px rgba(255, 215, 0, 0.9))' },
        }
      }
    },
  },
  plugins: [],
}

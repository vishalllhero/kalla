/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Montserrat', ...defaultTheme.fontFamily.sans],
        serif: ['Cormorant Garamond', ...defaultTheme.fontFamily.serif],
        handwriting: ['"La Belle Aurore"', 'cursive'],
      },
      colors: {
        canvas: '#FDFBF7', // Warm paper white
        ink: '#2B2926',    // Soft Charcoal
        
        // Brand Palette
        brand: {
          blue: '#2E86C1',
          orange: '#FF7F50',
          purple: '#9B59B6',
          white: '#FFFFFF',
        },
        
        // Artistic Earth Tones (Missing in previous config)
        clay: {
          50: '#fdf4f3',
          100: '#fbebe9',
          200: '#f5d3ce',
          300: '#ecb0a8',
          400: '#e08276',
          500: '#bc4749', // Terracotta
          600: '#a63638',
          700: '#8b2a2c',
          800: '#752627',
          900: '#622425',
        },
        ochre: {
          50: '#fbf8f1',
          100: '#f6efde',
          200: '#ebdcb3',
          300: '#dec282',
          400: '#d4a373', // Gold/Sand
          500: '#c58e55',
          600: '#aa7142',
          700: '#895839',
          800: '#724934',
          900: '#5d3c2e',
        },
        
        // Functional Colors
        success: '#27AE60',
        warning: '#F39C12',
        error: '#C0392B',
        
        // Neutrals
        stone: {
          50: '#FAFAF9',
          100: '#F5F5F4',
          200: '#E7E5E4',
          300: '#D6D3D1',
          800: '#292524',
          900: '#1C1917',
        }
      },
      backgroundImage: {
        'paper-texture': "url('https://www.transparenttextures.com/patterns/cream-paper.png')",
        'canvas-texture': "url('https://www.transparenttextures.com/patterns/canvas-orange.png')", 
      },
      boxShadow: {
        'lift': '0 10px 40px -10px rgba(0,0,0,0.15)',
        'glow-blue': '0 0 20px rgba(46, 134, 193, 0.3)',
        'glow-orange': '0 0 20px rgba(255, 127, 80, 0.3)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'brush-draw': 'brushDraw 1s ease-out forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        brushDraw: {
          '0%': { width: '0%' },
          '100%': { width: '100%' },
        }
      }
    },
  },
  plugins: [],
};

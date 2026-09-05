/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
        serif: ['Cormorant Garamond', ...defaultTheme.fontFamily.serif],
        handwriting: ['"La Belle Aurore"', 'cursive'],
      },
      colors: {
        // Design system colors
        background: '#FAF9F6',        // warm ivory
        'primary-text': '#212121',   // deep charcoal
        terracotta: '#C0392B',       // accent
        'muted-gold': '#D4AF37',     // secondary accent
        // extend existing palette
        canvas: '#FAF9F6',           // background
        ink: '#212121',              // primary text
        clay: {
          50: '#fdf4f3',
          100: '#fbebe9',
          200: '#f5d3ce',
          300: '#ecb0a8',
          400: '#e08276',
          500: '#bc4749', // terracotta
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
          400: '#d4a373', // muted gold
          500: '#c58e55',
          600: '#aa7142',
          700: '#895839',
          800: '#724934',
          900: '#5d3c2e',
        },
        // functional
        success: '#27AE60',
        warning: '#F39C12',
        error: '#C0392B',
        stone: {
          50: '#FAFAF9',
          100: '#F5F5F4',
          200: '#E7E5E4',
          300: '#D6D3D1',
          800: '#292524',
          900: '#1C1917',
        },
      },
    },
  },
  plugins: [],
}
/* eslint-disable no-undef, @typescript-eslint/no-require-imports */

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
        serif: ['"Cormorant Garamond"', ...defaultTheme.fontFamily.serif],
        display: ['"Cormorant Garamond"', ...defaultTheme.fontFamily.serif],
        handwriting: ['"La Belle Aurore"', 'cursive'],
      },

      colors: {
        obsidian: '#08090B',
        elevated: '#15171C',
        canvas: '#08090B',
        surface: '#111318',
        'surface-elevated': '#15171C',
        'surface-hover': '#1A1D23',

        ivory: '#F5F2EA',
        ink: '#F5F2EA',
        muted: '#8F8C86',

        gold: '#C8A951',
        'gold-light': '#D6B85A',

        crimson: '#8E2924',
        'crimson-light': '#B43A32',

        background: '#08090B',
        'primary-text': '#F5F2EA',
        terracotta: '#B43A32',
        'muted-gold': '#C8A951',

        success: '#27AE60',
        warning: '#F39C12',
        error: '#B43A32',

        clay: {
          50: '#fdf4f3',
          100: '#fbebe9',
          200: '#f5d3ce',
          300: '#ecb0a8',
          400: '#e08276',
          500: '#bc4749',
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
          400: '#d4a373',
          500: '#c58e55',
          600: '#aa7142',
          700: '#895839',
          800: '#724934',
          900: '#5d3c2e',
        },

        stone: {
          50: '#FAFAF9',
          100: '#F5F5F4',
          200: '#E7E5E4',
          300: '#D6D3D1',
          800: '#292524',
          900: '#1C1917',
        },
      },

      boxShadow: {
        'gold-glow': '0 0 30px rgba(200, 169, 81, 0.12)',
        'gold-glow-lg': '0 0 60px rgba(200, 169, 81, 0.16)',
      },

      borderRadius: {
        '4xl': '2rem',
      },
    },
  },

  plugins: [],
}
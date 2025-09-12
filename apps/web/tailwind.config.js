const baseConfig = require("@xandhopp/config/tailwind");

/** @type {import('tailwindcss').Config} */
module.exports = {
  ...baseConfig,
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    ...baseConfig.theme,
    extend: {
      ...baseConfig.theme?.extend,
      colors: {
        ...baseConfig.theme?.extend?.colors,
        // HSL-based semantic color tokens
        primary: {
          DEFAULT: 'hsl(221, 83%, 53%)', // Trust blue
          50: 'hsl(221, 83%, 95%)',
          100: 'hsl(221, 83%, 90%)',
          200: 'hsl(221, 83%, 80%)',
          300: 'hsl(221, 83%, 70%)',
          400: 'hsl(221, 83%, 60%)',
          500: 'hsl(221, 83%, 53%)',
          600: 'hsl(221, 83%, 45%)',
          700: 'hsl(221, 83%, 35%)',
          800: 'hsl(221, 83%, 25%)',
          900: 'hsl(221, 83%, 15%)',
        },
        secondary: {
          DEFAULT: 'hsl(24, 95%, 53%)', // Warm orange
          50: 'hsl(24, 95%, 95%)',
          100: 'hsl(24, 95%, 90%)',
          200: 'hsl(24, 95%, 80%)',
          300: 'hsl(24, 95%, 70%)',
          400: 'hsl(24, 95%, 60%)',
          500: 'hsl(24, 95%, 53%)',
          600: 'hsl(24, 95%, 45%)',
          700: 'hsl(24, 95%, 35%)',
          800: 'hsl(24, 95%, 25%)',
          900: 'hsl(24, 95%, 15%)',
        },
        gray: {
          DEFAULT: 'hsl(0, 0%, 50%)', // Global gray
          50: 'hsl(0, 0%, 98%)',
          100: 'hsl(0, 0%, 96%)',
          200: 'hsl(0, 0%, 90%)',
          300: 'hsl(0, 0%, 84%)',
          400: 'hsl(0, 0%, 65%)',
          500: 'hsl(0, 0%, 50%)',
          600: 'hsl(0, 0%, 40%)',
          700: 'hsl(0, 0%, 30%)',
          800: 'hsl(0, 0%, 20%)',
          900: 'hsl(0, 0%, 10%)',
        },
        destructive: {
          DEFAULT: 'hsl(0, 84%, 60%)', // Red for problems
          50: 'hsl(0, 84%, 95%)',
          100: 'hsl(0, 84%, 90%)',
          200: 'hsl(0, 84%, 80%)',
          300: 'hsl(0, 84%, 70%)',
          400: 'hsl(0, 84%, 60%)',
          500: 'hsl(0, 84%, 50%)',
          600: 'hsl(0, 84%, 40%)',
          700: 'hsl(0, 84%, 30%)',
          800: 'hsl(0, 84%, 20%)',
          900: 'hsl(0, 84%, 10%)',
        },
      },
      boxShadow: {
        'soft': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'warm': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'elegant': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-in-out',
        'slide-up': 'slideUp 0.6s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
};

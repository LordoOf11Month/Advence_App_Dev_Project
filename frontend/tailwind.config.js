/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FF6000',
          dark: '#E55400',
          light: '#FF8533',
        },
        secondary: {
          DEFAULT: '#0066FF',
          dark: '#0052CC',
          light: '#4D94FF',
        },
        accent: '#36B37E',
        success: '#36B37E',
        warning: '#FFAB00',
        error: '#FF5630',
        neutral: {
          50: '#FAFBFC',
          100: '#F4F5F7',
          200: '#DFE1E6',
          300: '#97A0AF',
          400: '#7A869A',
          500: '#5E6C84',
          600: '#42526E',
          700: '#344563',
          800: '#253858',
          900: '#172B4D',
        }
      },
      spacing: {
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '5': '24px',
        '6': '32px',
        '7': '40px',
        '8': '48px',
        '9': '64px',
      },
      borderRadius: {
        'sm': '4px',
        'md': '8px',
        'lg': '16px',
      },
      boxShadow: {
        'sm': '0 1px 2px rgba(0, 0, 0, 0.05)',
        'md': '0 4px 6px rgba(0, 0, 0, 0.05)',
        'lg': '0 10px 15px rgba(0, 0, 0, 0.05)',
      },
    },
  },
  plugins: [],
} 
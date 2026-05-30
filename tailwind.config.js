/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1B3A57',
          50: '#E8EEF3',
          100: '#D1DDE7',
          200: '#A3BBCF',
          300: '#7599B7',
          400: '#47779F',
          500: '#1B3A57',
          600: '#162E46',
          700: '#102234',
          800: '#0B1723',
          900: '#050B11',
        },
        secondary: {
          DEFAULT: '#3D9B8E',
          50: '#E8F5F3',
          100: '#D1EBE8',
          200: '#A3D7D1',
          300: '#75C3BA',
          400: '#47AFA3',
          500: '#3D9B8E',
          600: '#317C71',
          700: '#255D55',
          800: '#183E38',
          900: '#0C1F1C',
        },
        accent: {
          DEFAULT: '#5FBEAB',
          light: '#7FCFC0',
          dark: '#4DA593',
        },
        background: {
          light: '#F8FAFB',
          dark: '#0F2335',
        },
        textColor: {
          dark: '#1B3A57',
          light: '#6B7C8E',
        },
      },
      fontFamily: {
        sans: ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 12px rgba(27, 58, 87, 0.08)',
        'card': '0 8px 24px rgba(27, 58, 87, 0.12)',
        'glow': '0 0 20px rgba(61, 155, 142, 0.3)',
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
        '3xl': '24px',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'pulse-slow': 'pulse 3s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
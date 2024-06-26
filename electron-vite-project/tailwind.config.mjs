/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primaryLight: 'rgba(0, 0, 0, 0.85);',
        secondaryLight: 'rgba(0, 0, 0, 0.5);',
        tertiaryLight: 'rgba(0, 0, 0, 0.25);',
        primaryDark: 'rgba(255, 255, 255, 0.85);',
        secondaryDark: 'rgba(255, 255, 255, 0.5);',
        tertiaryDark: 'rgba(255, 255, 255, 0.25);',
        myCustomColor2: {
          100: '#F0F5FF',
          200: '#C9D6F0',
          300: '#A1B6E0',
          400: '#7A97D1',
          500: '#5277C2',
          600: '#3F5E9A',
          700: '#2C4373',
          800: '#1A293E',
          900: '#080F0A',
        },
      },
    },
  },
  plugins: [],
};

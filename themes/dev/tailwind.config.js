module.exports = {
  theme: {
    fontFamily: {
      display: ['Poppins', 'sans-serif'],
      body: ['Lora', 'serif'],
    },
    screens: {
      sm: '668px',
    },
    extend: {
      colors: {
        blue: {
          100: 'hsl(234, 30%, 54%)',
          200: 'hsl(234, 40%, 54%)',
          300: 'hsl(234, 50%, 54%)',
          400: 'hsl(234, 60%, 54%)',
          500: 'hsl(234, 70%, 54%)',
          600: 'hsl(234, 80%, 54%)',
          700: 'hsl(234, 90%, 54%)',
          800: 'hsl(234, 100%, 54%)',
        },
        orange: {
          500: 'var(--colors-primary)',
        },
        gray: {
          '100': '#f5f5f5',
          '200': '#eeeeee',
          '300': '#e0e0e0',
          '400': '#bdbdbd',
          '500': '#9e9e9e',
          '600': '#757575',
          '700': '#616161',
          '800': '#424242',
          '900': '#212121',
        },
      },
      fontSize: {
        xxs: '0.65rem',
      },
    },
  },
  variants: {},
  plugins: [],
}

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
        primary: 'var(--colors-primary)',
        secondary: 'var(--colors-secondary)',
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

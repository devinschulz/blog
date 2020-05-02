module.exports = {
  theme: {
    purge: false,
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
        black: 'var(--colors-black)',
        white: 'var(--colors-white)',
        gray: {
          '100': 'var(--colors-gray-100)',
          '200': 'var(--colors-gray-200)',
          '300': 'var(--colors-gray-300)',
          '400': 'var(--colors-gray-400)',
          '500': 'var(--colors-gray-500)',
          '600': 'var(--colors-gray-600)',
          '700': 'var(--colors-gray-700)',
          '800': 'var(--colors-gray-800)',
          '900': 'var(--colors-gray-900)',
        },
      },
      fontSize: {
        xxs: '0.65rem',
      },
    },
  },
  variants: {
    scale: ['responsive', 'hover', 'focus', 'group-hover'],
  },
  plugins: [],
}

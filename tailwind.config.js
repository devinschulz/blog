const path = require('path')

module.exports = {
  purge: [path.join(__dirname, './layouts/**/*.html')],
  theme: {
    fontFamily: {
      body: [
        '-apple-system',
        'BlinkMacSystemFont',
        'Helvetica Neue',
        'Arial',
        'Noto Sans',
        'sans-serif',
        'Apple Color Emoji',
        'Segoe UI',
        'Roboto',
        'Segoe UI Emoji',
        'Segoe UI Symbol',
        'Noto Color Emoji',
      ],
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

const path = require('path')

module.exports = {
  purge: [path.join(__dirname, './layouts/**/*.html')],
  theme: {
    darkSelector: '.dark',
    typography: (theme) => ({
      default: {
        css: {
          '*,*::before,*::after': {
            borderColor: theme('colors.grey.light'),
          },
          color: theme('colors.body'),
          h1: {
            color: theme('colors.headings'),
          },
          h2: {
            color: theme('colors.headings'),
          },
          h3: {
            color: theme('colors.headings'),
          },
          h4: {
            color: theme('colors.headings'),
          },
          h5: {
            color: theme('colors.headings'),
          },
          h6: {
            color: theme('colors.headings'),
          },
          'ul > li::before': {
            content: '""',
            position: 'absolute',
            backgroundColor: theme('colors.grey.dark'),
            borderRadius: '50%',
          },
          a: {
            color: theme('colors.primary'),
            textDecoration: 'none',
            '&:hover': {
              textDecoration: 'underline',
            },
          },
          pre: {
            backgroundColor: theme('colors.bg'),
            border: `1px solid ${theme('colors.grey.light')}`,
            color: theme('colors.body'),
            fontFamily: theme('fontFamily.mono'),
          },
          'pre code': {
            fontSize: theme('text.sm'),
          },
          code: {
            color: theme('colors.body'),
            fontFamily: theme('fontFamily.mono'),
          },
          strong: {
            color: theme('colors.body'),
          },
          thead: {
            borderBottomColor: theme('colors.grey.light'),
          },
          tbody: {
            tr: {
              borderBottomColor: theme('colors.grey.light'),
            },
          },
          figure: {
            figcaption: {
              color: theme('colors.grey.darkest'),
              fontFamily: theme('fontFamily.display'),
            },
          },
          blockquote: {
            color: theme('colors.grey.darkest'),
          },
        },
      },
    }),
    fontFamily: {
      display: 'var(--font-display)',
      body: 'var(--font-body)',
      mono: 'var(--font-mono)',
    },
    screens: {
      sm: '668px',
    },
    extend: {
      colors: {
        bg: 'var(--colors-bg)',
        body: 'var(--colors-body)',
        headings: 'var(--colors-headings)',
        primary: 'var(--colors-primary)',
        'primary-light': 'var(--colors-primary-light)',
        'primary-lightest': 'var(--colors-primary-lightest)',
        secondary: 'var(--colors-secondary)',
        tertiary: 'var(--colors-tertiary)',
        quaternary: 'var(--colors-quaternary)',
        black: 'var(--colors-black)',
        white: 'var(--colors-white)',
        'active-link': 'var(--colors-active-link)',
        grey: {
          lightest: 'var(--colors-grey-lightest)',
          light: 'var(--colors-grey-light)',
          medium: 'var(--colors-grey-medium)',
          dark: 'var(--colors-grey-dark)',
          darker: 'var(--colors-grey-darker)',
          darkest: 'var(--colors-grey-darkest)',
        },
      },
      fontSize: {
        xxs: '0.65rem',
      },
      borderColor: (theme) => ({
        default: theme('colors.grey-light'),
      }),
    },
  },
  variants: {
    scale: ['responsive', 'hover', 'focus', 'group-hover'],
    translate: ['responsive', 'hover', 'focus', 'group-hover'],
    display: ['dark', 'responsive'],
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('tailwindcss-dark-mode')(),
  ],
}

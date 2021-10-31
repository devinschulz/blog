const path = require('path')

module.exports = {
  purge: [path.join(__dirname, './layouts/**/*.html')],
  darkMode: 'class',
  theme: {
    fontFamily: {
      display: 'var(--font-display)',
      body: 'var(--font-body)',
      mono: 'var(--font-mono)',
    },
    screens: {
      sm: '640px',
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
      typography: (theme) => ({
        DEFAULT: {
          css: {
            '*,*::before,*::after': {
              borderColor: theme('colors.grey.light'),
            },
            color: theme('colors.body'),
            h1: {
              color: theme('colors.headings'),
              fontSize: theme('fontSize.2xl'),
              fontWeight: theme('fontWeight.medium'),
            },
            h2: {
              color: theme('colors.headings'),
              fontSize: theme('fontSize.xl'),
              fontWeight: theme('fontWeight.medium'),
            },
            h3: {
              color: theme('colors.headings'),
              fontSize: theme('fontSize.lg'),
              fontWeight: theme('fontWeight.medium'),
            },
            h4: {
              color: theme('colors.headings'),
              fontSize: theme('fontSize.base'),
              fontWeight: theme('fontWeight.medium'),
            },
            h5: {
              color: theme('colors.headings'),
              fontSize: theme('fontSize.sm'),
              fontWeight: theme('fontWeight.medium'),
            },
            h6: {
              color: theme('colors.headings'),
              fontSize: theme('fontSize.sm'),
              fontWeight: theme('fontWeight.medium'),
            },
            'ul > li::before': {
              content: '""',
              position: 'absolute',
              backgroundColor: theme('colors.grey.dark'),
              borderRadius: '50%',
            },
            a: {
              borderBottom: `1px dotted ${theme('colors.grey.darker')}`,
              color: theme('colors.current'),
              fontWeight: theme('fontWeight.medium'),
              textDecoration: 'none',
              '&:hover': {
                backgroundColor: theme('colors.black'),
                color: theme('colors.white'),
                borderBottom: 'none',
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
            'pre code::before': {
              content: 'inherit',
            },
            'pre code::after': {
              content: 'inherit',
            },
            code: {
              color: theme('colors.body'),
              fontFamily: theme('fontFamily.mono'),
            },
            strong: {
              color: theme('colors.body'),
              fontWeight: theme('fontWeight.medium'),
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
    },
  },
  variants: {
    borderStyle: ['responsive', 'hover', 'focus'],
    display: ['dark', 'responsive'],
    opacity: ['responsive', 'hover', 'focus', 'active', 'group-hover'],
    scale: ['responsive', 'hover', 'focus', 'group-hover'],
    textColor: ['responsive', 'hover', 'focus', 'group-hover'],
    translate: ['responsive', 'hover', 'focus', 'active', 'group-hover'],
  },
  plugins: [require('@tailwindcss/typography')],
}

const path = require('path')

module.exports = {
  plugins: {
    'postcss-import': {},
    'postcss-nested': {},
    tailwindcss: path.join(__dirname, './tailwind.js'),
    'postcss-preset-env': {
      browsers: 'last 2 versions',
    },
    'postcss-custom-media': {},
    cssnano: {
      preset: [
        'default',
        {
          discardComments: {
            removeAll: true,
          },
        },
      ],
    },
  },
}

const path = require('path')

module.exports = {
  plugins: {
    'postcss-import': {},
    'postcss-nested': {},
    autoprefixer: {},
    tailwindcss: path.join(__dirname, './tailwind.js'),
    'postcss-preset-env': {
      browsers: 'last 2 versions',
    },
    'postcss-custom-media': {},
  },
}

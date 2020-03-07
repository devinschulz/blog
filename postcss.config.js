const path = require('path')

module.exports = {
  plugins: [
    require('postcss-import'),
    require('postcss-nested'),
    require('tailwindcss'),
    require('postcss-preset-env'),
    ...(process.env.NODE_ENV === 'production'
      ? [
          require('@fullhuman/postcss-purgecss')({
            // Specify the paths to all of the template files in your project
            content: [path.join(__dirname, './layouts/**/*.html')],

            // Include any special characters you're using in this regular expression
            defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || [],
          }),
          require('cssnano')({
            preset: ['default', { discardComments: { removeAll: true } }],
          }),
        ]
      : []),
  ],
}

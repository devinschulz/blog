const path = require('path')

module.exports = env => ({
  plugins: [
    require('postcss-mixins'),
    require('postcss-simple-vars'),
    require('postcss-import'),
    require('postcss-nested'),
    require('tailwindcss')(path.join(__dirname, './tailwind.config.js')),
    require('postcss-preset-env')({
      browsers: 'last 2 versions',
    }),
    require('postcss-custom-media'),
    env === 'production'
      ? require('cssnano')({
          preset: [
            'default',
            {
              discardComments: {
                removeAll: true,
              },
            },
          ],
        })
      : false,
  ],
})

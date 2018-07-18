module.exports = {
  plugins: {
    autoprefixer: {
      browsers: ['last 2 versions', '> 1%'],
    },
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

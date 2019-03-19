const path = require('path')
const assets = require(path.join(__dirname, 'site/data/webpack.json'))

// Custom PurgeCSS extractor for Tailwind that allows special characters in
// class names.
//
// https://github.com/FullHuman/purgecss#extractor
class TailwindExtractor {
  static extract(content) {
    return content.match(/[A-Za-z0-9-_:\/]+/g) || []
  }
}

module.exports = {
  content: ['dist/**/*.html', 'dist/**/*.js'],
  css: [`dist/${assets.main.css}`],
  extractors: [
    {
      extractor: TailwindExtractor,
      extensions: ['html', 'js'],
    },
  ],
}

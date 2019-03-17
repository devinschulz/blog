const path = require('path')
const assets = require(path.join(__dirname, 'site/data/webpack.json'))

module.exports = {
  content: ['dist/**/*.html', 'dist/**/*.js'],
  css: [`dist/${assets.main.css}`],
}

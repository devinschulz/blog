const terser = require('terser')
const path = require('path')
const fs = require('fs')

function minifyFile(pluginConfig) {
  return (file) => {
    const contents = fs.readFileSync(file, 'utf8')
    const result = terser.minify(contents, pluginConfig.options)
    fs.writeFileSync(file, result.code, 'utf8')

    if (pluginConfig.debugMode) {
      console.log('Minified', file)
    }
  }
}

function isJavaScript(file) {
  return path.extname(file) === '.js'
}

function withPath(pluginConfig) {
  return (file) => path.join(__dirname, '../../', pluginConfig.src, file)
}

module.exports = function () {
  return {
    name: 'terser',
    onPostBuild({ pluginConfig, utils }) {
      if (!pluginConfig.src) {
        return utils.build.failPlugin('No pluginConfig.src found')
      }
      if (!pluginConfig.options) {
        pluginConfig.options = {}
      }
      try {
        fs.readdirSync(path.join(__dirname, '../../', pluginConfig.src))
          .filter(isJavaScript)
          .map(withPath(pluginConfig))
          .forEach(minifyFile(pluginConfig))
      } catch (error) {
        utils.build.failPlugin('Failed to minify assets with terser', error)
      }
    },
  }
}

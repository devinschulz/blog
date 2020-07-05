const terser = require('terser')
const path = require('path')
const fs = require('fs')

function minifyFile(inputs) {
  return (file) => {
    const contents = fs.readFileSync(file, 'utf8')
    const result = terser.minify(contents, inputs.options)
    fs.writeFileSync(file, result.code, 'utf8')
  }
}

function isJavaScript(file) {
  return path.extname(file) === '.js'
}

function withPath(inputs) {
  return (file) => path.join(__dirname, '../../', inputs.src, file)
}

module.exports = function () {
  return {
    onPostBuild({ pluginConfig: inputs, utils }) {
      if (!inputs.src) {
        return utils.build.failPlugin('No pluginConfig.src found')
      }
      try {
        fs.readdirSync(path.join(__dirname, '../../', inputs.src))
          .filter(isJavaScript)
          .map(withPath(inputs))
          .forEach(minifyFile(inputs))
      } catch (error) {
        utils.build.failPlugin('Failed to minify assets with terser', error)
      }
    },
  }
}

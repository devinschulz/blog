const terser = require('terser')
const path = require('path')
const fs = require('fs')

function minifyFile(file) {
  try {
    const contents = fs.readFileSync(file, 'utf8')
    const result = terser.minify(contents)
    fs.writeFileSync(file, result.code, 'utf8')
  } catch (error) {
    console.error('Failed to read and write file', file, error)
  }
}

function isJavaScript(file) {
  return path.extname(file) === '.js'
}

function withPath(file) {
  return path.join(__dirname, '../public/js', file)
}

fs.readdir(path.join(__dirname, '../public/js'), (err, files) => {
  if (err) throw new Error('Unable to parse directory /public/js', err)
  files
    .filter(isJavaScript)
    .map(withPath)
    .forEach(minifyFile)
})

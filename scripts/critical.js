const glob = require('glob')
const path = require('path')
const critical = require('critical')
const fs = require('fs')

const assets = require(path.join(__dirname, '../site/data/webpack.json'))
const root = path.join(__dirname, '../dist')
const cssPath = path.join(__dirname, '../dist', assets.main.css)

glob(path.join(__dirname, '../dist/**/*.html'), {}, (err, files) => {
  files.forEach(async file => {
    const result = await critical.generate({
      base: 'dist/',
      inline: true,
      minify: true,
      src: path.relative(root, file),
      css: [path.relative(path.join(__dirname, '../'), cssPath)],
      dimensions: [
        {
          height: 500,
          width: 320,
        },
        {
          height: 900,
          width: 768,
        },
        {
          height: 900,
          width: 992,
        },
      ],
    })
    fs.writeFileSync(file, result, err => {
      if (err) throw err
    })
  })
})

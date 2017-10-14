const atImport = require('postcss-import')
const cssnano = require('cssnano')
const cssnext = require('postcss-cssnext')
const gulp = require('gulp')
const lost = require('lost')
const plumber = require('gulp-plumber')
const postcss = require('gulp-postcss')
const precss = require('precss')

const { isProduction } = require('./env')

const plugins = [
  atImport(),
  lost(),
  precss(),
  cssnext({
    browsers: '> 1%, last 2 versions, Firefox ESR, Opera 12.1, not ie <= 10'
  })
]

if (isProduction) {
  plugins.push(cssnano())
}

gulp.task('css', () =>
  gulp.src('src/styles/main.css')
  .pipe(plumber())
  .pipe(postcss(plugins))
  .pipe(gulp.dest('./static'))
)

const atImport = require('postcss-import')
const cssnano = require('cssnano')
const cssnext = require('postcss-cssnext')
const gulp = require('gulp')
const postcss = require('gulp-postcss')
const precss = require('precss')
const plumber = require('gulp-plumber')

const plugins = [
  atImport(),
  precss(),
  cssnext()
]

if (process.env.NODE_ENV === 'production') {
  plugins.push(cssnano())
}

gulp.task('css', () =>
  gulp.src('src/styles/main.css')
  .pipe(plumber())
  .pipe(postcss(plugins))
  .pipe(gulp.dest('./static'))
)

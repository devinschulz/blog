const gulp = require('gulp')
const plumber = require('gulp-plumber')
const postcss = require('gulp-postcss')
const sass = require('gulp-sass')
const eyeglass = require('eyeglass')

const { isProduction } = require('./env')

const plugins = [
  require('postcss-cssnext')({
    browsers: '> 1%, last 2 versions, Firefox ESR, Opera 12.1, not ie <= 10',
  }),
  // require('css-mqpacker')(),
]

if (isProduction) {
  plugins.push(require('cssnano')())
}

const sassOptions = {
  eyeglass: {},
}

gulp.task('scss', () =>
  gulp
    .src('src/styles/main.scss')
    .pipe(plumber())
    .pipe(sass(eyeglass(sassOptions)).on('error', sass.logError))
    .pipe(postcss(plugins))
    .pipe(gulp.dest('./static'))
)

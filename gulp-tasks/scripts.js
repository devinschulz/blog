const gulp = require('gulp')
const browserify = require('browserify')
const babelify = require('babelify')
const source = require('vinyl-source-stream')
const buffer = require('vinyl-buffer')
const uglify = require('gulp-uglify')
const gulpIf = require('gulp-if')
const envify = require('envify/custom')

const { isProduction } = require('./env')

gulp.task('scripts', () => {
  return browserify({ entries: './src/js/main.js', debug: true })
    .transform(
      envify({
        NODE_ENV: isProduction ? 'production' : 'development',
      })
    )
    .transform('babelify', { presets: ['es2015'] })
    .bundle()
    .pipe(source('scripts.js'))
    .pipe(buffer())
    .pipe(gulpIf(isProduction, uglify()))
    .pipe(gulp.dest('static'))
})

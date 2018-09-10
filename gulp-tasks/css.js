const gulp = require('gulp')
const purgecss = require('gulp-purgecss')

gulp.task('css', () =>
  gulp
    .src('public/**/*.css')
    .pipe(
      purgecss({
        content: ['public/**/*.html'],
        whitelist: ['fonts-loaded', 'theme-dark'],
      })
    )
    .pipe(gulp.dest('public/'))
)

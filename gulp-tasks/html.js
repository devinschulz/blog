const gulp = require('gulp')
const htmlMin = require('gulp-htmlmin')

gulp.task('html', () =>
  gulp
    .src('public/**/*.html')
    .pipe(
      htmlMin({
        collapseWhitespace: true,
      })
    )
    .pipe(gulp.dest('public'))
)

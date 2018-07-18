const gulp = require('gulp')

gulp.task('watch', ['default'], () => {
  gulp.watch('assets/js/**/*.js', ['scripts'])
})

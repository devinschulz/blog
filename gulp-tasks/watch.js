const gulp = require('gulp')

gulp.task('watch', ['default'], () => {
  gulp.watch('assets/styles/**/*.css', ['css'])
  gulp.watch('assets/js/**/*.js', ['scripts'])
})

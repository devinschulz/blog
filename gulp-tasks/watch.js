const gulp = require('gulp')

gulp.task('watch', ['default'], () => {
  gulp.watch('assets/styles/**/*.scss', ['scss'])
  gulp.watch('assets/js/**/*.js', ['scripts'])
})

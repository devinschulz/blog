const gulp = require('gulp')

gulp.task('watch', ['default'], () => {
  gulp.watch('src/styles/**/*.scss', ['scss'])
  gulp.watch('src/js/**/*.js', ['scripts'])
})

const gulp = require('gulp')

gulp.task('watch', () => {
  gulp.watch('src/styles/**/*.css', ['css'])
})

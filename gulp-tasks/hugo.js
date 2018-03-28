const gulp = require('gulp')
const execSync = require('child_process').execSync

gulp.task('hugo', () => {
  execSync('hugo', { stdio: 'inherit' })
})

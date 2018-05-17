const gulp = require('gulp')

gulp.task('netlify', ['scss', 'scripts', 'generate-service-worker'])

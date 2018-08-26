const gulp = require('gulp')

gulp.task('post-process', ['html', 'css', 'generate-service-worker'])

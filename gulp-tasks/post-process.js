const gulp = require('gulp')

gulp.task('post-process', ['html', 'css:post', 'generate-service-worker'])

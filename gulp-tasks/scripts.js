const babel = require('gulp-babel')
const concat = require('gulp-concat')
const gulp = require('gulp')
const gulpIf = require('gulp-if')
const uglify = require('gulp-uglify')

const { isProduction } = require('./env')

gulp.task('scripts', () => {
  gulp.src('src/js/**/*.js')
    .pipe(babel())
    .pipe(concat('scripts.js'))
    .pipe(gulpIf(isProduction, uglify()))
    .pipe(gulp.dest('static'))
})

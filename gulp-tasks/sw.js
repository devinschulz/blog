const gulp = require('gulp')
const gulpIf = require('gulp-if')
const path = require('path')
const uglify = require('gulp-uglify')
const workbox = require('workbox-build')

const pkg = require('../package.json')
const { isProduction } = require('./env')

const dist = path.join(__dirname, '../public')

const writeServiceWorker = (handleFetch, callback) => {
  return workbox
    .generateSW({
      globDirectory: dist,
      globPatterns: ['**/*.{html,css,js,woff,woff2,jpeg,jpg,png}'],
      swDest: `${dist}/service-worker.js`,
      clientsClaim: true,
      skipWaiting: true,
    })
    .then(({ warnings }) => {
      for (const warning of warnings) {
        log.warn(warning)
      }
      log.info('Service worker generation complete')
      callback()
    })
    .catch(error => {
      log.error('Service worker failed to generate', error)
    })
}

gulp.task('service-worker', callback =>
  workbox
    .generateSW({
      globDirectory: dist,
      globPatterns: ['**/*.{html,css,js,woff,woff2,jpeg,jpg,png}'],
      swDest: `${dist}/service-worker.js`,
      clientsClaim: true,
      skipWaiting: true,
    })
    .then(({ warnings }) => {
      for (const warning of warnings) {
        console.warn(warning)
      }
      console.info('Service worker generation complete')
    })
    .catch(error => {
      console.warn('Service worker failed to generate', error)
    })
)

gulp.task('generate-service-worker', ['service-worker'], () => {
  gulp
    .src('public/service-worker.js')
    .pipe(gulpIf(isProduction, uglify()))
    .pipe(gulp.dest('./public'))
})

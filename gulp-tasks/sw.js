const gulp = require('gulp')
const path = require('path')
const swPrecache = require('sw-precache')
const fancyLog = require('fancy-log')

const pkg = require('../package.json')

const writeServiceWorker = (handleFetch, callback) => {
  const serviceWorkerFile = path.join(publicDir, 'service-worker.js')
  return swPrecache.write(
    serviceWorkerFile,
    {
      staticFileGlobs: [
        `/`,
        `/images/icons/favicon.ico`,
        `/*.html`,
        `/**/*.html`,
        `/*.css`,
        `/*.js`,
        `/fonts/**/*.{woff,woff2}`,
        `/images/about/*.{jpg,jpeg,png}`,
      ],
      runtimeCaching: [
        {
          default: 'networkFirst',
        },
      ],
      handleFetch,
      cacheId: pkg.name,
      dontCacheBustUrlsMatching: /./,
      logger: fancyLog,
      verbose: true,
    },
    callback
  )
}

gulp.task('generate-service-worker-dev', callback => {
  writeServiceWorker(false, callback)
})

gulp.task('generate-service-worker', callback => {
  writeServiceWorker(true, callback)
})

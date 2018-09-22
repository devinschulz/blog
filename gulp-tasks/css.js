const gulp = require('gulp')
const purgecss = require('gulp-purgecss')
const path = require('path')
const plumber = require('gulp-plumber')
const postcss = require('gulp-postcss')
const tailwind = require('tailwindcss')

const { isProduction } = require('./env')

const plugins = [
  require('postcss-import')(),
  require('postcss-nested')(),
  require('tailwindcss')(path.join(__dirname, '../tailwind.config.js')),
  require('css-mqpacker')({
    sort: true,
  }),
  require('autoprefixer')({
    browsers: ['last 2 versions', '> 1%'],
  }),
  require('postcss-preset-env')(),
]

if (isProduction) {
  plugins.push(
    require('cssnano')({
      preset: [
        'default',
        {
          discardComments: {
            removeAll: true,
          },
        },
      ],
    })
  )
}

gulp.task('css', () =>
  gulp
    .src('assets/styles/main.css')
    .pipe(plumber())
    .pipe(postcss(plugins))
    .pipe(gulp.dest('assets'))
)

gulp.task('css:post', () =>
  gulp
    .src('public/**/*.css')
    .pipe(
      purgecss({
        content: ['public/**/*.html'],
      })
    )
    .pipe(gulp.dest('public/'))
)

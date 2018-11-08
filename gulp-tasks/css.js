const gulp = require('gulp')
const purgecss = require('gulp-purgecss')
const path = require('path')
const plumber = require('gulp-plumber')
const postcss = require('gulp-postcss')
const tailwind = require('tailwindcss')

// Custom PurgeCSS extractor for Tailwind that allows special characters in
// class names.
//
// https://github.com/FullHuman/purgecss#extractor
class TailwindExtractor {
  static extract(content) {
    return content.match(/[A-Za-z0-9-_:\/]+/g) || []
  }
}

gulp.task('css', () =>
  gulp
    .src('assets/styles/main.css')
    .pipe(plumber())
    .pipe(
      postcss([
        require('postcss-import')(),
        require('postcss-nested')(),
        require('tailwindcss')(path.join(__dirname, '../tailwind.config.js')),
        require('postcss-preset-env')({
          autoprefixer: { grid: true },
          browsers: 'last 2 versions, > 1%',
          stage: 0,
        }),
        require('css-mqpacker')({
          sort: true,
        }),
      ])
    )
    .pipe(gulp.dest('assets'))
)

gulp.task('css:post', () =>
  gulp
    .src('public/**/*.css')
    .pipe(
      purgecss({
        content: ['public/**/*.html'],
        extractors: [
          {
            extractor: TailwindExtractor,
            extensions: ['html'],
          },
        ],
        whitelist: ['liked', 'h4', 'h5', 'h6'],
      })
    )
    .pipe(
      postcss([
        require('cssnano')({
          preset: [
            'default',
            {
              discardComments: {
                removeAll: true,
              },
            },
          ],
        }),
      ])
    )
    .pipe(gulp.dest('public/'))
)

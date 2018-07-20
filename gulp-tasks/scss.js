const gulp = require('gulp')
const plumber = require('gulp-plumber')
const postcss = require('gulp-postcss')
const sass = require('gulp-sass')
const eyeglass = require('eyeglass')

const { isProduction } = require('./env')

const plugins = [
  require('css-mqpacker')({
    sort: true,
  }),
  require('autoprefixer')({
    browsers: ['last 2 versions', '> 1%'],
  }),
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

const sassOptions = {
  eyeglass: {},
}

gulp.task('scss', () =>
  gulp
    .src('src/styles/main.scss')
    .pipe(plumber())
    .pipe(sass(eyeglass(sassOptions)).on('error', sass.logError))
    .pipe(postcss(plugins))
    .pipe(gulp.dest('./static'))
)

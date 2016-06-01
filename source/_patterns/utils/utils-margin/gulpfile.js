const gulp = require('gulp')

const postcss = require('gulp-postcss')
const processors = [
  require('postcss-import'),
  require('postcss-url'),
  require('postcss-custom-properties'),
  require('postcss-calc'),
  require('postcss-color-function'),
  require('postcss-custom-media'),
  require('postcss-pseudoelements'),
  require('autoprefixer')
]

gulp.task('css', function() {
  return gulp.src('./src/index.css')
    .pipe(postcss(processors))
    .pipe(gulp.dest('./dist'))
})

const stylelint = require('gulp-stylelint')

gulp.task('stylelint', function() {
  return gulp.src('./src/index.css')
    .pipe(stylelint(
      {
        reporters: [
          {
            formatter: 'string',
            console: true
          }
        ]
      }
    )
  )
})

const svgSprite = require('gulp-svg-sprite');

gulp.task('svg-sprite', function() {
  const config = {
    mode: {
      symbol: {
        render: {
          scss: true
        },
        example: true
      }
    }
  }
  gulp.src('**/*.svg', {cwd: 'source/assets/svg/input'})
    .pipe(svgSprite(config))
    .pipe(gulp.dest('source/assets/svg/output'));
});

/*
 * Watchify bundle
 *
 * SEE: https://github.com/gulpjs/gulp/blob/master/docs/recipes/fast-browserify-builds-with-watchify.md
 */

const watchify = require('watchify')
const browserify = require('browserify')
const source = require('vinyl-source-stream')
const buffer = require('vinyl-buffer')
const gutil = require('gulp-util')
const sourcemaps = require('gulp-sourcemaps')
const _ = {
  assign: require('lodash/assign')
}


// add custom browserify options here
const customOpts = {
  entries: ['./src/index.js'],
  debug: true
};
const opts = _.assign({}, watchify.args, customOpts);
const b = watchify(browserify(opts));

// add transformations here
// i.e. b.transform(coffeeify);

gulp.task('js', bundle); // so you can run `gulp js` to build the file
b.on('update', bundle); // on any dep update, runs the bundler
b.on('log', gutil.log); // output build logs to terminal

function bundle() {
  return b.bundle()
    // log errors if they happen
    .on('error', gutil.log.bind(gutil, 'Browserify Error'))
    .pipe(source('index.js'))
    // optional, remove if you don't need to buffer file contents
    .pipe(buffer())
    // optional, remove if you dont want sourcemaps
    .pipe(sourcemaps.init({loadMaps: true})) // loads map from browserify file
     // Add transformation tasks to the pipeline here.
    .pipe(sourcemaps.write('./')) // writes .map file
    .pipe(gulp.dest('./dist'));
}

/*
 * Lint JS
 */

const standard = require('gulp-standard')

gulp.task('standard', function () {
  return gulp.src(['./src/index.js'])
    .pipe(standard())
    .pipe(standard.reporter('default', {
      breakOnError: true
    }))
})

const gulp = require("gulp");
const babel = require("gulp-babel");
const concat = require("gulp-concat");
const uglify = require("gulp-uglify");
const rename = require("gulp-rename");
const cleanCSS = require("gulp-clean-css");
const del = require("del");
const pump = require("pump");
//Image compression plugins:
const imagemin = require('gulp-imagemin');
const imageminPngQuant = require('imagemin-pngquant');
const imageminJpegRecompress = require('imagemin-jpeg-recompress');

// Paths for tasks:
const paths = {
  styles: {
    src: "src/styles/**/*.css",
    dest: "assets/styles/"
  },
  scripts: {
    src: "src/scripts/**/*.js",
    dest: "assets/scripts/"
  },
  images: {
    src: "src/images/**/*.{png,jpeg,jpg,svg,gif}",
    dest: "assets/images/"
  }
};

//Handle errors with the use of 'pump':
function createErrorHandler(name) {
  return function(err) {
    console.error("Error from " + name + " in gulp task", err.toString());
  };
}

//Clean up old files that are to be rebuilt:
function clean() {
  return del([ 'assets' ]);
}

//Scripts concat and compression:
function scripts() {
  return gulp
    .src(paths.scripts.src, { sourcemaps: true })
    .on("error", createErrorHandler("gulp.src"))
    .pipe(babel())
    .on("error", createErrorHandler("babel"))
    .pipe(uglify())
    .on("error", createErrorHandler("uglify"))
    .pipe(concat("main.min.js"))
    .on("error", createErrorHandler("concat"))
    .pipe(gulp.dest(paths.scripts.dest))
    .on("error", createErrorHandler("gulp.dest"));
}

//Styles compression:
function styles() {
  return gulp
    .src(paths.styles.src, { sourcemaps: true })
    .pipe(cleanCSS())
    .pipe(
      rename({
        basename: "styles"
      })
    )
    .pipe(gulp.dest(paths.styles.dest));
}

//Image compression (lossy and lossless):
function images() {
  return gulp
    .src(paths.images.src)
    .on("error", createErrorHandler("gulp.src"))
    .pipe(imagemin(
      [
        imagemin.gifsicle(),
        imagemin.jpegtran(),
        imagemin.optipng(),
        imagemin.svgo(),
        imageminPngQuant(),
        imageminJpegRecompress()
      ]
    ))
    .on("error", createErrorHandler("imagemin"))
    .pipe(gulp.dest(paths.images.dest))
    .on("error", createErrorHandler("gulp.dest"));
}

//Watch certain files for changes and other stuff:
function watch() {
  gulp.watch(paths.scripts.src, scripts);
  gulp.watch(paths.styles.src, styles);
}

exports.clean = clean;
exports.images = images;
exports.styles = styles;
exports.scripts = scripts;
exports.watch = watch;

var build = gulp.series(clean, gulp.parallel(styles, images));

gulp.task('build', build);
gulp.task('default', build);
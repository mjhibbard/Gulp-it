const gulp = require("gulp");
const babel = require("gulp-babel");
const concat = require("gulp-concat");
const uglify = require("gulp-uglify");
const rename = require("gulp-rename");
const cleanCSS = require("gulp-clean-css");
const del = require("del");
const pump = require("pump");
const ejs = require("gulp-ejs");

// BrowserSync with "live reload" feature:
const browserSync = require('browser-sync');
const reload = browserSync.reload;

//Image compression plugins:
const imagemin = require('gulp-imagemin');
const imageminPngQuant = require('imagemin-pngquant');
const imageminJpegRecompress = require('imagemin-jpeg-recompress');

// Paths for tasks:
const paths = {
  styles: {
    src: "src/stylesheets/**/*.css",
    dest: "assets/stylesheets/"
  },
  scripts: {
    src: "src/scripts/**/*.js",
    dest: "assets/"
  },
  images: {
    src: "src/images/**/*.{png,PNG,jpeg,jpg,svg,gif}",
    dest: "assets/images/"
  },
  ejs: {
    src: "src/views/**/*.ejs",
    dest: "assets/"
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
  return del([ 'assets/partials', 'assets/stylesheets', 'assets/*.html', 'assets/*.js' ]);
}

//EJS file combine and convert to HTML:
function serveEjs() {
  return gulp
    .src(paths.ejs.src)
    .on("error", createErrorHandler("gulp.src"))
    .pipe(ejs({ msg: "Hello Gulp!"}, {}, { ext: ".html" }))
    .on("error", createErrorHandler("gulp-ejs"))
    .pipe(gulp.dest(paths.ejs.dest))
    .on("error", createErrorHandler("gulp.dest"));
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
    .pipe(concat("app.js")) //name the concat file here
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
        // suffix: ".min"
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

//Serve the files to the browser for development:
function serve() {
  browserSync({
    server: {
      baseDir: 'assets'
    }
  });
  gulp
    .watch(paths.ejs.src, async function watcherEjs (){
      await serveEjs();
      reload();
      return;
    });
  gulp.watch(paths.styles.src, async function watcherStyles (){
      await styles();
      reload();
      return;
    });
  gulp.watch(paths.scripts.src, async function watcherScripts (){
      await scripts();
      reload();
      return;
    });
}

//Watch certain files for changes and other stuff:
function watch() {
  gulp.watch(paths.ejs.src, serveEjs);
  gulp.watch(paths.scripts.src, scripts);
  gulp.watch(paths.styles.src, styles);
}

exports.clean = clean;
exports.serveEjs = serveEjs;
exports.serve = serve;
exports.images = images;
exports.styles = styles;
exports.scripts = scripts;
exports.watch = watch;

var build = gulp.series(clean, gulp.parallel(styles, scripts, serveEjs, serve));

gulp.task('build', build);
gulp.task('default', build);
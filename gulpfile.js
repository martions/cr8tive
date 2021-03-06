var gulp = require('gulp');
var eslint = require('gulp-eslint');
var sass = require('gulp-sass');
var browserSync = require('browser-sync').create();
var useref = require('gulp-useref');
var uglify = require('gulp-uglify');
var gulpIf = require('gulp-if');
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var cssnano = require('cssnano');
var imagemin = require('gulp-imagemin');
var cleanhtml = require('gulp-cleanhtml');
var del = require('del');
var runSequence = require('run-sequence');

gulp.task('lint', function() {
  return gulp.src(['app/**/*.js', '!app/scripts/vendor/**/*', 'gulpfile.js'])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

gulp.task('sass', function() {
  return gulp.src('app/styles/scss/**/*.scss')
    .pipe(sass())
    .pipe(gulp.dest('app/styles'))
    .pipe(browserSync.reload({
      stream: true
    }));
});

gulp.task('browserSync', function() {
  browserSync.init({
    server: {
      baseDir: 'app'
    }
  });
});

gulp.task('watch', ['browserSync', 'sass', 'lint'], function() {
  gulp.watch(['app/**/*.js', '!app/js/vendor/**/*', 'gulpfile.js'], ['lint']);
  gulp.watch('app/styles/**/*.scss', ['sass']);
  gulp.watch('app/*.html', browserSync.reload);
  gulp.watch('app/scripts/**/*.js', browserSync.reload);
});

gulp.task('useref', function() {
  return gulp.src('app/*.html')
    .pipe(useref())
    .pipe(gulpIf('*.js', uglify()))
    .pipe(gulpIf('*.css', postcss([autoprefixer(), cssnano()])))
    .pipe(cleanhtml())
    .pipe(gulp.dest('dist'));
});

gulp.task('images', function() {
  return gulp.src('app/images/**/*.+(png|jpg|gif|svg)')
    .pipe(imagemin())
    .pipe(gulp.dest('dist/images'));
});

gulp.task('fonts', function() {
  return gulp.src('app/fonts/**/*')
    .pipe(gulp.dest('dist/fonts'));
});

gulp.task('favicon', function() {
  return gulp.src('app/favicon.ico')
    .pipe(gulp.dest('dist'));
});

gulp.task('clean:dist', function() {
  return del.sync('dist');
});

gulp.task('build', function(callback) {
  runSequence('clean:dist', ['sass', 'useref', 'images', 'fonts', 'favicon'], callback);
});

gulp.task('default', function(callback) {
  runSequence(['lint', 'sass', 'browserSync', 'watch'], callback);
});

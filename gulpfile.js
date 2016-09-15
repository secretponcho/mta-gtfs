'use strict';

var gulp = require('gulp');

function stub() {
  console.log('No task defined!');
}

// TODO: modify to concatenate angular scripts or write separate task
gulp.task('browserify', function bundle() {
  var browserify    = require('browserify');
  var bundleStream  = browserify('./public/src/js/index.js').bundle();
  var source        = require('vinyl-source-stream');
  
  return bundleStream
    .pipe(source('bundle.js'))
    .pipe(gulp.dest('./public/dist/js'));
  
});

gulp.task('mocha', stub);
gulp.task('karma', stub);
gulp.task('protractor', stub);

gulp.task('sass', stub);

gulp.task('watch', function() {
  gulp.watch('./public/src/js/index.js', ['scripts']);
});

gulp.task('build', ['browserify', 'watch']);

gulp.task('default', stub);
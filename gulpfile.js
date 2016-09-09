'use strict';

var gulp = require('gulp');

function stub() {
  console.log('No task defined!');
}

gulp.task('scripts', function bundle() {
  var watchify = require('watchify');
  var browserify = require('browserify');
  
  var bundleStream = watchify(browserify('./public/src/js/index.js')).bundle();
  
  var source      = require('vinyl-source-stream'),
      streamify   = require('gulp-streamify'),
      uglify      = require('gulp-uglify'),
      rename      = require('gulp-rename')
  
  bundleStream
    .pipe(source('index.js'))
    .pipe(streamify(uglify()))
    .pipe(rename('bundle.js'))
    .pipe(gulp.dest('./public/dist/js'));
  
});

gulp.task('build', ['scripts']);

gulp.task('default', stub());
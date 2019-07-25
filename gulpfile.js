/*
Author: Jorge H. Pirela D.
Author Website: http://jorgepirela.com
Author Github: https://github.com/webjp1
Github Repo: https://github.com/webjp1/gulpfile.js
README: https://github.com/webjp1/gulpfile.js/blob/master/README.md
LICENSE: MIT License | Copyright (c) 2019 Jorge Pirela
*/ 

/* Dependencies */

const gulp = require('gulp');
const gutil = require('gulp-util');
const less = require('gulp-less');
const prefix = require('gulp-autoprefixer');
const minifyCSS = require('gulp-clean-css');
const sourcemaps = require('gulp-sourcemaps');
const gulpimagemin = require('gulp-imagemin');
const ts = require('gulp-typescript');

/* Functions */



/* Tasks */

gulp.task('default', function(done){
    console.log('Here');
});
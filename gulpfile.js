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
const watch = require('gulp-watch');
const prefix = require('gulp-autoprefixer');
const minifyCSS = require('gulp-clean-css');
const sourcemaps = require('gulp-sourcemaps');
const gulpimagemin = require('gulp-imagemin');
const ts = require('gulp-typescript');
const inject = require('gulp-inject');
const rename = require('gulp-rename');

/* Objects */

const lessInjectGlobals = {
    starttag: `/* Globals */`,
    endtag: `/* EndGlobals */`,
    relative: true,
    transform: function(filepath) {
        return `@import "${filepath}";`;
    },
    quiet: true,
}
const lessInjectPartials = {
    starttag: `/* Partials */`,
    endtag: `/* EndPartials */`,
    relative: true,
    transform: function(filepath) {
        return `@import "${filepath}";`;
    },
    quiet: true,
}
const lessInjectPages = {
    starttag: `/* Pages */`,
    endtag: `/* EndPages */`,
    relative: true,
    transform: function(filepath) {
        return `@import "${filepath}";`;
    },
    quiet: true,
}
const lessInjectIncludes = {
    starttag: `/* Includes */`,
    endtag: `/* EndIncludes */`,
    relative: true,
    transform: function(filepath) {
        return `@import "${filepath}";`;
    },
    quiet: true,
}

/* Paths */

const assets = `./build/assets/`;
const cssFolder = `${assets}css/`;
/* Less Paths */
const lessFolder = `${assets}less/`
const lessIncludes = `${lessFolder}/includes/*.less`;
const lessPages = `${lessFolder}/pages/*.less`;
const lessPartials = `${lessFolder}/partials/*.less`;
const lessGlobals = [`${lessFolder}/*.less`, `!${lessFolder}/main.less`];
const lessFiles = `${lessFolder}**/*.less`;
const lessMain = `${lessFolder}main.less`;
/* Less Paths */


/* Messages */



/* Functions */


const lessifyAll = () => {
    let target = gulp.src(lessFiles);
    return new Promise(function(resolve, reject) {
        target
            .pipe(sourcemaps.init())
            .on('error', reject)
            .pipe(less({
                paths: [lessFiles],
            }))
            .on('error', reject)
            .pipe(prefix({
                browsers: ['last 99 versions']
            }))
            .on('error', reject)
            .pipe(gulp.dest(cssFolder))
            .pipe(minifyCSS({
                level: {
                    1: {
                        cleanupCharsets: true, // controls `@charset` moving to the front of a stylesheet; defaults to `true`
                        normalizeUrls: true, // controls URL normalization; defaults to `true`
                        optimizeBackground: true, // controls `background` property optimizations; defaults to `true`
                        optimizeBorderRadius: true, // controls `border-radius` property optimizations; defaults to `true`
                        optimizeFilter: true, // controls `filter` property optimizations; defaults to `true`
                        optimizeFont: true, // controls `font` property optimizations; defaults to `true`
                        optimizeFontWeight: true, // controls `font-weight` property optimizations; defaults to `true`
                        optimizeOutline: true, // controls `outline` property optimizations; defaults to `true`
                        removeEmpty: false, // controls removing empty rules and nested blocks; defaults to `true`
                        removeNegativePaddings: true, // controls removing negative paddings; defaults to `true`
                        removeQuotes: true, // controls removing quotes when unnecessary; defaults to `true`
                        removeWhitespace: true, // controls removing unused whitespace; defaults to `true`
                        replaceMultipleZeros: true, // contols removing redundant zeros; defaults to `true`
                        replaceTimeUnits: true, // controls replacing time units with shorter values; defaults to `true`
                        replaceZeroUnits: true, // controls replacing zero values with units; defaults to `true`
                        roundingPrecision: false, // rounds pixel values to `N` decimal places; `false` disables rounding; defaults to `false`
                        selectorsSortingMethod: 'standard', // denotes selector sorting method; can be `'natural'` or `'standard'`, `'none'`, or false (the last two since 4.1.0); defaults to `'standard'`
                        specialComments: 'all', // denotes a number of /*! ... */ comments preserved; defaults to `all`
                        tidyAtRules: true, // controls at-rules (e.g. `@charset`, `@import`) optimizing; defaults to `true`
                        tidyBlockScopes: true, // controls block scopes (e.g. `@media`) optimizing; defaults to `true`
                        tidySelectors: true, // controls selectors optimizing; defaults to `true`,
                        semicolonAfterLastProperty: false, // controls removing trailing semicolons in rule; defaults to `false` - means remove
                    }
                }
            }))
            .on('error', reject)
            .pipe(rename({ extname: '.min.css' }))
            .on('error', reject)
            .pipe(sourcemaps.write('./'))
            .on('error', reject)
            .pipe(gulp.dest(cssFolder))
            .on('end', resolve)
    }).then(function() {
        // Resolve
        gutil.log(gutil.colors.green(`All Less Files Have Been Compiled`));
    }).catch(function(err) {
        gutil.log(gutil.colors.red(`Error: ${err}`));
    });
}
const lessInjectAll = () => {
    let target = gulp.src(lessMain);
    let globals = gulp.src(lessGlobals, { read: false });
    let partials = gulp.src(lessPartials, { read: false });
    let pages = gulp.src(lessPages, { read: false });
    let includes = gulp.src(lessIncludes, { read: false });
    let injecting = () => {
        new Promise(function(resolve, reject) {
            target
                .pipe(inject(globals, lessInjectGlobals))
                .on('error', reject)
                .pipe(gulp.dest(lessFolder))
                .on('end', resolve)
        }).then(function() {
            // Resolve
            gutil.log(gutil.colors.green(`All Global Less Files Have Been Injected`));
        }).catch(function(err) {
            gutil.log(gutil.colors.red(`An Error Occured While Injecting Global Less Files`));
            gutil.log(gutil.colors.red(`Error: ${err}`));
        })
        new Promise(function(resolve, reject) {
            target
                .pipe(inject(partials, lessInjectPartials))
                .on('error', reject)
                .pipe(gulp.dest(lessFolder))
                .on('end', resolve)
        }).then(function() {
            // Resolve
            gutil.log(gutil.colors.green(`All Partials Less Files Have Been Injected`));
        }).catch(function(err) {
            gutil.log(gutil.colors.red(`An Error Occured While Injecting Partials Less Files`));
            gutil.log(gutil.colors.red(`Error: ${err}`));
        })
        new Promise(function(resolve, reject) {
            target
                .pipe(inject(pages, lessInjectPages))
                .on('error', reject)
                .pipe(gulp.dest(lessFolder))
                .on('end', resolve)
        }).then(function() {
            // Resolve
            gutil.log(gutil.colors.green(`All Pages Less Files Have Been Injected`));
        }).catch(function(err) {
            gutil.log(gutil.colors.red(`An Error Occured While Injecting Pages Less Files`));
            gutil.log(gutil.colors.red(`Error: ${err}`));
        })
        new Promise(function(resolve, reject) {
            target
                .pipe(inject(includes, lessInjectIncludes))
                .on('error', reject)
                .pipe(gulp.dest(lessFolder))
                .on('end', resolve)
        }).then(function() {
            // Resolve
            gutil.log(gutil.colors.green(`All Includes Less Files Have Been Injected`));
        }).catch(function(err) {
            gutil.log(gutil.colors.red(`An Error Occured While Injecting Includes Less Files`));
            gutil.log(gutil.colors.red(`Error: ${err}`));
        }).then(function() {
            lessifyAll()
        })
    }
    return injecting();
}
const lessInjectOne = (file) => {
    let target = gulp.src(lessMain);
    let toInject = gulp.src(file, { read: false });
    let filePath = file.split('\\');
    let filePathLength = filePath.length - 1;
    let pathToPrint = [];
    let bool = false;
    let injectionOptions;
    let type;
    for (var i = 0; i <= filePathLength; i++) {
        if (`${filePath[i]}` == 'build') {
            bool = true;
        }
        if (bool) {
            pathToPrint.push(`${filePath[i]}`);
        }
    }
    pathToPrint = pathToPrint.join('/');
    /* 
        Debugging
            for (var i = 0; i <= filePathLength; i++) { 
                console.log(
                    `
                    The Position Number ${i} is: ${filePath[i]}
                    `
                ); 
            }
        Debugging
    */
    switch (filePath[filePathLength - 1]) {
        case "includes":
            injectionOptions = {
                starttag: `/* Includes */`,
                endtag: `/* EndIncludes */`,
                relative: true,
                transform: function(filepath) {
                    return `@import "${filepath}";`;
                },
                quiet: true,
            }
            type = `Include`;
            toInject = gulp.src(lessIncludes, { read: false });
            break;
        case "pages":
            injectionOptions = {
                starttag: `/* Pages */`,
                endtag: `/* EndPages */`,
                relative: true,
                transform: function(filepath) {
                    return `@import "${filepath}";`;
                },
                quiet: true,
            }
            type = `Page`;
            toInject = gulp.src(lessPages, { read: false });
            break;
        case "partials":
            injectionOptions = {
                starttag: `/* Partials */`,
                endtag: `/* EndPartials */`,
                relative: true,
                transform: function(filepath) {
                    return `@import "${filepath}";`;
                },
                quiet: true,
            }
            type = `Partial`;
            toInject = gulp.src(lessPartials, { read: false });
            break;
        default:
            injectionOptions = {
                starttag: `/* Globals */`,
                endtag: `/* EndGlobals */`,
                relative: true,
                transform: function(filepath) {
                    return `@import "${filepath}";`;
                },
                quiet: true,
            }
            type = `Global`;
            toInject = gulp.src(lessGlobals, { read: false });
    }
    return new Promise(function(resolve, reject) {
        target
            .pipe(inject(toInject, injectionOptions))
            .on('error', reject)
            .pipe(gulp.dest(lessFolder))
            .on('end', resolve)
    }).then(
        function() {
            // Resolved
            gutil.log(gutil.colors.green(`A New '${type}' Less File Have Been Injected: ./${pathToPrint}`));
        }).catch(function(err) {
        gutil.log(gutil.colors.red(`An Error Occured While Injecting New '${type}' Less File : ./${pathToPrint}`));
        gutil.log(gutil.colors.red(`Error: ${err}`));
    });
}

/* Tasks */

gulp.task('default', function(done) {
    console.log('Here');
    done();
});

gulp.task('inject', function(done) {
    lessInjectAll();
    done();
});
gulp.task('watch-inject', function(done) {
    gulp.src(lessFiles)
        .pipe(watch(lessFiles)).on('add', function(filePath) {
            lessInjectOne(filePath);
        });
});
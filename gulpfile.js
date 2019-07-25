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

const lessInjectAll = () => {
    let target = gulp.src(lessMain);
    let globals = gulp.src(lessGlobals, { read: false });
    let partials = gulp.src(lessPartials, { read: false });
    let pages = gulp.src(lessPages, { read: false });
    let includes = gulp.src(lessIncludes, { read: false });
    return target
        .pipe(inject(globals, lessInjectGlobals))
        .pipe(inject(partials, lessInjectPartials))
        .pipe(inject(pages, lessInjectPages))
        .pipe(inject(includes, lessInjectIncludes))
        .pipe(gulp.dest(lessFolder));
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
            },
            function(err) {
                // Rejected
                gutil.log(gutil.colors.red(`An Error Occured While Injecting New '${type}' Less File : ./${pathToPrint}`));
                gutil.log(gutil.colors.red(err));
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
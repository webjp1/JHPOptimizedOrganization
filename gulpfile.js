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
const gimagemin = require('gulp-imagemin');
const pngquant = require('imagemin-pngquant');
const mozjpeg = require('imagemin-mozjpeg');
const svgo = require('imagemin-svgo');
const webp = require('gulp-webp');
const gifsicle = require('imagemin-gifsicle');
const responsive = require('gulp-responsive');
const ts = require('gulp-typescript');
const inject = require('gulp-inject');
const rename = require('gulp-rename');
const del = require('promised-del');
const injectString = require('gulp-inject-string');
const removeEmptyLines = require('gulp-remove-empty-lines');
const glob = require('glob');
const sizeOf = require('image-size');
const file = require('gulp-file');
const fs = require('fs');
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

const minifyLevelOption = {
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
/* Images Paths */
const imagesFolder = `${assets}images/`
const imagesFiles = `${imagesFolder}*.{jpg,jpeg,png,JPG,PNG,gif,GIF}`;
const compressedImagesFolder = `${imagesFolder}compressed/`;
const jpgsAndPngs = `${compressedImagesFolder}*.{jpg,jpeg,png,JPG,PNG}`;


/* Functions */

const buildPictureTag = (fileArray) => {
    return new Promise(function(resolve, reject) {
        let ArrayLength = fileArray.length - 1;
        let cookedImageArray = [];
        let counter = 0;
        let sources = [];
        for (counter = 0; counter <= ArrayLength; counter++) {
            let ActualImage = fileArray[counter];
            let actualImageNameArray = ActualImage.split('/');
            let actualImageName = actualImageNameArray[actualImageNameArray.length - 1];
            let actualImageNameNoExtArray = actualImageName.split('.');
            let actualImageNameNoExt = actualImageNameNoExtArray[0];
            let actualImageExt = actualImageNameNoExtArray[1];
            let actualImageWebpName = `${actualImageNameNoExt}.webp`;
            cookedImageArray.push(actualImageName);
            cookedImageArray.push(actualImageWebpName);
            let originalImageSize = getImageSize(`${ActualImage}`);
            let mainSourceWebp = `<source media="(min-width: ${originalImageSize.width}px)" srcset="${compressedImagesFolder.replace('/build','')}${actualImageWebpName}" type="image/webp">`;
            let mainSource = `<source media="(min-width: ${originalImageSize.width}px)" srcset="${compressedImagesFolder.replace('/build','')}${actualImageName}" type="image/${actualImageExt}">`;
            sources.push(mainSourceWebp);
            sources.push(mainSource);
            let secondCounter = 90;
            for (secondCounter = 90; secondCounter >= 5; secondCounter -= 5) {
                let folderToLookAt = `${compressedImagesFolder}size-${secondCounter}/`;
                let imageSize;
                if (actualImageExt.toLowerCase() != 'png') {
                    ImageSize = getImageSize(`${folderToLookAt}${actualImageNameNoExt}.jpeg`);
                } else {
                    ImageSize = getImageSize(`${folderToLookAt}${actualImageName}`);
                }
                let sizedSourceWebp = ` <source media="(min-width: ${ImageSize.width}px)" srcset="${folderToLookAt.replace('/build','')}${actualImageWebpName}" type="image/webp">`;
                let sizedSource;
                if (actualImageExt.toLowerCase() != 'png') {
                    sizedSource = ` <source media="(min-width: ${ImageSize.width}px)" srcset="${folderToLookAt.replace('/build','')}${actualImageName}" type="image/jpeg">`;
                } else {
                    sizedSource = ` <source media="(min-width: ${ImageSize.width}px)" srcset="${folderToLookAt.replace('/build','')}${actualImageName}" type="image/${actualImageExt}">`;
                }
                sources.push(sizedSourceWebp);
                sources.push(sizedSource);
            }
            let realSourceTags = sources.join("\r\n\t\t");
            let realImgTag = `<img src="${compressedImagesFolder.replace('/build','')}${actualImageName}" alt="{{ Add Your Alt Text Here }}" title="{{ Add Your Title Text Here }}" />`;
            let pictureTag =
                `
                <picture>
                    ${realSourceTags}
                    ${realImgTag}
                </picture>
            `;
            fs.writeFile(`${imagesFolder}exampleFiles/${actualImageNameNoExt}.html`, `${pictureTag}`, function(err) {
                if (err) {
                    gutil.log(gutil.colors.red(`Error Creating Example File For Image ${actualImageName}: ${err}`));
                } else {
                    gutil.log(gutil.colors.green(`Image Example File for ${actualImageName} Created`));
                }
            });
            sources = [];
        }
        resolve;
    }).then(function() {
        // Resolve
        gutil.log(gutil.colors.green(`Images Pictures Examples have Been Created`));
    }).catch(function(err) {
        // Reject
        gutil.log(gutil.colors.red(`Error in Picture Tag Build : ${err}`));
    });
}
const getImageSize = (imagePath) => {
    let size = sizeOf(imagePath);
    /*sizeOf(imagePath, function(err, dimensions) {
        if (err) {
            gutil.log(gutil.colors.red(`Error in Picture Tag Build : ${err}`));
        }
        size = dimensions.width;
    });*/
    return size;
}
const toWebp = () => {
    return new Promise(function(resolve, reject) {
        let pathToUse = `${compressedImagesFolder}**/*.{jpg,jpeg,png,JPG,PNG}`;
        let mainPath = `${compressedImagesFolder}*.{jpg,jpeg,png,JPG,PNG}`;
        let target = gulp.src(pathToUse);
        let fileArray = glob.sync(mainPath);
        gutil.log(gutil.colors.blue(`Starting Image To Webp Conversion`));
        target
            .pipe(webp())
            .on('error', reject)
            .pipe(gulp.dest(compressedImagesFolder))
            .on('end', resolve(fileArray))
    }).then(function(fileArray) {
        // Resolve
        buildPictureTag(fileArray);
        gutil.log(gutil.colors.green(`Images Have Been Turned into Webp.`));
    }).catch(function(err) {
        //Reject
        gutil.log(gutil.colors.red(`Error in Webp Transformation : ${err}`));
    });
}

const cleanMain = () => {
    return new Promise(function(resolve, reject) {
        gulp.src(lessMain)
            .pipe(removeEmptyLines())
            .on('error', reject)
            .pipe(gulp.dest(lessFolder))
            .on('end', resolve)
    }).then(function() {
        gutil.log(gutil.colors.blue(`Main Less Line Cleaning Successfull`));
    }).catch(function(err) {
        gutil.log(gutil.colors.red(`Error in Main Less Line Cleaning : ${err}`));
    });
}
const beutifyPath = (filePath, filePathLength) => {
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
    let beautiPath = [];
    let bool = false;
    let thePath = filePath;
    let theLength = filePathLength;
    for (var i = 0; i <= theLength; i++) {
        if (`${thePath[i]}` == 'build') {
            bool = true;
        }
        if (bool) {
            beautiPath.push(`${filePath[i]}`);
        }
    }
    return beautiPath.join('/');
}
const lessKillTheSons = (file) => {
    let filePath = file;
    filePath = filePath.split('\\');
    let filePathLength = filePath.length - 1;
    let parentFolder = filePath[filePathLength - 1];
    let slash = `/`;
    let noErrors = true;
    if ((parentFolder) == "less") {
        parentFolder = "";
        slash = "";
    }
    let target = filePath[filePathLength];
    target = target.split('.');
    target = target[0];
    let main = `${cssFolder}${parentFolder}${slash}${target}.css`
    let map = `${cssFolder}${parentFolder}${slash}${target}.css.map`;
    let min = `${cssFolder}${parentFolder}${slash}${target}.min.css`;
    let minMap = `${cssFolder}${parentFolder}${slash}${target}.min.css.map`;
    del([main, map, min, minMap]).catch(function(err) {
        noErrors = false;
        gutil.log(gutil.colors.bgRed(`      Error Deleting The Sons Of Less File : ${err}`));
    }).then(function() {
        if (noErrors) {
            gutil.log(gutil.colors.red(`    Son Of Less File Deleted: ${main}`));
            gutil.log(gutil.colors.red(`    Son Of Less File Deleted: ${map}`));
            gutil.log(gutil.colors.red(`    Son Of Less File Deleted: ${min}`));
            gutil.log(gutil.colors.red(`    Son Of Less File Deleted: ${minMap}`));
        }
    });
    return new Promise(function(resolve, reject) {
        let filePathP = file;
        filePathP = filePathP.split('\\');
        let filePathLengthP = filePathP.length - 1;
        let parentFolderP = filePathP[filePathLengthP - 1];
        let slashP = `/`;
        let noErrors = true;
        if ((parentFolder) == "less") {
            parentFolderP = "";
            slashP = "";
        }
        let targetP = filePathP[filePathLengthP];
        targetP = targetP.split('.');
        targetP = targetP[0];
        gulp.src(lessMain)
            .pipe(injectString.replace(`@import "${parentFolderP}${slashP}${targetP}.less";`, ``))
            .on('error', reject)
            .pipe(gulp.dest(`${lessFolder}`))
            .on('end', resolve);
    }).then(function() {
        gutil.log(gutil.colors.red(`    Less File Deleted From Main.less`));
        cleanMain();
    }).catch(function(err) {
        gutil.log(gutil.colors.bgRed(`Error: ${filePath}`));
    });
}
const lessifyAll = () => {
    let target = gulp.src(lessFiles, { base: lessFolder });
    return new Promise(function(resolve, reject) {
        target
            .pipe(sourcemaps.init())
            .on('error', reject)
            .pipe(less())
            .on('error', reject)
            .pipe(prefix({
                browsers: ['last 99 versions']
            }))
            .on('error', reject)
            .pipe(gulp.dest(cssFolder))
            .pipe(minifyCSS({
                level: {
                    1: minifyLevelOption
                }
            }))
            .on('error', reject)
            .pipe(rename(function(path) {
                path.basename = `${path.basename}.min`;
            }))
            .on('error', reject)
            .pipe(sourcemaps.write('./'))
            .on('error', reject)
            .pipe(gulp.dest(cssFolder))
            .on('end', resolve)
    }).then(function() {
        // Resolve
        gutil.log(gutil.colors.green(`Less Files Compiled Without Error`));
    }).catch(function(err) {
        gutil.log(gutil.colors.red(`Error: ${err}`));
    });
}
const lessifyOne = (file) => {
    let target = gulp.src(file);
    let filePath = file.split('\\');;
    let filePathLength = filePath.length - 1;
    let pathToPrint = beutifyPath(filePath, filePathLength);
    let parentFolder = filePath[filePathLength - 1];
    if ((parentFolder) == "less") {
        parentFolder = "";
    }
    return new Promise(function(resolve, reject) {
        target
            .pipe(sourcemaps.init())
            .on('error', reject)
            .pipe(less())
            .on('error', reject)
            .pipe(prefix({
                browsers: ['last 99 versions']
            }))
            .on('error', reject)
            .pipe(gulp.dest(`${cssFolder}${parentFolder}`))
            .pipe(minifyCSS({
                level: {
                    1: minifyLevelOption
                }
            }))
            .on('error', reject)
            .pipe(rename(function(path) {
                path.basename = `${path.basename}.min`;
            }))
            .on('error', reject)
            .pipe(sourcemaps.write('./'))
            .on('error', reject)
            .pipe(gulp.dest(`${cssFolder}${parentFolder}`))
            .on('end', resolve)
    }).then(function() {
        // Resolve
        gutil.log(gutil.colors.green(`The File ${pathToPrint} Have Been Compiled`));
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
    let pathToPrint = beutifyPath(filePath, filePathLength);
    let bool = false;
    let injectionOptions;
    let type;
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
            lessifyAll()
        }).catch(function(err) {
        gutil.log(gutil.colors.red(`An Error Occured While Injecting New '${type}' Less File : ./${pathToPrint}`));
        gutil.log(gutil.colors.red(`Error: ${err}`));
    });
}

const watchLess = () => {
    return gulp.src(lessFiles)
        .pipe(watch(lessFiles)).on('add', function(filePath) {
            let dividedPath = filePath.split('\\');
            let toPrint = beutifyPath(dividedPath, (dividedPath.length - 1));
            gutil.log(gutil.colors.green(`Less File Added : ${toPrint}`));
            lessInjectOne(filePath);
        })
        .pipe(watch(lessFiles)).on('change', function(filePath) {
            let dividedPath = filePath.split('\\');
            let toPrint = beutifyPath(dividedPath, (dividedPath.length - 1));
            gutil.log(gutil.colors.yellow(`Less File Changed : ${toPrint}`));
            lessifyAll();
        })
        .pipe(watch(lessFiles)).on('unlink', function(filePath) {
            let dividedPath = filePath.split('\\');
            let toPrint = beutifyPath(dividedPath, (dividedPath.length - 1));
            gutil.log(gutil.colors.red(`Less File Deleted : ${toPrint}`));
            lessKillTheSons(filePath);
        })
}

const imageResizing = () => {
    let pathToUse = jpgsAndPngs;
    let target = gulp.src(pathToUse);
    let fileArray = glob.sync(pathToUse);
    return new Promise(function(resolve, reject) {
        target.pipe(responsive({
                '*.jpg': { width: '5%', },
                '*.png': { width: '5%' }
            }, {
                quality: 80,
                progressive: true,
                compressionLevel: 6,
                withMetadata: false,
            }))
            .on('error', reject)
            .pipe(gulp.dest(`${compressedImagesFolder}size-5`))
        target.pipe(responsive({
                '*.jpg': { width: '10%' },
                '*.png': { width: '10%' }
            }, {
                quality: 80,
                progressive: true,
                compressionLevel: 6,
                withMetadata: false,
            }))
            .on('error', reject)
            .pipe(gulp.dest(`${compressedImagesFolder}size-10`))
        target.pipe(responsive({
                '*.jpg': { width: '15%' },
                '*.png': { width: '15%' }
            }, {
                quality: 80,
                progressive: true,
                compressionLevel: 6,
                withMetadata: false,
            }))
            .on('error', reject)
            .pipe(gulp.dest(`${compressedImagesFolder}size-15`))
        target.pipe(responsive({
                '*.jpg': { width: '20%' },
                '*.png': { width: '20%' }
            }, {
                quality: 80,
                progressive: true,
                compressionLevel: 6,
                withMetadata: false,
            }))
            .on('error', reject)
            .pipe(gulp.dest(`${compressedImagesFolder}size-20`))
        target.pipe(responsive({
                '*.jpg': { width: '25%' },
                '*.png': { width: '25%' }
            }, {
                quality: 80,
                progressive: true,
                compressionLevel: 6,
                withMetadata: false,
            }))
            .on('error', reject)
            .pipe(gulp.dest(`${compressedImagesFolder}size-25`))
        target.pipe(responsive({
                '*.jpg': { width: '30%' },
                '*.png': { width: '30%' }
            }, {
                quality: 80,
                progressive: true,
                compressionLevel: 6,
                withMetadata: false,
            }))
            .on('error', reject)
            .pipe(gulp.dest(`${compressedImagesFolder}size-30`))
        target.pipe(responsive({
                '*.jpg': { width: '35%' },
                '*.png': { width: '35%' }
            }, {
                quality: 80,
                progressive: true,
                compressionLevel: 6,
                withMetadata: false,
            }))
            .on('error', reject)
            .pipe(gulp.dest(`${compressedImagesFolder}size-35`))
        target.pipe(responsive({
                '*.jpg': { width: '40%' },
                '*.png': { width: '40%' }
            }, {
                quality: 80,
                progressive: true,
                compressionLevel: 6,
                withMetadata: false,
            }))
            .on('error', reject)
            .pipe(gulp.dest(`${compressedImagesFolder}size-40`))
        target.pipe(responsive({
                '*.jpg': { width: '45%' },
                '*.png': { width: '45%' }
            }, {
                quality: 80,
                progressive: true,
                compressionLevel: 6,
                withMetadata: false,
            }))
            .on('error', reject)
            .pipe(gulp.dest(`${compressedImagesFolder}size-45`))
        target.pipe(responsive({
                '*.jpg': { width: '50%' },
                '*.png': { width: '50%' }
            }, {
                quality: 80,
                progressive: true,
                compressionLevel: 6,
                withMetadata: false,
            }))
            .on('error', reject)
            .pipe(gulp.dest(`${compressedImagesFolder}size-50`))
        target.pipe(responsive({
                '*.jpg': { width: '55%' },
                '*.png': { width: '55%' }
            }, {
                quality: 80,
                progressive: true,
                compressionLevel: 6,
                withMetadata: false,
            }))
            .on('error', reject)
            .pipe(gulp.dest(`${compressedImagesFolder}size-55`))
        target.pipe(responsive({
                '*.jpg': { width: '60%' },
                '*.png': { width: '60%' }
            }, {
                quality: 80,
                progressive: true,
                compressionLevel: 6,
                withMetadata: false,
            }))
            .on('error', reject)
            .pipe(gulp.dest(`${compressedImagesFolder}size-60`))
        target.pipe(responsive({
                '*.jpg': { width: '65%' },
                '*.png': { width: '65%' }
            }, {
                quality: 80,
                progressive: true,
                compressionLevel: 6,
                withMetadata: false,
            }))
            .on('error', reject)
            .pipe(gulp.dest(`${compressedImagesFolder}size-65`))
        target.pipe(responsive({
                '*.jpg': { width: '70%' },
                '*.png': { width: '70%' }
            }, {
                quality: 80,
                progressive: true,
                compressionLevel: 6,
                withMetadata: false,
            }))
            .on('error', reject)
            .pipe(gulp.dest(`${compressedImagesFolder}size-70`))
        target.pipe(responsive({
                '*.jpg': { width: '75%' },
                '*.png': { width: '75%' }
            }, {
                quality: 80,
                progressive: true,
                compressionLevel: 6,
                withMetadata: false,
            }))
            .on('error', reject)
            .pipe(gulp.dest(`${compressedImagesFolder}size-75`))
        target.pipe(responsive({
                '*.jpg': { width: '80%' },
                '*.png': { width: '80%' }
            }, {
                quality: 80,
                progressive: true,
                compressionLevel: 6,
                withMetadata: false,
            }))
            .on('error', reject)
            .pipe(gulp.dest(`${compressedImagesFolder}size-80`))
        target.pipe(responsive({
                '*.jpg': { width: '85%' },
                '*.png': { width: '85%' }
            }, {
                quality: 80,
                progressive: true,
                compressionLevel: 6,
                withMetadata: false,
            }))
            .on('error', reject)
            .pipe(gulp.dest(`${compressedImagesFolder}size-85`))
        target.pipe(responsive({
                '*.jpg': { width: '90%' },
                '*.png': { width: '90%' }
            }, {
                quality: 80,
                progressive: true,
                compressionLevel: 6,
                withMetadata: false,
            }))
            .on('error', reject)
            .pipe(gulp.dest(`${compressedImagesFolder}size-90`))
            .on('end', resolve);
    }).then(function() {
        toWebp();
        gutil.log(gutil.colors.blue(`Images have Been Resized To Intervals of 5% of there width.`));
    }).catch(function(err) {
        gutil.log(gutil.colors.red(`Error on the Image Resizing: ${err}`));
    });
}

const compressImages = () => {
    return new Promise(function(resolve, reject) {
        let pathToUse = imagesFiles;
        let target = gulp.src(pathToUse, { allowEmpty: false });
        let fileArray = glob.sync(pathToUse);
        let fileArrayLength = fileArray.length;
        if (fileArrayLength == 0) {
            reject('No Images To Compress');
        }
        target
            .pipe(gimagemin([
                pngquant({
                    quality: [0.6, 0.8],
                    verbose: false
                }),
                mozjpeg({
                    quality: 80,
                    progressive: true,
                }),
                gifsicle({
                    optimizationLevel: 3,
                }),
            ], {
                verbose: false,
            }))
            .on('error', reject)
            .pipe(gulp.dest(compressedImagesFolder))
            .on('end', resolve);
    }).then(function() {
        imageResizing();
        gutil.log(gutil.colors.blue(`Images have Been Compressed`));
    }).catch(function(err) {
        gutil.log(gutil.colors.red(`Error on the Image Compression: ${err}`));
    });
}

/* Tasks */

gulp.task('default', function(done) {
    lessInjectAll();
    cleanMain();
    compressImages();
    done();
});
gulp.task('watch', function(done) {
    watchLess();
    done();
});
gulp.task('less', function(done) {
    lessInjectAll();
    done();
});
gulp.task('watch-less', function(done) {
    watchLess();
    done();
});
'use strict';

var fs = require('fs'),
    del = require('del'),
    gulp = require('gulp'),
    path = require('path'),
    iife = require('gulp-iife'),
    sass = require('gulp-sass'),
    order = require('gulp-order'),
    print = require('gulp-print').default,
    concat = require('gulp-concat'),
    header = require('gulp-header'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    nested = require('postcss-nested'),
    replace = require('gulp-replace'),
    postcss = require('gulp-postcss'),
    cleanCSS = require('gulp-clean-css'),
    sassGlob = require('gulp-sass-glob'),
    mqpacker = require('css-mqpacker'),
    sourcemaps = require('gulp-sourcemaps'),
    autoprefixer = require('autoprefixer'),
    packageJson = require('./package.json');

var version = packageJson.version,
    targetFileName = 'fc.v' + version + '.min';

function withExtension(extension, separator) {
    return function(fileName) {
        return fileName + (separator || '.') + extension;
    };
}

var jsExtension = withExtension('js'),
    cssExtension = withExtension('css'),
    headerTemplate = [
        '/**',
        ' * <%= pkg.name %>',
        ' * @version v<%= pkg.version %>',
        ' * @license <%= pkg.license %>',
        ' * @description <%= pkg.description %>',
        ' */',
        ''
    ].join('\n');

var getFolderPathWithVersion = (function (version) {
    var majorVersion = version.split('.')[0];
    return function (prefixedPath) {
        return path.resolve(__dirname, prefixedPath, 'v' + majorVersion, 'v' + version);
    };
})(version);

var buildConfig = {
    distPath: getFolderPathWithVersion('release'),
    sourceJsPath: getFolderPathWithVersion('scripts'),
    sourceCssPath: getFolderPathWithVersion('styles')
};

function clean() {
    if (!fs.existsSync(buildConfig.distPath))
        fs.mkdirSync(buildConfig.distPath, { recursive: true });

    return del([path.resolve(buildConfig.distPath, './*')]);
}

function concatAllJsFiles() {
    return gulp
        .src([path.resolve(buildConfig.sourceJsPath, './**/*.js')])
        .pipe(
            order([
                'fc.core.js',
                'fc.provider.js',
                '**/*.js'
            ])
        )
        .pipe(print())
        .pipe(concat(jsExtension(targetFileName)))
        .pipe(gulp.dest(buildConfig.distPath));
}

function replaceJsFiles4iife() {
    return gulp
        .src([path.resolve(buildConfig.distPath, './', jsExtension(targetFileName))])
        .pipe(replace('(function(_) {', ''))
        .pipe(replace('})(window);', ''))
        .pipe(replace('<%= version %>', version))
        .pipe(gulp.dest(buildConfig.distPath));
}

function wrapJsFileWithIIFE() {
    return gulp
        .src([path.resolve(buildConfig.distPath, './', jsExtension(targetFileName))])
        .pipe(
            iife({
                useStrict: true,
                trimCode: true,
                prependSemicolon: false,
                bindThis: false,
                params: ['_'],
                args: ['window']
            })
        )
        .pipe(gulp.dest(buildConfig.distPath));
}

function uglifyJs() {
    return gulp
        .src([path.resolve(buildConfig.distPath, './', jsExtension(targetFileName))])
        .pipe(
            uglify({
                mangle: { toplevel: true },
                output: {
                    comments: /^!/
                }
            })
        )
        .pipe(gulp.dest(buildConfig.distPath));
}

function handler4scssFiles() {
    return gulp
        .src([path.resolve(buildConfig.sourceCssPath, './fc.core.scss')])
        .pipe(sassGlob())
        .pipe(sass())
        .pipe(sourcemaps.init())
        .pipe(postcss([autoprefixer, nested, mqpacker]))
        .pipe(cleanCSS({
            compatibility: 'ie10'
        }))
        .pipe(rename(function (path) {
            path.extname = '.css';
            path.basename = targetFileName;
        }))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(buildConfig.distPath));
}

function addCommentInHeader(target) {
    return function addCommentInHeaderMeta () {
        return gulp
            .src([target])
            .pipe(header(headerTemplate, { pkg: packageJson }))
            .pipe(gulp.dest(buildConfig.distPath));
    };
}

var handler4jsFiles = gulp.series(
    concatAllJsFiles,
    replaceJsFiles4iife,
    wrapJsFileWithIIFE,
    uglifyJs,
    addCommentInHeader(path.resolve(buildConfig.distPath, './', jsExtension(targetFileName)))
);
var handler4styleFiles = gulp.series(
    handler4scssFiles,
    addCommentInHeader(path.resolve(buildConfig.distPath, './', cssExtension(targetFileName)))
);
exports.default = gulp.series(
    clean,
    gulp.parallel(handler4jsFiles, handler4styleFiles)
);

/*
* npm install --save-dev gulp-sequence
* npm install --save-dev gulp-chmod
* */

// 获取 gulp
var gulp = require('gulp');// 基础库
let uglify = require('gulp-uglify-es').default;// 获取 uglify 模块（用于压缩 JS）
var rev = require('gulp-rev');// 更改版本名
var revCollector = require('gulp-rev-collector'); // gulp-rev的插件，用于更改页面引用路径
var minifyCSS = require('gulp-minify-css');//  获取 minify-css 模块（用于压缩 CSS）
var imagemin = require('gulp-imagemin');//  获取 gulp-imagemin 模块
var clean = require('gulp-clean');//  清空文件夹
var zip = require('gulp-zip');
var fileinclude = require('gulp-file-include');
var prefix = require('gulp-prefix');
var gulpSequence = require('gulp-sequence');
var rename = require("gulp-rename");
var browserSync = require('browser-sync').create();
var base64 = require('gulp-base64-v2');
const cdnAppend  = require('gulp-cdn-url-append');


var evn = 'dev';

var cdns = {pro: 'https://sm.zzwangjie.com/resources/dy/', dev: '/'};

var selectors = [
    {match: "script[src]", attr: "src"},
    {match: "img[src]", attr: "src"},
    {match: "link[href]", attr: "href"},
    {match: "img[data-ng-src]", attr: "data-ng-src"},
];

//清空文件夹，避免资源冗余
gulp.task("clean", function () {
    return gulp.src('dist').pipe(clean());
});

gulp.task('cleanPackage', function () {
    return gulp.src(['dist/web', 'dist/zip'], {read: false, force: true}).pipe(clean());
});

gulp.task('css', function () {

    if (evn == 'dev') {
        return gulp.src(['web/style/css/**'])        //- 需要处理的css文件，放到一个字符串数组里
            .pipe(gulp.dest('dist/xw-web/style/css'))   //- 输出文件本地
    } else {
        return gulp.src(['web/style/css/**/*.css'])        //- 需要处理的css文件，放到一个字符串数组里
            .pipe(base64({
                maxImageSize: 20 * 1024, // bytes
            }))
            .pipe(minifyCSS())                          //- 压缩处理成一行
            .pipe(rev())                                //- 文件名加MD5后缀
            .pipe(gulp.dest('dist/xw-web/style/css'))   //- 输出文件本地
            .pipe(rev.manifest({
                merge: true
            }))                                         //- 生成一个rev-manifest.json
            .pipe(gulp.dest('rev/css'));
    }
});
gulp.task('js', function () {
    if (evn == 'dev') {
        return gulp.src('web/style/js/*.js')
            .pipe(gulp.dest('dist/xw-web/style/js'))
    } else {
        return gulp.src('web/style/js/*.js')
            .pipe(uglify())//压缩文件
            .pipe(rev())
            .pipe(gulp.dest('dist/xw-web/style/js'))
            .pipe(rev.manifest())
            .pipe(gulp.dest('rev/js'));
    }
});
gulp.task('html', function () {

    var cdnURl = evn == 'dev' ? cdns.dev : cdns.pro;

    if (evn == 'dev') {
        return gulp
            .src('web/**/*.html')
            .pipe(fileinclude({
                prefix: '@@',
                basepath: './web/include'
            }))
            .pipe(gulp.dest('dist/xw-web'));
    } else {
        return gulp
            .src(['rev/**/*.json', 'web/**/*.html'])
            .pipe(fileinclude({
                prefix: '@@',
                basepath: './web/include'
            }))
            .pipe(revCollector({replaceReved: true}))
            .pipe(prefix(cdnURl, selectors))
            .pipe(cdnAppend(cdnURl))
            .pipe(gulp.dest('dist/xw-web'));
    }
});
// 压缩图片任务
// 在命令行输入 gulp images 启动此任务
gulp.task('images', function () {

    if (evn == 'dev') {
        return gulp.src('web/style/img/**')
            .pipe(gulp.dest('dist/xw-web/style/img'))
    } else {
        return gulp.src('web/style/img/**')
        // .pipe(imagemin({
        //     progressive: true
        // }))
            .pipe(gulp.dest('dist/xw-web/style/img'))
    }

});
// move
gulp.task('movefont', function () {
    return gulp.src(
        ['web/style/font/**']
    ).pipe(gulp.dest('dist/xw-web/style/font'));
});

gulp.task('moveplugins', function () {
    return gulp.src(
        ['web/style/plugins/**']
    ).pipe(gulp.dest('dist/xw-web/style/plugins'));
});
gulp.task('move404',['moveLive'], function () {
    return gulp.src(['dist/xw-web/index.html'])
        .pipe(rename('404.html'))
        .pipe(gulp.dest('dist/xw-web/'));
});

gulp.task('moveLive', function () {
    return gulp.src(['web/live'])
        .pipe(gulp.dest('dist/xw-web/'));
});
gulp.task('compile', function (cb) {
    gulpSequence(['js', 'css'], 'html', ['images', 'movefont', 'moveplugins'], 'move404', cb);
})

gulp.task('dev', function () {
    evn = 'dev';
})


gulp.task('pro', function () {
    evn = 'pro';
})


gulp.task('serve', function () {

    browserSync.init({
        server: "./dist/xw-web/"
    });
    gulp.watch(['web/**/*.js'], ['js']).on('change', browserSync.reload);
    gulp.watch(['web/**/*.css'], ['css']).on('change', browserSync.reload);
    gulp.watch(['web/style/img/*'], ['image']).on('change', browserSync.reload);
    gulp.watch(['web/**/*.html'], ['html']).on('change', browserSync.reload);
});


gulp.task('default', function (cb) {
    gulpSequence('clean', 'compile', 'serve', cb);
});

gulp.task('copy_zip', function () {
    return gulp.src('dist/xw-web/**')
        .pipe(gulp.dest('dist/zip/xw-web/xw-web'));
});

gulp.task('clear_style', function () {
    return gulp.src('dist/zip/xw-web/xw-web/style')
        .pipe(clean());
});

gulp.task('zip', function () {
    return gulp.src('dist/zip/xw-web/**',{nodir: true})
        .pipe(zip('xw-web.zip'))
        .pipe(gulp.dest('dist'));
});
gulp.task('package', function (cb) {
    evn = 'pro';
    gulpSequence('clean', 'compile', 'copy_zip','clear_style', 'zip', cb);
});

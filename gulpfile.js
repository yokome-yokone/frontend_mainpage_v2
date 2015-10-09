// gulpfile.js
//gulpをインポートする
var gulp = require('gulp');
//watchで常にファイルの変更を監視する
var watch = require('gulp-watch');
//CSS関連
var sass = require('gulp-sass');
//ベンダープレフィックスを勝手につけてくれる
var autoprefixer = require('gulp-autoprefixer');
//cssを最小化する
var cssmin = require('gulp-cssmin');
var cssconcat = require('gulp-concat');
//CSSプロパティ並び順整理
var csscomb = require('gulp-csscomb');
//ファイルのリネーム
var rename = require('gulp-rename');
//gulpのエラーがあってもgulpを止めない
var plumber = require('gulp-plumber');
//gulpのエラーが出たらデスクトップ通知が来る
var notify = require('gulp-notify');
var webserver = require('gulp-webserver');
//ブラウザを自動更新
var browserSync = require('browser-sync');
//画像を圧縮してweb用にする
var imagemin = require('gulp-imagemin');
//pngを圧縮する
var pngquant = require('imagemin-pngquant');
//前回のgulp実行から変更したファイルだけをフィルタリング
var changed = require('gulp-changed');
//処理したファイルをキャッシュ。次回実行時、変更のないファイルは後のストリームに流れない
var cache = require('gulp-cached');
//リサイズしたファイルをログに流す
var filelog     = require('gulp-filelog'); //fileの進捗を表示する
//jsを圧縮する
var uglify = require('gulp-uglify');
//html
//jadeをhtmlにコンパイルする
var jade = require('gulp-jade');
//htmlをキレイに整形する
var prettify = require('gulp-prettify');
//htmlの構文チェック
var htmlhint = require("gulp-htmlhint");

var paths = {
		app: 'app',
		dest: 'dist'
};

//html
gulp.task('jade', function() {
		gulp.src('app/jade/*.jade')
			.pipe(jade())
			.pipe(htmlhint())
			.pipe(prettify({indent_size:2}))
			.pipe(gulp.dest('dist/'));
});




//watch
gulp.task('watch',function() {
	gulp.watch('app/styles/*.scss',['sass']);
	gulp.watch('dist/styles/*.css', ['autoprefixer','cssmin','bs-reload']);
	gulp.watch('app/*.html',['copy','bs-reload']);
	gulp.watch('app/images/*',['imagemin']);
	gulp.watch('app/js/*.js', ['uglify','bs-reload']);
	gulp.watch('app/js/lib/*.js',['uglify-lib','bs-reload']);
	gulp.watch('app/jade/*.jade',['jade','bs-reload']);
});

//Browsing------------------------------------------------------------------------
//serve
gulp.task('serve', function() {
	gulp.src('app/')
		.pipe(webserver({
			livereload: true,
			directoryListening: true,
			open: true,
			port: 1111
		}));
});

//browserSync
gulp.task('browser-sync', function() {
	browserSync({
		port: 1234,
		server: {
			baseDir: paths.dest
		},
		ghostMode: {
			location: true
		}
	});
});

// Reload all Browsers
gulp.task('bs-reload', function () {
	browserSync.reload();
});

//image-----------------------------------------------------------------------------
//imagemin
gulp.task('imagemin', function() {
	gulp.src('app/images/*')
		.pipe(plumber({
		  errorHandler: notify.onError("Error: <%= error.message %>")
		 }))
		// .pipe(changed('app/images'))
		.pipe(imagemin({
			progressive: true,
			svgoPlugins: [{removeViewBox: false}],
			use: [pngquant()],
			optimizationLevel:7
		}))
		.pipe(gulp.dest('dist/images'));
});

//copy（なんかhtmlを外から持ってきたりした時）
gulp.task('copy', function() {
	gulp.src('./app/*.html')
		.pipe(gulp.dest('./dist'));
});

//css----------------------------------------------------------------------
//sass
gulp.task('sass', function() {
	gulp.src('app/styles/*.scss')
	.pipe(plumber({
		errorHandler: notify.onError("Error: <%= error.message %>")
	 }))
	.pipe(sass())
	.pipe(gulp.dest('dist/styles/'));
});
//autoprefxer
gulp.task('autoprefixer', function() {
	return gulp.src('dist/styles/*.css')
		.pipe(autoprefixer());
});

//cssmin
gulp.task('cssmin',function() {
	gulp.src('dist/styles/*.css')
	.pipe(csscomb())
	.pipe(cssmin())
	.pipe(rename({suffix: '.min'}))
	.pipe(cssconcat("last.css"))
	.pipe(gulp.dest('dist/styles/cssmin'));
});

//js----------------------------------------------------------------------
//uglify  jsを圧縮
gulp.task('uglify', function() {
	gulp.src('app/js/*.js')
		.pipe(uglify())
		.pipe(rename({suffix: '.min'}))
		.pipe(gulp.dest('dist/js/min'));
});

gulp.task('uglify-lib', function() {
	gulp.src('app/js/lib/*.js')
		.pipe(uglify())
		.pipe(rename({suffix: '.min'}))
		.pipe(gulp.dest('dist/js/min/lib'));
});

//gulp本来のタスクを登録する
gulp.task('default', ['watch','serve','browser-sync', 'imagemin']);

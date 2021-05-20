

var gulp = require('gulp');

less = require('gulp-less');
// var postcss = require('gulp-postcss');
// var pxtoviewport = require('postcss-px-to-viewport');
const path = require('path')

/**
 * 新加的包
 */
const filename = path.resolve(); //获取当前项目根路径
const connect = require('gulp-connect');//浏览器自动监听
const watch = require('gulp-watch');
const babel = require("gulp-babel")
const gulpSequence = require('gulp-sequence')  //同步执行文件

//获取当前ip
function getIPAdress(){
  var interfaces = require('os').networkInterfaces();
  for(var devName in interfaces){
    var iface = interfaces[devName];
    for(var i=0;i<iface.length;i++){
      var alias = iface[i];
      if(alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal){
        console.log(alias.address)
        return alias.address;
      }
    }
  }
}

//修改index.css即可
// gulp.task('css', function (done) {
//     gulp.src(`${filename}/acc/static/css/index.less`)
//     .pipe(less())
//         .pipe(postcss([pxtoviewport({
//             viewportWidth: 1920,
//             viewportUnit: 'vw',
//             selectorBlackList:['ld','point']
//         })]))

//         .pipe(gulp.dest(`${filename}/dev/static/css/`));
//     done()
// });
gulp.task('css',()=>{
	return gulp.src(`${filename}/acc/static/css/*.css`)
	           .pipe(gulp.dest(`${filename}/dev/static/css/`))
	           .pipe(connect.reload())
});
gulp.task('js',()=>{
	return gulp.src(`${filename}/acc/static/js/*.js`)
             	// .pipe(babel())
            	.pipe(gulp.dest(`${filename}/dev/static/js/`))
            	.pipe(connect.reload())
});
gulp.task('img',()=>{
	return gulp.src(`${filename}/acc/static/img/*.{jpg,png,gif}`)
	           .pipe(gulp.dest(`${filename}/dev/static/img/`))
	           .pipe(connect.reload())
});
gulp.task('html',()=>{
  console.log('我得页面');
	return gulp.src(`${filename}/acc/*.html`)
	           .pipe(gulp.dest(`${filename}/dev/`))
	           .pipe(connect.reload())
})

// 打dev包
// gulp.task('dev',gulpSequence('js'));
//实时监听
gulp.task('connect', function(cb) {
  connect.server({
     host: getIPAdress(), //地址，可不写，不写的话，默认localhost
     // port: 8000, //端口号，可不写，默认8000
      root: `${filename}/dev`, //当前项目主目录
      livereload: true //自动刷新
  });
  cb();
});
// // 监听页面修改
gulp.task('watchs',()=>{
	gulp.watch(`${filename}/acc/static/css/index.less`,gulp.series('css'));
	gulp.watch(`${filename}/acc/static/js/*.js`,gulp.series('js'));
	gulp.watch(`${filename}/acc/*.html`,gulp.series('html'));
	gulp.watch(`${filename}/acc/img/*.*`,gulp.series('img'));
})
gulp.task('dev',gulp.series('connect','watchs'));
gulp.task('build',gulp.series('css','js','html','img'));


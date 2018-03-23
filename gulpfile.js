var gulp = require('gulp');
var less = require('gulp-less');
var minifyCSS = require('gulp-csso');

gulp.task('css', function(){
  return gulp.src('./public/less/*.less')
    .pipe(less())
    .on('error', function(e) {
      console.log(e);
      this.emit('end');
    })
    // .pipe(minifyCSS())
    .pipe(gulp.dest('./public/css'))
});

gulp.task('css.1', function(){
  return gulp.src('./public/less.1/*.less')
    .pipe(less())
    .on('error', function(e) {
      console.log(e);
      this.emit('end');
    })
    // .pipe(minifyCSS())
    .pipe(gulp.dest('./public/css.1'))
});

gulp.task('default', [ 'css', 'css.1' ]);

gulp.task('develop', function() {
  gulp.watch('./public/less/**/*.less', ['css']);
  gulp.watch('./public/less.1/**/*.less', [ 'css.1' ]);
});

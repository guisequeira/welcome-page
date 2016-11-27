var gulp          = require('gulp');
var compass       = require('gulp-compass');
var path          = require('path');
var useref        = require('gulp-useref');
var uglify        = require('gulp-uglify');
var gulpIf        = require('gulp-if');
var minifyCSS     = require('gulp-minify-css');
var imagemin      = require('gulp-imagemin');
var cache         = require('gulp-cache');
var del           = require('del');
var runSequence   = require('run-sequence');
var browserSync   = require('browser-sync').create();
var coffee        = require('gulp-coffee');
var gutil         = require('gulp-util');
var coffeelint    = require('gulp-coffeelint')
var coffeeStream  = coffee({bare: true});


gulp.task('coffee', function() {
  gulp.src('./src/app/coffee/**/*.coffee', browserSync.reload)
    .pipe(coffeelint())
    .pipe(coffee({bare: true}).on('error', gutil.log))
    .pipe(gulp.dest('./src/assets/js'));
});

// useref
gulp.task('useref', function(){
  return gulp.src('src/*.html')
    .pipe(useref())
    .pipe(gulpIf('*.js', uglify()))
    .pipe(gulpIf('*.css', minifyCSS()))
    .pipe(gulp.dest('dist'))
});

// sass
gulp.task('compass', function() {
  gulp.src('./src/app/scss/*.scss')
    .pipe(compass({
      http_path: '/',
      css: 'src/assets/css',
      sass: 'src/app/scss',
      image: 'src/assets/images',
      font: 'src/assets/fonts',
      relative_assets: true
    }))
    .pipe(browserSync.reload({stream:true}))
    .pipe(gulp.dest('src/assets/css'));
});

// images
gulp.task('images', function(){
  return gulp.src('src/assets/images/**/*.+(png|jpg|jpeg|gif|svg)')
  .pipe(cache(imagemin({
      interlaced: true
    })))
  .pipe(gulp.dest('dist/assets/images'))
});

// fonts
gulp.task('fonts', function() {
  return gulp.src('src/assets/fonts/**/*')
  .pipe(gulp.dest('dist/assets/fonts'))
})

// clean:dist
gulp.task('clean:dist', function() {
  return del.sync('dist');
})

gulp.task('serve:dist', function (callback) {
  runSequence('clean:dist', 
    ['compass', 'coffee', 'useref', 'images', 'fonts', 'browserSyncDist'],
    callback
  )

})

gulp.task('build', function (callback) {
  runSequence('clean:dist', 
    ['compass', 'coffee', 'useref', 'images', 'fonts'],
    callback
  )
})

gulp.task('default', function (callback) {
  runSequence(['compass', 'coffee','browserSync', 'watch'],
    callback
  )
})

// watch
gulp.task('watch', ['browserSync', 'compass'], function(){
  gulp.watch('src/app/scss/**/*.scss', ['compass']);
  gulp.watch('src/app/coffee/**/*.coffee', ['coffee']); 

  gulp.watch('src/*.html', browserSync.reload);
  // Other watchers
});

// browserSync
gulp.task('browserSync', function() {
  browserSync.init({
    server: {
      baseDir: "src",
      routes: {
           "/bower_components": "./bower_components"
      }
    }
  })
});

gulp.task('browserSyncDist', function() {
  browserSync.init({
    server: {
      baseDir: "dist"
    }
  })
});


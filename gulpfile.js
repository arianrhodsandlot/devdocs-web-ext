var gulp = require('gulp')
var jade = require('gulp-jade')
var stylus = require('gulp-stylus')
var nib = require('nib')

gulp
  .task('jade', function() {
    gulp.src('./app/pages/*.jade')
      .pipe(jade())
      .pipe(gulp.dest('./app/pages/build'))
  })
  .task('stylus', function() {
    gulp.src('./app/styles/*.styl')
      .pipe(stylus({
        use: nib(),
        compress: true,
        'import': ['nib']
      }))
      .pipe(gulp.dest('./app/styles/build'))
  })
  .task('watch', function() {
    gulp.watch('./app/pages/*.jade', ['jade'])
    gulp.watch('./app/styles/*.styl', ['stylus'])
  })
  .task('default', ['jade', 'stylus', 'watch'])

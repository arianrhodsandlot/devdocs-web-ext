import gulp from 'gulp'
import jade from 'gulp-jade'
import stylus from 'gulp-stylus'
import nib from 'nib'
import del from 'del'

gulp
  .task('jade', () => {
    gulp.src('./app/pages/*.jade')
      .pipe(jade())
      .pipe(gulp.dest('./app/pages/build'))
  })
  .task('stylus', () => {
    gulp.src('./app/styles/*.styl')
      .pipe(stylus({
        use: nib(),
        compress: true,
        'import': ['nib']
      }))
      .pipe(gulp.dest('./app/styles/build'))
  })
  .task('watch', () => {
    gulp.watch('./app/pages/*.jade', ['jade'])
    gulp.watch('./app/styles/*.styl', ['stylus'])
  })
  .task('cp', () => {
    gulp.src([
        './bower_components/backbone/backbone.js',
        './bower_components/jquery/dist/jquery.min.js',
        './bower_components/lodash/lodash.min.js'
      ])
      .pipe(gulp.dest('./app/components'));
  })
  .task('default', ['cp', 'jade', 'stylus', 'watch'])

gulp
  .task('pack', () => {
    del('crx', () => {
      gulp
        .src(['./app/**/*', '!./app/**/*.styl', '!./app/**/*.jade'])
        .pipe(gulp.dest('./crx'))
    })
  })

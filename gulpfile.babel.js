import gulp from 'gulp'
import jade from 'gulp-jade'
import stylus from 'gulp-stylus'
import babel from 'gulp-babel'
import uglify from 'gulp-uglify'
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
        import: 'nib'
      }))
      .pipe(gulp.dest('./app/styles/build'))
  })
  .task('babel', function() {
    gulp.src(['./app/scripts/*.js', './app/scripts/*.jsx'])
      .pipe(babel())
      .pipe(uglify())
      .pipe(gulp.dest('./app/scripts/build'));
  })
  .task('watch', () => {
    gulp.watch('./app/pages/*.jade', ['jade'])
    gulp.watch('./app/styles/*.styl', ['stylus'])
    gulp.watch('./app/styles/*.js', ['babel'])
    gulp.watch('./app/styles/*.jsx', ['babel'])
  })
  .task('cp', () => {
    gulp.src([
        './node_modules/backbone/backbone.min.js',
        './node_modules/jquery/dist/jquery.min.js',
        './node_modules/lodash/lodash.min.js'
      ])
      .pipe(gulp.dest('./app/components'))
  })
  .task('default', ['cp', 'jade', 'stylus', 'babel', 'watch'])

gulp
  .task('pack', () => {
    del('crx', () => {
      gulp
        .src(['./app/**/*', '!./app/**/*.styl', '!./app/**/*.jade'])
        .pipe(gulp.dest('./crx'))
    })
  })

const connect = require('gulp-connect')
const del = require('del')
const gulp = require('gulp')
const ngTemplates = require('gulp-ng-templates')
const rollup = require('rollup-stream')
const source = require('vinyl-source-stream')

gulp.task('clean:dev', () => del(['temp']))

gulp.task('clean:prod', () => del(['docs']))

gulp.task('dist', ['index:prod', 'js:prod'])

gulp.task('index:dev', ['clean:dev'], () => {
    return gulp.src('./app/index.html')
        .pipe(gulp.dest('./temp/serve'))
})

gulp.task('index:prod', ['clean:prod'], () => {
    return gulp.src('./app/index.html')
        .pipe(gulp.dest('./docs'))
})

gulp.task('js:dev', ['templates'], () => {
    return rollup('rollup.config.js')
        .pipe(source('digger.js'))
        .pipe(gulp.dest('./temp/serve'))
})

gulp.task('js:prod', ['templates'], () => {
    return rollup('rollup.config.js')
        .pipe(source('digger.js'))
        .pipe(gulp.dest('./docs'))
})

gulp.task('serve', ['index:dev', 'js:dev'], () => {
    return connect.server({
        root: 'temp/serve',
        livereload: true
    });
})

gulp.task('templates', ['clean:dev'], () => {
    return gulp.src(['app/**/*.html', '!app/index.html'])
        .pipe(ngTemplates({
            filename: 'templates.js',
            module: 'digger.templates',
            standalone: true
        }))
        .pipe(gulp.dest('temp'))
})
g = require "gulp"
$ = require( 'gulp-load-plugins' )()
connect = require 'gulp-connect'

# local server
g.task "connect", ->
    connect.server
        port: 3000
        livereload: true

    options =
        url: "http://localhost:3000"
        app: "Google Chrome"

    g.src "./index.html"
    .pipe $.open "", options


g.task 'lint', ->
    g.src(['dropDown.js', 'app.js'])
    .pipe($.eslint())
    .pipe($.eslint.format())

g.task 'jscs', ()->
    g.src ['dropDown.js', 'app.js']
    .pipe $.jscs
        fix: true
    .pipe g.dest "./"



g.task "default", ['connect'], ->
    g.watch "**/*.js", ["lint", "jscs"]


# build
g.task 'build', ->
    g.src './dropDown.js'
    .pipe $.sourcemaps.init()
    .pipe $.rename
        basename: "dropDown.min"
        extname: ".js"
    .pipe $.uglify()
    .pipe $.sourcemaps.write('./')
    .pipe g.dest './'



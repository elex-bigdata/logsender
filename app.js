var express = require('express');
var http = require('http');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var cluster = require('cluster');

var routes = require('./routes');
var logSend = require('./routes/v4');

if(cluster.isMaster){

    // Count the machine's CPUs
    var cpuCount = require('os').cpus().length;

    // Create a worker for each CPU
    for (var i = 0; i < cpuCount; i += 1) {
        cluster.fork();
    }

    // Listen for dying workers
    cluster.on('exit', function (worker) {

        // Replace the dead worker,
        // we're not sentimental
        console.log('Worker ' + worker.id + ' died :(');
        cluster.fork();

    });

}else{

    var app = express();

    // view engine setup
    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'jade');

    app.use(favicon());
    app.use(logger('dev'));
    app.use(bodyParser.json());
    //app.use(bodyParser.urlencoded());
    //app.use(cookieParser());
    app.use(express.static(path.join(__dirname, 'public')));
    app.use(app.router);

    app.get('/', routes.index);
    app.get('/v4/:appid/:uid', logSend.sendLog);

    /// catch 404 and forwarding to error handler
    app.use(function(req, res, next) {
        var err = new Error('Not Found');
        err.status = 404;
        next(err);
    });

    /// error handlers

    // development error handler
    // will print stacktrace
    if (app.get('env') === 'development') {
        app.use(function(err, req, res, next) {
            res.render('error', {
                message: err.message,
                error: err
            });
        });
    }

    // production error handler
    // no stacktraces leaked to user
    app.use(function(err, req, res, next) {
        res.render('error', {
            message: err.message,
            error: {}
        });
    });


    module.exports = app;
}

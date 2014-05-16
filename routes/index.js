var http = require('http');
var async = require('async');
var common = require('./common');
var util = require('util');

exports.index = function(req, res){

    var headers = req.headers;
    headers.host = 'xa.xingcloud.com';

    var options = {
        host: 'xa.xingcloud.com',
        path: req.url,
        method: 'GET',
        headers: req.headers
    };

    async.parallel([rewrite(options)]);
    res.send("ok");
};

function rewrite(options){
    console.log("rewrite");
    var req = http.request(options, function(res) {
        res.setEncoding('utf8');
        res.on('data', function (data) {
            console.log('>>> ', data);
        });
    });

    req.on('error', function(e){
        console.log("error: " + e.message);
        var dir = "/data/log/payproxy";
        var date = new Date();
        var year = date.getFullYear();
        var month = date.getMonth() + 1;
        month = (month < 10 ? "0" : "") + month;
        var day  = date.getDate();
        day = (day < 10 ? "0" : "") + day;
        var filename = util.format("%s_%s_%s",year,month, day);
        common.ea_write_log(dir,filename + ".log",options.path);
    });
    req.end();
}

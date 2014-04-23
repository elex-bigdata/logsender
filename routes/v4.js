
var LogManager = require("./LogManager")
var saveLogManager = require("./SaveLogManager")

exports.sendLog = function(req,res){
    console.time('send-log');
    var manager = new LogManager(Date.now());
    try {
        manager.enter(req,res);
        var msg = saveLogManager.saveLog(req);
        console.log(msg);
        manager.leave(req,res,"php",msg);
        console.timeEnd('send-log');
    } catch (err) {
        manager.leave(req,res,"error",err.message)
        console.error(err);
        console.timeEnd('send-log');
    }
}
    

var manager = require("./LogManager")
var saveLogManager = require("./SaveLogManager")

exports.sendLog = function(req,res){
    console.time('send-log');
    var ea_start_time = Date.now();
    try {
        manager.enter(req,res);
        var msg = saveLogManager.saveLog(req);
        console.log(msg);
        manager.leave(req,res,"php",msg,ea_start_time);
        console.timeEnd('send-log');
    } catch (err) {
        manager.leave(req,res,"error",err.message,ea_start_time)
        console.error(err);
        console.timeEnd('send-log');
    }
}
    
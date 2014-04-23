var common = require('./common');
var LogContainer = require('./LogContainer');
var util = require('util');
var constants = require("./constants");


/*
 * params need dir appid
 * return the save file
 */
function getSaveFile(params){
    if(!params['appid'] || ! params['dir'])
        throw new Error("open file params is not enough");
    //$ throw $e
    //echo $params['site_id'].$params['Y'].$params['m'].$params['d'].$params['index'];
    var date = new Date();

    var year = date.getFullYear();

    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;

    var day  = date.getDate();
    day = (day < 10 ? "0" : "") + day;

    var index = date.getHours()*12 + parseInt(date.getMinutes()/5);

    var temp = util.format("%s/%s/%s/%s/ea_data_%s/",
        params['dir'],params['appid'],year,month, day);
    var filepath= constants.APP_ROOT + '/' + temp;

    return [filepath,index+".log"];
}


/*
 * read from json and assign base log and store log
 */
function writeLog(req){
    var logContainer=new LogContainer(req);
    logContainer.parseLog();
    var ret = writeLogFromLogContainer(logContainer);
    //special delivery for v9
    var old_appid = logContainer.getAppid();
    if(old_appid.substr(0,3)=="v9-" && !(old_appid == "v9-v9")){
        logContainer.setAppid("v9-v9");
        ret = writeLogFromLogContainer(logContainer);
    }
    return ret;
}

function writeLogFromLogContainer(logContainer){
    var file_params = {};
    file_params['appid'] = logContainer.getAppid();
    file_params['dir'] = 'site_data';
    var logNum=0;
    var updateNum=0;
    var result = logContainer.getBaseLog(logNum,updateNum);
    var msg;
    if(result != null){
        msg = result[0];
        logNum = result[1];
        updateNum = result[2];
    }

    if(msg!=null){
        var log_file = getSaveFile(file_params);
        common.ea_write_log(log_file[0],log_file[1],msg);
    }
    file_params['dir']='store_log';

    msg = null;
    result = logContainer.getStoreLog(logNum);

    if(result != null){
        msg = result[0];
        logNum = result[1];
    }
    if(msg!=null){
        var log_file = getSaveFile(file_params);
        common.ea_write_log(log_file[0],log_file[1],msg);
    }
    return "store " + logNum + " action and " + updateNum + " update ";
}
/*
 * save the log
 */
exports.saveLog = function(req){
    return writeLog(req);
}

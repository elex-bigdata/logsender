var fs = require('fs')
var constants = require("./constants");
var mkdirp = require('mkdirp');

exports.ip2long = function(ipstr) {
    var ip = 0;
    var ipdot = ipstr.split('.').reverse();
    var ipis = ipdot.map(function(v, i){
        return v * Math.pow(256, i);
    });
    ipis.forEach(function(v,i){return ip+=v;});
    return ip;
};

exports.getRealIP = function(req){
    var proxy_ip=req.headers['x-real-ip'] || req.headers['x-forwarded-for'];
    return proxy_ip ? proxy_ip : req.ip;
}

var appid_map= {
	'rome0@elex337_pt_1':'rome0@337_pt_1',
	'rome0@orkupt_pt_2':'rome0@elex337_pt_2',
	'rome0@orkupt_pt_1':'rome0@337_pt_1',
	'hl@elex337_pt_1':'hl@337_pt_1',
	'kszl@elex337_de_1':'kszl@337_de_s1',
	'kszl@elex337_pt_4':'kszl@337_pt_s4',
	'kszl@elex337_tr_1':'kszl@337_tr_s1',
	'tencent-18894@facebook_tw':'tencent-18894',
	'age@337_en_andriod.global.s2':'age@337_en_android.global.s2',
	
	'age@337_en_andriod.global.s1':'age@337_en_android.global.s1',
	'age@337_en_android.s1':'age@337_en_andriod.s1',
	'age@337_en_android.s2':'age@337_en_andriod.s2',
	'age@337_en_android.s3':'age@337_en_andriod.s3',
	'age@337_en_android.s4':'age@337_en_andriod.s4',
	'age@337_en_android.s5':'age@337_en_andriod.s5',
	'age@337_en_android.s6':'age@337_en_andriod.s6',
	'age@337_en_android.s7':'age@337_en_andriod.s7',
	'age@337_en_android.s8':'age@337_en_andriod.s8',
	'age@337_en_android.s9':'age@337_en_andriod.s9',
	'age@337_en_android.s10':'age@337_en_andriod.s10'}

exports.match = function(appid){
    if(appid_map[appid])return appid_map[appid];
    else return appid;
}

exports.checkV3 = function(appid) {
    if(constants.WHITE_MAP[appid] == 1) return true;
    else if(/(^[a-zA-Z0-9])([a-zA-Z0-9_.\-@]*$)/.test(appid)){
        return true;
    }else if(appid.substr(0,11)=="xingyuntest") return true;
    else return false;
}

exports.ea_write_log = function(dir,file,msg){
    mkdirp(dir,function(err){
        if(err){
            throw new Error(err)
        }
        var log = fs.createWriteStream(dir + file, {'flags': 'a'});
        console.info(msg);
        log.end(msg);
    })
}

exports.gdpUidHook = function(uid){
    if(uid.length != 32){
        return uid;
    }
    var matches = /^0*(FB|AA)(\d+)$/.exec(uid);
    if(matches){
        var pf = matches[1];
        var id = matches[2];

        switch (pf){
            case 'FB':
                return id;
            case 'AA':
                return id;
            default:
                return uid;
        }
    }else{
        return uid;
    }
}


/**
 * 将一个timestamp标准化为13位的毫秒timestamp
 * @param number $timestamp 输入的timestamp
 * @return number 输出的timestamp，或者null
 */
exports.to_millisec = function(timestamp){
    if(timestamp == null){
        return null;
    }
    var length=timestamp.length;
    if(length==10){
        timestamp = parseInt(timestamp + "000");
    }
    else if(length==13){
        timestamp = parseInt(timestamp);
    }
    else {
        timestamp = Date.now();
    }
    return timestamp;
}
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
    else if(appid.substr(0,11)=="xingyuntest") return true;
    else if(/(^[a-zA-Z0-9])([a-zA-Z0-9_.\-@]*$)/.test(appid)){
        return true;
    }
    else return false;
}

exports.ea_write_log = function(dir,file,msg){
    console.info("dir : " + dir)
    console.info("file : " + file)
    mkdirp(dir,function(err){
        if(err){
            throw new Error(err)
        }
        console.info("write msg to " + msg)
        var log = fs.createWriteStream(dir + file, {'flags': 'a'});
        log.end(msg);
    })
}
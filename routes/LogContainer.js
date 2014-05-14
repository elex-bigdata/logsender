var util = require('util');
var common = require('./common');
var constants = require("./constants");

function LogContainer(req){
    this.req = req;
	this.baseMsg = [];
	this.visitMsg = [];
	this.stats = [];
	this.update = {};
	this.appid = "";
	this.uid = "";
	//all timestamp represented in milliseconds
	this.send_time = "";
	this.abs_time = "";//absolute timestamp, bypass $send_time and timestamps in individual events
	this.ref = "";


	this.parseLog = function(){
        this.appid = req.param('appid');
        if(this.appid.indexOf("hayday")===0){
            this.appid = "happyfarm@elex337_en_1.0";
        }

		if(!common.checkV3(this.appid)){
			throw new Error("appid is illegal");
		}

		//add gdp hook

		this.uid= common.gdpUidHook(req.param('uid'));

		if(req.query.timestamp){
			this.send_time = req.query.timestamp;
		}else{
			this.send_time=0;
		}
		if(req.query.abs_ts){
			this.abs_time = req.query.abs_ts;
		}else{
			this.abs_time = null;
		}
		this.abs_time = common.to_millisec(this.abs_time);
		this.send_time = common.to_millisec(this.send_time);

        for(var key in req.query){
            if(key.indexOf("action") ===0){
                this.addAction(req.query[key])
            }else if(key.indexOf("update") ===0){
                this.addUpdate(req.query[key])
            }
        }

	}
    this.addUpdate = function(triple){
		var t = triple.split(",",2);
		var property=t[0];
		var val=t[1];
		this.update[property] = val;
		//add ref field for ad system
		//format:appid uid ref user.visit {} timestamp
		if(property=="ref"){
			this.ref = val;
		}
	}

	/**
	 * 获得log最终的发生时间。若果有abs_ts参数，则按照绝对时间；
	 * 如果是：
	 * 	http://xa.xingcloud.com/v4/proj/uid?action=a,,xxx
	 * 则按照xxx算每个action的时间。
	 * 如果是：
	 * 	http://xa.xingcloud.com/v4/proj/uid?timestamp=xxx&action1=a&action2=b
	 * 则每个action都按照timestamp的时间。
	 * 如果是：
	 * 	http://xa.xingcloud.com/v4/proj/uid?timestamp=xxx&action=a,,yyy
	 * 即有对一个action有两个时间戳，则视timestamp为客户端认为的当前时间，以此决定action的实际发生时间。
	 *
	 * @param number $timestamp
	 * @return number
	 */
	 this.getLogTime = function(timestamp){
		//get timestamp
        var nowtime = "";
		if(this.abs_time){// abs_time superb
			nowtime = this.abs_time;
		}else if(timestamp != 0 && timestamp != null){
			if(this.send_time != 0){ // ?timestamp=xxx&action=a,,yyy
				nowtime = Date.now() - (this.send_time-timestamp);
			}else{//	?action=a,,xxx
				nowtime = timestamp;
			}
		}else{
			if(this.send_time != 0){	// ?timestamp=xxx&action=a
				nowtime = this.send_time;
			}else{	// ?action=a
				nowtime = Date.now();
			}
		}
		return nowtime;
	}

	this.addAction = function(triple){
		var t = triple.split(",");
		var event = t[0];
		var value = t[1];
		var timestamp = t[2];
		//normalize time representation
		if(timestamp != 0){
			timestamp = common.to_millisec(timestamp);
		}
		var nowtime = this.getLogTime(timestamp);
		//第四个参数，days
        var days = 1;
		if(t.length >=4){
			days = parseInt(t[3]);
		}

		if(days>1 && days <= 100){
			value = parseInt(t[1]);
			var day_value = parseInt(value / days);
			var first_day_value = day_value + parseInt(value % days);
			this.addAction(event +"," + first_day_value +"," +nowtime);
			for(var i=1; i<days; i++){
				nowtime += 86400000;
				addAction(event+","+ day_value+","+nowtime);
			}
			return;
		}

		if(constants.BASE_EVENT[event]){

			//pay add the gross gcurrency
            var json_v = {};
			if(event === 'pay'){
				json_v['gcurrency'] = "USD";
				json_v['gross'] = value;
			}else if(event === 'quit'){
				json_v['duration_time'] = value;
			}
            var json_var = "";
			if(json_var.length !=0)
                json_var = JSON.stringify(json_v);
			//add ref field for ad system
			if(constants.BASE_EVENT[event] !="user.visit"){
				this.baseMsg.push(util.format("%s\t%s\t%s\t%s\t%s",this.uid,this.ref,constants.BASE_EVENT[event],json_var,nowtime));
			}else{
                var visitRecord = {};
                visitRecord["uid"]= this.uid;
				visitRecord["timestamp"]= nowtime;
                this.visitMsg.push(visitRecord);
                var realIp = common.getRealIP(req);
				var ip = common.ip2long(realIp);
                console.info(realIp + " : " + ip);
				if(ip != false)
					this.baseMsg.push(util.format("%s\t%s\t%s\t%s\t%s",this.uid,this.ref,"user.update",'{"geoip":"' + ip + '"}',nowtime));
			}

		}else{
            var newlog = {};
			newlog['timestamp']=nowtime;
			var eventArray = event.split(".");
            newlog['data'] = [];
			for(var i=0; i<=5; i++){
				if(eventArray[i]) newlog['data'][i] = eventArray[i];
				else newlog['data'][i]="";
			}
			newlog['data'][6] = parseInt(value) || 0;
			newlog['statfunction']='count';
			// 丢弃xa.geoip
			if(newlog['data'][0] != "xa" || newlog['data'][1] != "geoip")
				this.stats.push(newlog);

			if(newlog['data'][0] == "visit" || (newlog['data'][0] == "xa" && newlog['data'][1] == "geoip" )){
                var realIp = common.getRealIP(req);
                var ip = common.ip2long(realIp);
                console.info(realIp + " : " + ip);
				if(ip != false)
					this.baseMsg.push(util.format("%s\t%s\t%s\t%s\t%s",this.uid,this.ref,"user.update",'{"geoip":"'+ip+'"}',nowtime));
			}
		}
	}

	this.getUpdateLog = function(re,updateNum){
		updateNum +=  Object.getOwnPropertyNames(this.update).length;
		if(updateNum != 0){
			re += util.format("%s\t%s\t%s\t%s\t%s\t%s",this.appid,this.uid,"","user.update",JSON.stringify(this.update),Math.floor(Date.now()/1000)) +"\n";
		}

        return new Array(re,updateNum);
	}

	this.getBaseLog = function(logNum,updateNum){
		var re= "";
        for(var i=0;i<this.visitMsg.length;i++){
			var msg= util.format("%s\t%s\t%s\t%s\t%s\t%s\n", this.appid,this.visitMsg[i]['uid'],this.ref,"user.visit","",this.visitMsg[i]['timestamp']);
			re += msg;
			logNum++;
		}
        for(var i in this.baseMsg){
            re += this.appid + "\t" + this.baseMsg[i] + "\n";
            logNum++;
        }
		var upresult = this.getUpdateLog(re,updateNum);
		return new Array(upresult[0],logNum,upresult[1]);
	}
	this.getStoreLog = function(logNum){
		if(this.stats.length==0) return null;
        var log = {};
        log['signedParams'] = {};
		log['signedParams']['appid']= common.match(this.appid);
		log['signedParams']['uid']=this.uid;
		log['stats']= this.stats;
		logNum += this.stats.length;
		return new Array(JSON.stringify(log) + "\n",logNum);
	}
	this.getAppid = function(){
		return this.appid;
	}
	this.setAppid = function(appid){
		this.appid=appid;
	}
	this.getUid = function(){
		return this.uid;
	}
}

module.exports = LogContainer
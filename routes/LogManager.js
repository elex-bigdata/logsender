function LogManager(time){

	var ea_start_time = time;

	function logEnter(req){
		if(typeof req.param('appid') == "undefined" || req.param('appid')=="") throw new Error("appid is not set");
		if(typeof req.param('uid') == "undefined" ||  req.param('uid')=="" ) throw new Error("uid is not set");
	}

	function buildJson(type,msg){
		var t =(Date.now() - ea_start_time) + " ms"
        var re = {};
		switch(type){
			case 'php':
				re['stats']="ok";
				re['time']=t;
				re['message']=msg;
				break;
			case 'error':
				re['stats']="error";
				re['time']=t;
				re['message']=msg;
				break;
		}
		return re;
	}
	function changeType(req,type){
		if(typeof req.param('callback') != "undefined" && req.param('callback')!="" && type!='error'){
			type="jsonp";
		}
		if(typeof req.header('HTTP_ACCEPT') != "undefined" && req.header('HTTP_ACCEPT') != "" && req.header('HTTP_ACCEPT').indexOf("image") ===0 && type!='error') {
			type='img';
		}
		if(typeof req.param('img') != "undefined"){
			type='img';
		}
		return type;
	}
	function logLeave(req,res,type,msg){
		var re = buildJson(type,msg);
        console.info(re);
		type=changeType(req,type);
		/**
		 * 不同的返回类型，对应不同的客户端请求的情况。
		 * php 类型：适用于浏览器窗口直接测试；
		 * img 类型：适用于以 <img> 标签形式发起请求，类似google的方式；
		 * jsonp 类型：适用于以jsonp方式调用。
		 */
		switch(type){
            case 'php':
                res.header({"Content-type":"text/html","xa-api-version":"v4"})
				res.send(re);
				break;
            case 'img':
				res.header({"Content-type":"image/gif","Transfer-Encoding":"identity","xa-api-version":"v4"});
                var str = new Buffer("4749463839610100010080ff00ffffff0000002c00000000010001000002024401003b","hex");
				res.header("Content-Length",str.length);
				res.send(str);
				break;
			case 'error':
                res.header("xa-api-version","v4")
				res.send(re);
				break;
			case 'jsonp':
				res.header("xa-api-version","v4");
				res.header("Content-type","application/javascript");
				res.send(req.param('callback')+".("+re + ");");
				break;
		}
	}


	/*
	 * use for appid map and check params
	 */
	this.enter = function(req,resp){
		//console.log("LogManager enter");
        logEnter(req);
	}
	this.leave = function(req,resp,type,msg){
		//console.log("LogManager leave");
		logLeave(req,resp,type,msg);
	}

}

module.exports = LogManager;
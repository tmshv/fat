var EventEmitter = require("events").EventEmitter;
var util = require("util");

function Receipt(){
	var self = this;
	var runner;
	var _lock = false;
	var _end = false;
	var results = [];
	
	Object.defineProperty(this, "locked", {
		get: function(){
			return _lock;
		}
	});

	Object.defineProperty(this, "result", {
		get: function(){
			if(results.length == 0){
				return undefined;
			}else if(results.length == 1){
				return results[0];
			}else{
				return results;
				// var out = [];
				// for(var i=0; i<results.length; i++){
				// 	if(results[i]) out.push(results[i]);
				// }
				// return out;
			}
		}
	});

	this.wrap = function(fn){
		if(fn instanceof Function){
			runner = fn;
		}else{
			throw new Error("wrap parameter should be instance of Function");
		}
		
		return this;
	}

	this.lock = function(){
		_lock = true;
		this.emit("lock");
		return this;
	}

	this.unlock = function(){
		_lock = false;
		this.emit("unlock");
		if(_end) this.end();
		return this;
	}

	this.end = function(){
		_end = true;
		if(!_lock) this.emit("end");
		return this;
	}

	this.exec = function(data){
		if(runner instanceof Function){
			var self = this;

			var done = function(data){
				self.collect(data);
				self.end();
			}

			try{
				var runnerReturn = runner.call(this, data, done);
				if(typeof runnerReturn != "undefined"){
					done(runnerReturn);
				}
			}catch(error){
				self.emit("error", error);
				//error then executing receipt
				//stop executing next receipt for current data
				//log error for user
			}
		}else{
			throw new Error("nothing to execute");
		}
		return this;
	}

	this.collect = function(portion){
		var index = results.length;
		if(typeof portion == "undefined"){
			//portion wont piped to next receipts
		}else{
			results.push(portion);
			self.emit("portion", portion, index);
		}
	}

	this.override = function(portion){
		results = [portion];
	}
}
util.inherits(Receipt, EventEmitter);
module.exports = Receipt;
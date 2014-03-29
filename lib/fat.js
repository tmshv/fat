var Receipt = require("./receipt");

function Fat(){
	var queue;
	var results;

	Object.defineProperty(this, "product", {
		get: function(){
			if(results.length == 0){
				return undefined;
			}else if(results.length == 1){
				return results[0];
			}else{
				var out = [];
				for(var i=0; i<results.length; i++){
					if(results[i]) out.push(results[i]);
				}
				return out;
			}
		}
	});

	/**
	 * [receipt description]
	 * @param  {Function|Object|None} param [description]
	 * @return {Receipt|Fat}      [description]
	 */
	this.receipt = function(param){
		if(arguments.length == 0){
			return new Receipt();
		}else{
			var receipt;
			if(param instanceof Array){
				for(var i=0; i<param.length; i++){
					this.receipt(param[i]);
				}
				return this;
			}else if(param instanceof Receipt){
				receipt = param;
			}else if(param instanceof Function){
				receipt = new Receipt();
				receipt.wrap(param);
			}else{
				receipt = dataReceipt(param);
			}

			if(receipt) regReceipt.call(this, receipt);
			else throw new Error("cannot add receipt");

			return this;
		}
	}

	this.reset = function(){
		queue = [];
		results = [];
		delete endFat.fn;
	}

	this.end = function(callback){
		if(!endFat.fn) endFat.fn = [];
		endFat.fn.push(callback);
		return this;
	}

	var nextReceipt = function(receipt){
		for(var i=0; i<queue.length; i++){
			if(receipt === queue[i]){
				var nextReceipt = queue[i + 1];
				if(nextReceipt){
					return nextReceipt;
				}
			}
		}
		return null;
	}

	var regReceipt = function(receipt){
		//here this is an Fat
		
		var self = this;
		queue.push(receipt);

		receipt.on("portion", function(portion, index){
			// console.log(index, portion.toString().substr(0, 20));
			// // results[index] = portion;
			// if(typeof portion == undefined){
			// 	//portion trash
			// }else{
			// 	var receipt = nextReceipt(this);
			// 	if(receipt){
			// 		next(receipt, portion);
			// 	}
			// }
		})
		.on("lock", function(){
			
		})
		.on("unlock", function(){
			
		})
		.on("end", function(){
			copyResultsFrom(this);
			
			var receipt = nextReceipt(this);
			if(receipt){
				next(receipt);
			}else{
				try{
					endFat.call(self);
				}catch(error){
					
				}
			}
		});

		//force execute receipt if it's first
		if(queue.length == 1){
			next(receipt);
		}
	}

	var next = function(receipt){
		// receipt.exec(data);
		// return;

		process.nextTick(function(){
			// receipt.exec(data);
			if(results.length){
				var iter = results;//cloneResults();
				// clearResults();
				receipt.lock();
				for(var i=0; i<iter.length; i++){
					var data = iter[i];
					receipt.exec(data);
				}
				receipt.unlock();
			}else{
				receipt.exec();
			}
		});
	}

	var endFat = function(){
		//here `this` is an Fat instance
		
		if(!lockedReceiptsExists()){
			if(endFat.fn && endFat.fn instanceof Array){
				while(endFat.fn.length){
					var fn = endFat.fn.shift();
					if(fn instanceof Function){
						fn.call(this);
					}
				}
			}
		}
	}

	var copyResultsFrom = function(receipt){
		if(typeof receipt.result == "undefined"){
			results = [];
		}else if(receipt.result instanceof Array){
			results = receipt.result;
		}else{
			results = [receipt.result];
		}
	}

	var cloneResults = function(){
		var out = [];
		for(var i=0; i<results.length; i++) out[i] = results[i];
		return out;
	}

	var lockedReceiptsExists = function(){
		for(var i=0; i<queue.length; i++){
			var receipt = queue[i];
			if(receipt.locked) return true;
		}
		return false;
	}

	this.reset();
}

Fat.prototype.Fat = Fat;
Fat.prototype.Receipt = Receipt;

const inst = new Fat();
module.exports = inst;

function dataReceipt(data){
	var receipt = new Receipt();
	receipt.wrap(function(){
		return data;
	});

	return receipt;
}
var should = require("should");
var Receipt = require("../lib/receipt");

describe("Receipt", function(){
	it("new instance should be unlocked", function(){
		var receipt = new Receipt();
		receipt.locked.should.be.false;
	});

	describe("collect()", function(){
		it("should collect data in result", function(){
			var receipt = new Receipt();
			receipt.wrap(function(data, next){
				this.collect("hello");
				this.collect("lol");
			})
			.on("end", function(){
				this.result.join("").should.be.equal("hellolol");
			})
			.exec()
		});	

		it("should ignore `undefined`", function(){
			var receipt = new Receipt();
			receipt.wrap(function(data, next){
				this.collect();
				this.collect("hello");
				this.collect();
				this.collect();
				this.collect("lol");
				this.collect();
				next();
			})
			.on("end", function(){
				this.result.join("").should.be.equal("hellolol");
			})
			.exec()
		});

		it("should emit `portion` event", function(done){
			var receipt = new Receipt();
			receipt.wrap(function(data, next){
				this.collect("hello");
			})
			.on("portion", function(){
				done();
			})
			.exec();
		});

		it("should emit `portion` if wrapped function calls callback with data", function(done){
			var receipt = new Receipt();
			receipt.on("portion", function(){
				done();
			})
			.wrap(function(data, next){
				next("hello");
			})
			.exec();
		});

		it("should collect data each time calling exec()", function(){
			var receipt = new Receipt();
			receipt.wrap(function(data, next){
				next(data);
			});
			receipt.exec("hello");
			receipt.exec("lol");
			receipt.result.join("").should.be.equal("hellolol");
		});
	});

	describe("wrap()", function(){
		it("should return self instance", function(){
			var receipt = new Receipt();
			receipt.wrap(function(){}).should.be.instanceof(Receipt);
			receipt.wrap(function(){}).should.be.equal(receipt);
		});

		it("should accept function", function(done){
			var receipt = new Receipt();
			receipt.wrap(function(){});
			done();
		});

		it("should throw an error if parameter is not a function", function(){
			var receipt = new Receipt();
			try{
				receipt.wrap("lol");
			}catch(error){
				error.message.should.be.equal("wrap parameter should be instance of Function");
			}
		});
	});	

	describe("exec()", function(){
		it("should return self instance", function(){
			var receipt = new Receipt();
			receipt.wrap(function(){});
			receipt.exec().should.be.instanceof(Receipt);
			receipt.exec().should.be.equal(receipt);
		});

		it("should call function passed in using wrap() method", function(done){
			var receipt = new Receipt();
			receipt.wrap(function(data){
				return data+"lol";
			})
			.on("end", function(){
				this.result.should.be.equal("hellolol");
				done();
			})
			.exec("hello");
		});

		it("should throw error if wrapped function not exists", function(){
			var receipt = new Receipt();
			try{
				receipt.exec("hello");	
			}catch(error){
				error.message.should.be.equal("nothing to execute");
			}
		});

		it("should emit `end` event", function(done){
			var receipt = new Receipt();
			receipt.wrap(function(){
				return "hello";
			})
			.on("end", function(){
				done();
			})
			.exec();
		});

		it("should emit `end` event once if locked instance calls exec() multiple times", function(done){
			var receipt = new Receipt();
			var portions = [];
			receipt.wrap(function(data){
				return data;
			})
			.on("portion", function(data){
				portions.push(data);
			})
			.on("end", function(){
				portions.length.should.be.equal(2);
				this.result.join("").should.be.equal("hellolol");
				done();
			})
			.lock()
			.exec()
			.exec("hello")
			.exec()
			.exec("lol")
			.exec()
			.unlock()
		});
	});

	describe("end()", function(){
		it("should emit `end` event", function(done){
			var receipt = new Receipt();
			receipt.on("end", function(){
				done();
			})
			.end();
		});

		it("should return self instance", function(){
			var receipt = new Receipt();
			receipt.end().should.be.instanceof(Receipt);
			receipt.end().should.be.equal(receipt);
		});
	});

	describe("lock()", function(){
		it("should return self instance", function(){
			var receipt = new Receipt();
			receipt.lock().should.be.instanceof(Receipt);
			receipt.lock().should.be.equal(receipt);
		});

		it("should set locked to true", function(){
			var receipt = new Receipt();
			receipt.lock();
			receipt.locked.should.be.true;
		});

		it("should emit `lock` event", function(done){
			var receipt = new Receipt();
			receipt.on("lock", function(){
				done();
			})
			.lock();
		});
	});	

	describe("unlock()", function(){
		it("should return self instance", function(){
			var receipt = new Receipt();
			receipt.unlock().should.be.instanceof(Receipt);
			receipt.unlock().should.be.equal(receipt);
		});

		it("should set locked to false", function(){
			var receipt = new Receipt();
			receipt.lock();
			receipt.unlock();
			receipt.locked.should.be.false;
		});

		it("should emit `unlock` event", function(done){
			var receipt = new Receipt();
			receipt.on("unlock", function(){
				done();
			})
			.unlock();
		});

		it("should emit `end` event if end() called while locked", function(done){
			var receipt = new Receipt();
			receipt.on("end", function(){
				done();
			})
			.lock()
			.end()
			.unlock();
		});
	});
});
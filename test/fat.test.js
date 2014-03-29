var should = require("should");
var fat = require("../lib/fat");
var Receipt = require("../lib/receipt");

describe("Fat" , function(){
	describe("receipt()", function(){
		it("should fat data asyncronously", function(done){
			fat.reset();
			fat.receipt(function(data, next){
					process.nextTick(function(){
						next("hello");	
					});
				})
				.receipt(function(data, next){
					process.nextTick(function(){
						data += "lol";
						next(data);
					});
				})
				.end(function(){
					this.product.should.be.equal("hellolol");
					done();
				});
		});

		it("should fat data syncronously using return", function(done){
			fat.reset();
			fat.receipt(function(){
				return "hello";
			})
			.receipt(function(data){
				return data + "lol";
			})
			.end(function(){
				this.product.should.be.equal("hellolol");
				done();
			});
		});

		it("should process object", function(done){
			fat.reset();
			fat.receipt({lol:1})
				.receipt(function(data){
					data.lol = 2;
					return data;
				})
				.end(function(){
					fat.product.should.have.property("lol", 2);
					done();
				});
		});

		it("should return instance of Receipt if no parameters passed", function(){
			fat.reset();
			fat.receipt().should.be.instanceof(Receipt);
		});

		it("should return self instance if parameters passed", function(){
			fat.reset();
			fat.receipt("lol").should.be.equal(fat);
		});

		it("should accept instance of Array", function(){
			fat.reset();
			var list = [
				function(){
					this.collect("hello")
				},
				function(data){
					return data+"lol";
				}
			];
			fat.receipt(list)
			.end(function(){
				this.product.should.be.equal("hellolol");
			})
		});

		describe("function", function(){
			it("`this` variable should link to Receipt instance", function(done){
				fat.reset();
				fat.receipt(function(){
						this.should.be.instanceof(Receipt);
						return "hello";
					})
					.end(function(){
						done();
					});
			});

			it("can be using for filter data", function(done){
				var list = [];
				for(var i=0; i<1000; i++){
					list.push(Math.round(10000 * Math.random()).toString());
				}
				list[Math.floor(Math.random() * 100)] = "hello";
				list[200 + Math.floor(Math.random() * 100)] = "lol";
				var j = list.join("");

				fat.reset();
				fat.receipt(function(data, next){
					var self = this;
					list.forEach(function(i){
						self.collect(i);
					});
					next();
				})
				.receipt(function(data, next){
					if(!/^\d+/.test(data)) return data;
				})
				.end(function(){
					this.product.join("").should.be.equal("hellolol");
					done();
				});
			});
		});
	});

	describe("reset()", function(){
		it("should reset", function(){
			fat.reset();
			fat.receipt({lol:"lol"});
			fat.reset();
			fat.should.have.property("product", null);
		});
	});

	describe("end()", function(){
		it("should return self instance", function(){
			fat.reset();
			fat.end().should.be.equal(fat);
		});

		it("should store multiple callbacks", function(done){
			var first = false;
			fat.reset();
			fat.receipt({lol:"lol"})
			.end(function(){
				first = true;
			})
			.end(function(){
				first.should.be.true;
				done();
			});
		});

		it("`this` variable in callback should link to Fat instance", function(done){
			fat.reset();
			fat.receipt(function(data, next){
				return "hello";
			})
			.end(function(){
				this.should.be.equal(fat);
				this.should.be.instanceof(fat.Fat);
				done();
			});
		});
	});
});
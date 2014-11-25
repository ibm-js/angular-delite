define([
		"angular",
		"dstore/Memory",
		"angular-delite/wrappers/store"
		], function(angular, Memory, wrapper){
			angular.module("dstore.memory", [])
				.factory("Memory", function(){
					return wrapper(Memory);
				});
		});

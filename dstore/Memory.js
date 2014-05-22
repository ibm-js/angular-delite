define([
		"angular",
		"dstore/Memory",
		"angular-delite/wrappers/Store"
		], function(angular, Memory, wrapper){
			angular.module("dstore.memory", [])
				.factory("Memory", function(){
					return wrapper(Memory);
				});
		}
});

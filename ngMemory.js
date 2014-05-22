define([
		"angular",
		"dstore/Memory",
		"angular-delite/ngStore"
		], function(angular, Memory, ngStore){
			angular.module("dstore.memory", [])
				.factory("Memory", function(){
					return ngStore(Memory);
				});
		}
});

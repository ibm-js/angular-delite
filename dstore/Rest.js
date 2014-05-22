define([
		"angular",
		"dstore/Rest",
		"angular-delite/wrappers/store"
		], function(angular, Rest, wrapper){
			angular.module("dstore.rest", [])
				.factory("Rest", function($q){
					return wrapper(Rest, $q);
				});
		});

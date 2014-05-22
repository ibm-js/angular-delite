define([
		"angular",
		"dstore/Rest",
		"angular-delite/wrappers/Store""
		], function(angular, Rest, wrapper){
			angular.module("dstore.rest", [])
				.factory("Rest", function($q){
					return wrapper(Rest, $q);
				});
		});

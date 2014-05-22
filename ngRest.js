define([
		"angular",
		"dstore/Rest",
		"angular-delite/ngStore"
		], function(angular, Rest, ngStore){
			angular.module("dstore.rest", [])
				.factory("Rest", function($q){
					return ngStore(Rest, $q);
				});
		});

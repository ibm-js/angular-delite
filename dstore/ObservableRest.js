define([
		"angular",
		"dojo/_base/declare",
		"dstore/Rest",
		"dstore/Observable",
		"angular-delite/wrappers/store"
		], function(angular, declare, Rest, Observable, wrapper){
			angular.module("dstore.rest", [])
				.factory("Rest", function($q){
					return wrapper(declare([Rest, Observable], {}), $q);
				});
		});

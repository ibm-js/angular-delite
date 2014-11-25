define([
		"angular",
		"dojo/_base/declare",
		"dstore/Rest",
		"dstore/Trackable",
		"angular-delite/wrappers/store"
		], function(angular, declare, Rest, Trackable, wrapper){
			angular.module("dstore.trackableRest", [])
				.factory("TrackableRest", function($q){
					return wrapper(declare([Rest, Trackable]), $q);
				});
		});

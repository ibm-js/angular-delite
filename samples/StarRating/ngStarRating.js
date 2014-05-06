define([
	"angular-delite/ngWidget",
	"deliteful/StarRating",
	], function (ngWidget, StarRating) {
		angular.module("StarRating", []).directive("ngStarRating", function(){
			return ngWidget(StarRating, {value: "@"});
		});
		angular.module("StarRating1", []).directive("ngStarRating1", function(){
			return ngWidget(StarRating, {value : "="});
		});
		angular.module("StarRating2", []).directive("ngStarRating2", function(){
			return ngWidget(StarRating, {value : "=", max: "="});
		});
    });

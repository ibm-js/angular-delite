define([
	"angular-delite/ngWidget",
	"deliteful/StarRating",
	], function (ngWidget, StarRating) {
		angular.module("StarRating", []).directive("ngStarRating", function(){
			return ngWidget(StarRating, {value: "="});
		});
    });

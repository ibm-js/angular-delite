define([
	"angular-delite/ngWidget",
	"deliteful/StarRating",
	], function (ngWidget, StarRating) {
		ngWidget("StarRating", StarRating);
		ngWidget("StarRatingEditable", StarRating, {value: '='});
    });

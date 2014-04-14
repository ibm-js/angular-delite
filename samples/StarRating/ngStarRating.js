define([
    "angular-delite/ngWidget",
    "deliteful/StarRating",
    ], function (ngWidget, StarRating) {
        ngWidget("StarRating", StarRating);
        ngWidget("StarRating1", StarRating, {value: "="});
        ngWidget("StarRating2", StarRating, {value:"=", max: "="});
    });

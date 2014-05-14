require([
		"dcl/dcl",
		"dojo/has",
		"delite/register",
		"angular-delite/samples/StarRating/ngStarRating",
		"angular/angular",
		"dojo/domReady!"
		], function(dcl, has, register, ngStarRating){

			var app = angular.module("app", [
				"StarRating", 
				"StarRating1", 
				"StarRating2",
				]); 

			// a controller was added for debugging, not necessary
			app.controller("starrater", 
				function ($scope) {
					$scope.value = 4;
					$scope.max = 6;
				});

			

			// boostrapping my app on a particular DOM element
			angular.element(document).ready(function () {
				var wrapper = document.getElementById('app');
				angular.bootstrap(wrapper, ["app"]);

				// it appears that this must be triggered only at the very end
				register.parse();
			});
		});




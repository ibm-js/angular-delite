require([
		"delite/register",
		"deliteful/StarRating",
		"angular-delite/ngWidget",
		"angular/angular",
		], function(register, StarRating, ngWidget){
			
			angular.module("app", [])
				   .directive("ngStarRating", function(){
					   return ngWidget(StarRating, {value: "="},  {value: 3})
				   })
				   .controller("MainCtrl", function($scope){
						$scope.getOpinion = function(rate){
							switch(rate) {
								case 1:
								case 2:
									return "a waste of my time";
								case 3: 
									return "all right";
								case 4:
									return "really nice!";
								case 5:
									return "life changing!!!";
								default: 
									return "";
							}
						};
				   });

			// boostrapping my app on a particular DOM element
			angular.element(document).ready(function () {
				angular.bootstrap(document, ["app"]);	// start angular
			});
		});

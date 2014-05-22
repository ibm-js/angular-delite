require([
		"angular",
		"delite/register",
		"deliteful/ProgressBar",
		"angular-delite/wrappers/widget",
		], function(angular, register, ProgressBar, wrapper){
			
			angular.module("app", [])
				   .directive("ngProgressBar", function(){
					   return wrapper(ProgressBar);
				   })

			// boostrapping my app on a particular DOM element
			angular.element(document).ready(function () {
				angular.bootstrap(document, ["app"]);	// start angular
			});
		});

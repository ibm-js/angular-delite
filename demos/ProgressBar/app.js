require([
		"delite/register",
		"deliteful/ProgressBar",
		"angular-delite/ngWidget",
		"angular/angular",
		], function(register, ProgressBar, ngWidget){
			
			angular.module("app", [])
				   .directive("ngProgressBar", function(){
					   return ngWidget(ProgressBar);
				   })

			// boostrapping my app on a particular DOM element
			angular.element(document).ready(function () {
				angular.bootstrap(document, ["app"]);	// start angular
			});
		});

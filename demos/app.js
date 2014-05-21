var p;


require([
		"dcl/dcl",
		"dojo/has",
		"delite/register",
		"dojo/domReady!"
		], function(dcl, has, register, ngStarRating){

			//var app = angular.module("app", [ "StarRating" ]); 
			var app = angular.module("app", ["ui"]); 

			// a controller was added for debugging, not necessary
			app.controller("MainCtrl", function ($scope) {
					$scope.value = 4;
					$scope.max = 6;
				});
			app.directive("demoCode", function($http){
				var fetch = function(scope, widget, what) {
					var varName = what.replace(".", "-");
					var url = widget + what;
					$http.get(url).success(function(content){
						scope[varName] = content;
						p = content;
						console.log(scope)
					});
				}
				return {
					restrict: 'E',
					scope: {widget: "@", srcs: "@"},
					controller: function($scope) {
						$scope.prettyName = function(name){
							return name.replace(".", "-");
						};
						$scope.getContent = function(name) {
							return $scope[$scope.prettyName(name)];
						};
					},
					link: function(scope, element, attrs){
						var widget = scope.widget + "/";

						scope.files = attrs.srcs.match(/\w+\.\w+/g);
						scope.files.forEach(function(f){
							fetch(scope, widget, f);
						});
						console.log("files", scope.files);
					},
					templateUrl: "template-html.html"
				}
			});

			// boostrapping my app on a particular DOM element
			angular.element(document).ready(function () {
				var wrapper = document.getElementById('app');
				angular.bootstrap(wrapper, ["app"]);	// start angular
				register.parse();						// start delite
			});
		});




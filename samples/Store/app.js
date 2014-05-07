var lol, lol1, p1, p2, _rest, piou, _list, _Rest;
require([
		"dcl/dcl",
		"dojo/has",
		"dojo/_base/declare",
		"delite/register",
		"angular-delite/samples/Store/ngRest",
		//"angular-delite/samples/Store/ngStarRating",
		"angular-delite/ngWidget",
		"deliteful/list/List",
		"dstore/Observable",
		"angular/angular",
		"dojo/domReady!"
		], function(dcl, has, declare, register, ngRest, ngWidget, List){

			angular.module("Model", ["ngRest"])
				.factory("BookList", function (Rest) {
					return new Rest({target: "http://localhost:1337/book/"})
				});

			angular.module("List", ["Model"]).directive("ngList", ["BookList", function (BookList) {
				return ngWidget(List, {selectedItem: "="}, function(Constructor){
					var list = new Constructor();

					list.store = BookList;

					_list = list;
					list.itemToRenderItem = function (item) {
						return {
							label     : item.title,
							righttext : item.rating,
							id        : item.id
						};
					};

					return list; // return a widget instance
				});
			}]);


			var app = angular.module("app", [ "Model", "List"]);
			app.controller("BookListCtrl", 
				function ($scope, BookList) {
					$scope.data = {};
					BookList.get("").then(function (d) {
						$scope.data.books = d;
					});
					$scope.$watch("selectedItem", function(newValue, oldValue){
						if (typeof $scope.selectedItem === "object" && $scope.selectedItem !== null) {
							if ("id" in $scope.selectedItem)
								BookList.get($scope.selectedItem.id).then(function(d){
									$scope.data.currentBook = d;
								});
						} else {
							$scope.data.currentBook = null;
						}
					});
				});

			// boostrapping my app on a particular DOM element
			angular.element(document).ready(function () {
				var wrapper = document.getElementById('app');
				angular.bootstrap(wrapper, ["app"]);

				// it appears that this must be triggered only at the very end
				register.parse();
			});
		});

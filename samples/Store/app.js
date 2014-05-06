var lol, lol1, p1, p2, _rest, piou, _list, _Rest;
require([
		"dcl/dcl",
		"dojo/has",
		"dojo/_base/declare",
		"delite/register",
		"angular-delite/samples/Store/ngRest",
		"angular-delite/samples/Store/ngStarRating",
		//"angular-delite/samples/Store/ngList",
		"angular-delite/ngWidget",
		"deliteful/list/List",
		"deliteful/list/ItemRenderer",
		//"deliteful/list/List",
		//"dstore/Memory",
		"dstore/Observable",
		"angular/angular",
		"dojo/domReady!"
		], function(dcl, has, declare, register, ngRest, ngStarRating, ngWidget, List, ItemRenderer){

			angular.module("Model", ["ngRest"])
				.factory("BookList", function (Rest) {
					//var ObservableRest = declare("ObservableRest", [Observable, Rest], {})
					var rest = new Rest({target: "http://localhost:1337/book/"})
					_rest = rest;
					return rest;
				});
			ngWidget("List", List, {selectedItem: "="}, function(Constructor){
				var list = new Constructor({});
				console.log("list", list);

				list.store = _rest;
				list.itemToRenderItem = function (item) {
					return {
						label     : item.title,
						righttext : item.rating,
						id : item.id
					};
				};
				_list = list;
				//list.selectionMode = "single";
				list.selectionMode = "single"
				
				return list;
			}, ["Model"]);

///////////////////////// nglist
		//angular.module("List", ["Model"])
			//.directive("ngList", function (BookList) {
				//var directive = {
					//restrict: 'E',
					//controller: function ($scope) { },
					//scope: {},
					//link: function (scope, elem, attrs) {
						//// insert widget in angular directive
						//var mywidget = new List();
						//scope.widget = mywidget;
						//mywidget.store = _rest;
						//w = mywidget;
						//elem.append(scope.widget);
						//w.itemToRenderItem = function (item) {
							//return {
								//label     : item.title,
								//righttext : item.rating
							//};
						//};

						////_r = BookList;
						//// bind widget propreties with directive scope
						////setWatchers(scope, isolatedScope);
					//}
				//};
				//return directive;
			//});


			var app = angular.module("app", [ "Model", "List"]);

			// a controller was added for debugging, not necessary
			app.controller("BookListCtrl", 
				function ($scope, BookList) {
					//$scope.data = B;
					var R = BookList;
					_rest = BookList;
					$scope.data = {};
					R.get("").then(function (d) {
						$scope.data.books = d;
					});
					console.log($scope.mylist);
					pp = $scope;
				});
			//console.log("my appp", app._invokeQueue[0][2]);
			// boostrapping my app on a particular DOM element
			angular.element(document).ready(function () {
				var wrapper = document.getElementById('app');
				angular.bootstrap(wrapper, ["app"]);

				// it appears that this must be triggered only at the very end
				register.parse();
			});
		});




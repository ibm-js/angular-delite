require([
		"angular",
		"delite/register",
		"deliteful/list/List",
		"angular-delite/wrappers/widget",
		"angular-delite/dstore/ObservableRest",
		], function(angular, register, List, wrapper){
			
			angular.module("app", ["dstore.rest"])
					.factory("BookList", function (Rest) {
						return new Rest({target: "http://localhost:1337/book/"})
					})
				   .directive("ngList", function(BookList){
					   return wrapper(List, {selectedItems: "="}, function(Constructor){
						   var list = new Constructor({store: BookList});
						   list.itemToRenderItem = function (item) {
							   return {
								   label     : item.title,
								   id        : item.id
							   };
						   };
						   return list;
					   });
				   })
				   .controller("MainCtrl", function($scope){
					   $scope.add = function (newTitle) {
							$scope.books.store.add({title: newTitle});
					   };
					   $scope.removeSelected = function(){
						   $scope.selectedItems.forEach(function(item){
							   $scope.books.store.remove(item.id).then(function(e){
								   console.log("callback: removed", e);
							   });
						   });
					   }
				   });

			// boostrapping my app on a particular DOM element
			angular.element(document).ready(function () {
				angular.bootstrap(document, ["app"]);	// start angular
			});
		});

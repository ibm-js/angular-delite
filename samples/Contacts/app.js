require([
		"dcl/dcl",
		"dojo/has",
		"delite/register",
		"angular-delite/samples/Contacts/ngRest",
		"angular/angular",
		"angular/resource",
		"dojo/domReady!"
		], function(dcl, has, register, ngRest){

			var app = angular.module("app", [ "ngRest" ]);

			app.factory("BookList", function (Rest, $q) {
				var rest = new Rest({target: "http://localhost:5000/books/"})
				return rest;
			});


			// a controller was added for debugging, not necessary
			app.controller("starrater", 
				function ($scope, BookList) {
					$scope.value = 3
					$scope.max = 6
					$scope.data = {hello: "oui"}
					// fetching the books
					console.log("About to fetch all the data");
					BookList.get("all").then(function (books) {
						console.log("Got it");
						$scope.data.books = books;
					});

					$scope.selectedBook = null;
					$scope.selectBook = function (bookid) {
						//$scope.selectedBook = $scope.data.books.filter(function(e){e.id == bookid})
						BookList.get(bookid).then(function (book) {
							$scope.selectedBook = book[0];
						})
					};
					$scope.updateSelectedBook = function(){
						BookList.put($scope.selectedBook)
						$scope.data.books[$scope.selectedBook.id] = $scope.selectedBook;
					}
				});

			// boostrapping my app on a particular DOM element
			angular.element(document).ready(function () {
				var wrapper = document.getElementById('app');
				angular.bootstrap(wrapper, ["app"]);

				// it appears that this must be triggered only at the very end
				register.parse();
			});
		});




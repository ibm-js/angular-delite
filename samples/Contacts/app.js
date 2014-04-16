var lol, lol1, p1, p2;
require([
		"dcl/dcl",
		"dojo/has",
		"delite/register",
		"angular-delite/samples/Contacts/ngRest",
		"angular-delite/samples/Contacts/ngStarRating",
		"angular/angular",
		"angular/resource",
		"dojo/domReady!"
		], function(dcl, has, register, ngRest){

			angular.module("Model", ["ngRest"])
				.factory("BookList", function (Rest) {
					var rest = new Rest({target: "http://localhost:5000/books/"})
					return rest;
				})
				.factory("Model", function (BookList) {
					var model = {
						books : null,
						selected: null,
						selectedisNew: false,
						template: null,
						getTitles: function(){
							BookList.get("all").then(function (books) {
								console.log("fetched again");
								model.books = books;
							});
						},
						getTemplate: function(){
							BookList.get(0).then(function (book) {
								model.template = angular.copy( book[0] );
								p2 = model.template;
								console.log(book, model.template);
								Object.keys(model.template).forEach(function (key) {
									model.template[key] = null;
								});

								model.template["id"] = "" + model.books.length
							});
						},
						getBook: function (id, callback) {
							BookList.get(id).then(function (book) {
								model.books[id] = book[0];
								if (typeof callback !== undefined) {
									callback(book);
								}
							});
						},
						updateBook: function (book) {
							model.books[book.id] = angular.copy(book);
							BookList.put(book);
							model.selected = null;
							model.selectedisNew = false;
						}
					}

					// init
					model.getTitles();
					model.getTemplate();
					return model;
				})

			angular.module("BookDetails", ["Model"])
				.controller("BookDetailsCtrl", function ($scope, Model) {
					$scope.data = Model;
					$scope.updateBook = function () {
						Model.updateBook($scope.data.selected);
					}
					p2 = Model
				});

			var app = angular.module("app", [ "BookDetails", "Model", "StarRating", "StarRatingEditable"]);

			// a controller was added for debugging, not necessary
			app.controller("BookListCtrl", 
				function ($scope, BookList, Model) {
					$scope.data = Model;

					$scope.selectBook = function (bookid) {
						$scope.data.getBook(bookid, function () {
							$scope.data.selected = angular.copy($scope.data.books[bookid])
						});
					};

					$scope.newBook = function () {
						$scope.data.selected = angular.copy($scope.data.template);
						$scope.data.selectedisNew = true;
					};
					//$scope.addNewBook = function () {
						//BookList.get(0).then(function (book) {
							//var exampleObject = book[0];
							//$scope.newBook = {}
							//for (k in exampleObject){
								//$scope.newBook[k] = null;
							//}
							//$scope.newBook["id"] = $scope.data.books.length;
							//$scope.newBook["title"] = "Un nouveau titre";
							//BookSelector.selected = $scope.newBook;
						//})
					//};

					//$scope.addBook = function () {
						//$scope.data.books.set($scope.newBook.id, $scope.newBook);
						//BookList.add($scope.newBook);
						//$scope.newBook = null;
					//};
				});

			// boostrapping my app on a particular DOM element
			angular.element(document).ready(function () {
				var wrapper = document.getElementById('app');
				angular.bootstrap(wrapper, ["app"]);

				// it appears that this must be triggered only at the very end
				register.parse();
			});
		});




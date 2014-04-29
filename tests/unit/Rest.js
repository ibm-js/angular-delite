_R = null;
define([
		"intern!object",
		"intern/chai!assert",
		"delite/register",
		"dcl/dcl",
		"angular-delite/samples/Store/ngRest",
		"angular/angular",
		"dojo/domReady!"
		], function (registerSuite, assert, register) {
			var wrapper, app;



			var getAndCheckProperty = function(R, id, propName, expected){
				var d = this.async(1000);
				R.get(id).then(
					d.callback(function(data){
						assert.equal(data[propName], expected)
					}), d.reject.bind(d));
				return d;
			}
			var getSync = function(d, R, id, success, fail){
				R.get(id).then(
					d.callback(function(data){
						//sleep();
						success(data)
					}), d.callback(function(data){
						fail(data);
					}));
				return d;
			}

			var sleep = function(){
				var a, i;
				for (i = 0, a = []; i < 50000000; i++){ a.push("a") }
			}

			registerSuite({
				name: "angular-delite test suite",
				setup: function () {
					wrapper = document.createElement("div");
					wrapper.setAttribute("id", "app");
					wrapper.setAttribute("ng-controller", "BookListCtrl");
					angular.module("Model", ["ngRest"])
						.factory("BookList", function (Rest) {
							var rest = new Rest({target: "http://localhost:1337/book/"})
							return rest;
						});

					app = angular.module("app", [ "Model"]);
					app.controller("BookListCtrl", 
						function ($scope, BookList) {
							$scope.R = BookList; 
							_R = $scope.R;
						});

					angular.element(document).ready(function () {
						angular.bootstrap(wrapper, ["app"]);
						register.parse();
					});

				},
				"Get a value that exists" : function () {
					var d = this.async(1000);
					_R.get(3).then(d.callback(function(data){
						assert.equal(data.id, 3);						
					}), d.reject.bind(this));
				},
				"get a value that doesn't exist" : function () {
					var d = this.async(1000);
					_R.get(99880)
						.then(d.reject.bind(this), 
							d.callback(function(err){
								assert.equal(err.name, "RequestError");						
							}));
				},
				"Updating a value with save()/put()" : function(){
					var d = this.async(2000);
					_R.get(3)
						.then(function(data){
							data.rating = 80;
							return data.save();		
						}).then(function(){
							return _R.get(3);
						}).then(d.callback(function(data){
							assert.equal(data.rating, 80);						
						}), d.reject.bind(this));
				},
				teardown: function () {
				}
			});
		});

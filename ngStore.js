define(["dojo/_base/declare"], function (declare) {
	return function (name, store) {


		angular.module("ng" + name, []) 
			.factory(name, function ($q) {

				var _store = declare(store, {
					get: function (id) {
						var d = $q.defer();
						this.inherited(arguments).then(function (data) {
							d.resolve(data)	
						});
						return d.promise;
					}
				});
				

				return _store;
			});
	};
});

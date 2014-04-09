define([], function () {
	return function (name, store) {
		angular.module("ng" + name, []) 
			.factory(name, function () {
				return store;
			});
	};
});

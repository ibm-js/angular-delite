define(["dojo/_base/declare"], function (declare) {
	return function (store, q) {
		var promise = function(){
			return function(){
				var d = q.defer();
				var res = this.inherited(arguments);
				res.then(function () {             // success
					d.resolve.apply(d, arguments);
				}, function(){                     // error
					d.reject.apply(d, arguments);
				}, function () {                   // update
					d.notify.apply(d, arguments);
				});
				// TODO: no access is provided to dojo's promise methods
				// (isRejected, isCancelled, etc.) It may be necessary.
				return d.promise;
			};
		};
		
		var _store = store;

		if (typeof q !== "undefined") {
			_store = declare(store, {
				get    : promise(),
				save   : promise(),
				add    : promise(),
				put    : promise(),
				remove : promise()
			});
		}
		
		return _store;
	};
});

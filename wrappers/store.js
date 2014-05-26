define(["dojo/_base/declare"], function (declare) {

	/**
	 * wraps a dojo promise inside an angular promise
	 */
	var promise = function(q){
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

	/**
	 * wraps a store constructor with angular promises
	 * @param {module:dstore/*} Constructor A store constructor.
	 * @param {angular.$q} q Promise service of angular
	 */
	return function (/*Store*/ Constructor, /*angular.$q*/ q) {
		
		var _Constructor = Constructor;

		if (typeof q !== "undefined") {
			_Constructor = declare(Constructor, {
				get    : promise(q),
				save   : promise(q),
				add    : promise(q),
				put    : promise(q),
				remove : promise(q)
			});
		}
		
		return _Constructor;
	};
});

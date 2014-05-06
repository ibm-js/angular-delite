define([], function () {

	// helpers
	var isUndefined = function (value) {
		return typeof value === "undefined";
	};

	var overwriteObject = function (obj1, obj2) {
		Object.keys(obj2).forEach(function (p) {
			obj1[p] = obj2[p];
		});
		return obj1;
	};

	var diffArray = function (all, excluded) {
		var isIncluded = function (property) {
			return (excluded.indexOf(property) === -1);
		};
		return all.filter(isIncluded);
	};

	/**
	 * returns attributes of directive
	 * takes raw attrs parameter of the directive and
	 * makes up a clean version out of it with only relevant
	 * attrs.
	 */
	var getAttrs = function(rawAttrs){
		var attr = {};
		Object.keys(rawAttrs.$attr).forEach(function(p){
			attr[p] = rawAttrs[p];
		});
		return attr;
	};

	/**
	 * returns the id of a widget if any, null otherwise
	 */
	var getId = function (attrs) {
		var allowed = ["id", "data-id", "x-id"];
		for (var a in attrs) {
			if (attrs.hasOwnProperty(a)
					&& allowed.indexOf(a) > -1) {
						return attrs[a];
					}
		}
		return null;
	};

	/**
	 * extracts all the propreties of the widget
	 */
	var getDefaultProps = function (Constructor) {
		// getting all the props
		var instance = new Constructor();
		var all = Object.getPrototypeOf(instance)._getProps();
		// TODO: not sure whether this actually gets all the properties 
		// eg: when a widget B inherits from A, you probaly want A's properties
		// as well, but i'm not sure this includes them.

		var unwanted = all.filter(function (prop) {
			// TODO: we might also want to remove very nested object
			// not sure though how to detect theses
			var p = instance[prop];
			var c1 = typeof p === "function"; // remove functions
			return c1;
		});
		var otherUnwanted = ["baseClass", "focused", "widgetId", "invalidProperties", "invalidRendering"];
		var excluded = unwanted.concat(otherUnwanted);

		instance.destroy(); 
		// TODO: not sure whether this actually restores memory to its initial state
		// It might be better to just pass in the real instance of the widget, not only the 
		// constructor

		// filtering relevant props
		return diffArray(all, excluded);
	};

	/**
	 * create the default isolated scope that compiles
	 * all the attributes as string values.
	 */
	var defaultScope = function (props) {
		var s = {};
		props.forEach(function (p) {
			s[p] = "@";
		});
		return s;
	};

	/**
	 * creates the isolated scope of the directive
	 */
	var setIsolatedScope = function (Constructor, overwrite) {
		var props = getDefaultProps(Constructor);
		var s = defaultScope(props);
		if (typeof overwrite === "object") { // if overwrite defined, overwrite the scope
			overwriteObject(s, overwrite);
		}
		return s;
	};

	var setTypedValue = function (instance, property, value) { // TODO: should be useless now, remove it when sure
		// TODO: this should really be made more robust
		// also see if there is a way to use https://github.com/ibm-js/delite/blob/master/CustomElement.js#L102
		switch (typeof instance[property]) {
			case "number":
				return value - 0; // NOTE: this is just to make sure the output is a number
			default:
				return value;
		}
	};

	/**
	 * initialize the widget with attributes values
	 */
	var initProps = function (scope, props, attrs) {
		Object.keys(props).forEach(function (p) {
			if (! isUndefined(attrs[p])){
				scope.widget[p] = scope[p];
			}
		});

	};

	/**
	 * return props in scope which are shared with parent 
	 * scope
	 */
	var getOutedScope = function (isolatedScope) {
		var isOuted = function (p) { return isolatedScope[p] === "="; }
		return Object.keys(isolatedScope).filter(isOuted);
	};

	/**
	 * sets watchers on props that are exposed to the parent scope
	 */
	var setWatchers = function (scope, props, attrs) {
		getOutedScope(props).forEach(function (p) {
			// if scope exposed property changes, update widget property
			scope.$watch(p, function (newValue) {
				if (!isUndefined(newValue) && scope.widget[p] !== newValue) {
					scope.widget[p] = newValue;
				}
			});

			// if widget exposed property changes, update scope property
			scope.widget.watch(p, function () {
				if (scope.widget[p] !== scope[p]) {
					(function (scope, p) {
						setTimeout(function () { // TODO: 
							scope.$apply(function(){
								if (p in getAttrs(attrs)) {
									scope[p] = scope.widget[p];
								}
							});
						}, 1);
					})(scope, p);
				}
			});
		});
	};

	/** 
	 * defines an angular `E` directive that holds the widget.
	 * The scope is isolated.
	 * USAGE: 
	 *		// basic use case
			angular.module("DeliteWidget", []).directive("deliteWidget", function () {
				return ngWidget(List);
			});
	 */
	var ngWidget = function (Constructor, overwrite, init) {
		var isolatedScope = setIsolatedScope(Constructor, overwrite);
		return {
			restrict: "E",
			scope: isolatedScope,
			link: function (scope, elem, rawAttrs) {

				// create the instance
				scope.widget = typeof init === "function" ?
					init(Constructor) : new Constructor();

				// insert widget in angular directive
				elem.append(scope.widget);

				// get relevant attributes
				var attrs = getAttrs(rawAttrs);

				// make widget available in parent scope if `id` was given
				if (! isUndefined(scope.$parent)) {
					var id = getId(attrs);
					if (id !== null) {
						scope.$parent[id] = scope.widget;
					}
				}

				// process attrs values to their correct type
				// TODO: not sure whether this should be kept, especially
				// since angular users are used to values behaving like strings
				// and don't expect any kind of preprocessing

				//Object.keys(attrs.$attr).forEach(function (a) {
					//attrs[a] = setTypedValue(scope.widget, a, attrs[a]);
				//});

				// initialize the props of the widget with the attribute values
				initProps(scope, isolatedScope, attrs);
				// TODO: be more careful with default values

				// bind widget proprieties with directive scope
				setWatchers(scope, isolatedScope, rawAttrs);
			}
		};
	};
	return ngWidget;
});

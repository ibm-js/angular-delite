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
	camelToDash = function (str) {
		return str.replace(/([a-z\d])([A-Z])/g, '$1-$2').toLowerCase();
	};
	dashToCamel = function (str) {
		return str.replace(/(-[a-z])/g, '_');
	};

	/**
	 * create an instance of the widget, using `init` if defined;
	 */
	var createInstance = function (Constructor, init) {
		var instance = null;
		switch(typeof init) {
			case "function": 
				instance = init(Constructor);
				if (instance == null) {
					throw new Error("init() did not return an instance");
				}
				break;
			case "object": 
				instance = new Constructor(init);
				break;
			default:
				instance = new Constructor();
		}
		return instance;
	};
	
	/**
	 * check whether an attribute is an event attribute
	 */
	var isEventAttr = function(a){ 
		return a.indexOf("on") === 0; 
	};

	/**
	 * transforms onClick to onclick
	 */
	var formatEventAttr = function(eventAttr) {
		return eventAttr.toLowerCase();
	};

	/**
	 * returns attributes of directive
	 * takes raw attrs parameter of the directive and
	 * makes up a clean version out of it with only relevant
	 * attrs.
	 */
	var getAttrs = function(rawAttrs){
		var attrs = {};
		Object.keys(rawAttrs.$attr).forEach(function(p){
			if (isEventAttr(p)) {
				attrs[formatEventAttr(p)] = new Function(rawAttrs[p])
			} else {
				attrs[p] = rawAttrs[p];
			}
		});

		return attrs;
	};

	/**
	 * return a hash similar to attrs but containing only
	 * attributes prefixed corresponding to an event
	 */
	var getEventAttrs = function (attrs) {
		eventAttrs = {};
		Object.keys(attrs).filter(isEventAttr).forEach(function(a){
			eventAttrs[a] = attrs[a];
		});
		return eventAttrs;
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
		//var all = Object.getPrototypeOf(Constructor)._getProps();
		var Spec = Constructor._ctor.prototype;
		var all = Spec._getProps();
		// TODO: not sure whether this actually gets all the properties 
		// eg: when a widget B inherits from A, you probaly want A's properties
		// as well, but i'm not sure this includes them.

		var unwanted = all.filter(function (prop) {
			// TODO: we might also want to remove very nested object
			// not sure though how to detect theses quickly
			var p = Spec[prop];
			var cond = [
				typeof p === "function"   // remove functions
			];
			return cond.every(function (c) {return c === true;});
		});
		var otherUnwanted = ["baseClass", "focused", "widgetId", "invalidProperties", "invalidRendering"];
		var excluded = unwanted.concat(otherUnwanted);

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
	 *
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
			// TODO: this block should not be handeling event attributes (onclick, onchange, etc.)
			// we should make sure they are filtered
			if (! isUndefined(attrs[p])){
				scope.widget[p] = scope[p];
			}
		});	
		

		Object.keys(getEventAttrs(attrs)).forEach(function(p){
			var fp = formatEventAttr(p);
			if (! isUndefined(scope.widget[fp])) {
				scope.widget[fp] = eventAttrs[p];
			}
		});

	};


	/**
	 * inserts widget into parent scope
	 * requires `id` to be correctly defined as a string
	 */
	var exposeToParentScope = function (scope, widget, id) {
		if (! isUndefined(scope.$parent)) {
			scope.$parent[id] = widget;
		}
	};


	/**
	 * return props in scope which are exposed to the parent scope
	 * @param {Object} isolatedScope The isolated scope hash
	 * @return {Array} a list of all exposed proprieties.
	 */
	var getOutedScope = function (isolatedScope) {
		var isOuted = function (p) { return isolatedScope[p] === "="; }
		return Object.keys(isolatedScope).filter(isOuted);
	};

	/**
	 * sets watchers on props that are exposed to the parent scope
	 * @param {Scope} scope The scope of the directive
	 * @param {Object} props The isolated scope hash
	 * @param {Object} attrs Attributes of the directive as a hash of (key, value) pairs
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
						setTimeout(function () {
							scope.$apply(function(){
								if (p in attrs) {
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
	 * @param {module:deliteful/*} Constructor 
	 *
	 * @example <caption>basic use case</caption>
	 *  	angular.module("DeliteWidget", []).directive("deliteWidget", function () {
	 *  		return ngWidget(List);
	 *  	});
	 *
	 * @example <caption>Expose proprieties to parent scope</caption>
	 *  	angular.module("DeliteWidget", []).directive("deliteWidget", function () {
	 *  		return ngWidget(List, {selectedMode: '='});
	 *  	});
	 *
	 * @example <caption>Initialize a widget</caption>
	 *  	angular.module("DeliteWidget", []).directive("deliteWidget", function () {
	 *  		return ngWidget(List, {}, {selectedMode: "Single"});
	 *  	});
	 *
	 * @example <caption>Initialize a widget (other syntax)</caption>
	 *  	angular.module("DeliteWidget", []).directive("deliteWidget", function () {
	 *  		return ngWidget(List, {}, function(Constructor){
	 *				var myList = new Constructor();
	 *				myList.selectedMode = "Single";
	 *				return myList;
	 *  		});
	 *  	});
	 *
	 */
	var ngWidget = function (/*Widget*/ Constructor, /*Object*/ overwrite, /*Function || Object*/ init) {
		var isolatedScope = setIsolatedScope(Constructor, overwrite);
		return {
			restrict: "E",
			scope: isolatedScope,
			link: function (scope, elem, rawAttrs) {

				// create the instance
				scope.widget = createInstance(Constructor, init);

				// insert widget in angular directive
				elem.append(scope.widget);

				// get relevant attributes
				// NOTE: rawAttrs hash contains many keys which are not actual attributes
				// therefore we make attrs to get rid of them.
				var attrs = getAttrs(rawAttrs); 

				// make widget available in parent scope if `id` was given
				var id = getId(attrs);
				if (id !== null) { exposeToParentScope(scope, scope.widget, id); }

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

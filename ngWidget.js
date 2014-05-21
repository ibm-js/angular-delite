define(["angular/angular"], function () {
	// helpers
	var isUndefined = angular.isUndefined,
		equals = angular.equals;

	var ObjectOverwrite = function (obj1, obj2) {
		Object.keys(obj2).forEach(function (p) {
			obj1[p] = obj2[p];
		});
		return obj1;
	};

	var ObjectFilter = function(input, func){
		var output = {};
		Object.keys(input).filter(function(k){
			if (func(k, input[k])) {
				output[k] = input[k];
			}
		});
		return output;
	}

	var ArrayDiff = function (all, excluded) {
		var isIncluded = function (property) {
			return (excluded.indexOf(property) === -1);
		};
		return all.filter(isIncluded);
	};

	/**
	 * creates an instance of the widget, using `init` if defined;
	 *
	 * @param {module:deliteful/*} Constructor Constructor for a deliteful widget
	 * @param {Function||Object} init Can be either a function that returns a widget instance or object used to initialize the widget
	 * @return {module:deliteful/*} a widget instance  
	 */
	var createInstance = function (Constructor, init) {
		var instance = null;
		switch(typeof init) {
			case "function": 
				instance = init(Constructor);
				if (instance === null) {
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
	 * checks whether an attribute is an event attribute
	 */
	var isEventAttr = function(a){ 
		return a.indexOf("on") === 0;  // checks if a starts with `on`
	};

	/**
	 * transforms onClick to onclick
	 */
	var formatEventAttr = function(eventAttr) {
		return eventAttr.toLowerCase();
	};

	var setTypedValue = function (widget, name, strValue) {
		// function
		if (isEventAttr(name)) {
			return (new Function(strValue)).bind(widget);
		}

		// number, boolean, object, string 
		switch (typeof widget[name]) {
			case "number":
				return strValue - 0;
			case "boolean":
				return strValue !== "false";
			case "object":
				return strValue;
			default: // "string"
				return strValue;
		}
	};

	/**
	 * returns the attributes of directive
	 * @description takes raw attrs parameter of the directive and
	 * makes up a clean version out of it with only relevant attrs.
	 * @param {module:deliteful/*} widget The widget instance
	 * @param {Object} rawAttrs The attributes hash as passed to the link function of the directive
	 * @return {Object} a hash of (attributeName, attributeValue) pairs
	 */
	var getAttrs = function (widget, isolatedScope, rawAttrs) {
		var attrs = {};
		Object.keys(rawAttrs.$attr).forEach(function(p){
			if (isEventAttr(p)) { // if p starts with "on"
				var fp = formatEventAttr(p); // converts "on-whatever" to "onwathever"
				attrs[fp] = setTypedValue(widget, p, rawAttrs[p]);;
			} else {
				if (isolatedScope[p] === "@") {
					attrs[p] = setTypedValue(widget, p, rawAttrs[p]);
				} else {
					attrs[p] = rawAttrs[p];
				}
			}
		});

		return attrs;
	};

	/**
	 * return a hash similar to attrs but containing only
	 * attributes prefixed corresponding to an event
	 * @param {Object} attrs Attributes of the directive as a hash of (key, value) pairs.
	 * @return {Object} a hash of (eventAttributeName, eventAttributeValue) pairs 
	 */
	var getEventAttrs = function (attrs) {
		return ObjectFilter(attrs, isEventAttr);
	};

	/**
	 * returns the id of a widget if any, null otherwise
	 * @param {Object} attrs Attributes of the directive as a hash of (key, value) pairs
	 * @return {String||Object} the value of id/data-id/x-id attribute or null
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
	 * extracts all the properties of the widget
	 * @description gets all the properties from the constructor then filters them using theses conditions
	 *	1. property is not a function
	 *	2. property is not one of ["baseClass", "focused", "widgetId", "invalidProperties" and "invalidRendering"]
	 * @param {Object} Constructor 
	 * @return {Array} An array containing the names of the properties of the widget that need to included in the isolated scope
	 * */
	var getProps = function (Constructor) {
		// getting all the props
		var Spec = Constructor._ctor.prototype;
		var all = Spec._getProps(); // NOTE this gets all the props specific to a widget, even inherited;

		var excluded = ["baseClass", "focused", "widgetId", "invalidProperties", "invalidRendering"];
		var isUnwanted = function (prop) {
			var value = Spec[prop];                     // default value of the property
			return typeof value === "function";         // is a function
		};
		excluded = excluded.concat(all.filter(isUnwanted));

		// filtering relevant props
		return ArrayDiff(all, excluded);
	};

	/**
	 * create the default isolated scope that compiles
	 * all the attributes as string values.
	 * @param {Array} props A list of all the properties of a widget instance.
	 * @return {Object} A hash representing the default isolated scope of the directive.
	 */
	var defaultScope = function (props) {
		var s = {};
		props.forEach(function(p){ s[p] = "@"; });
		return s;
	};

	/**
	 * creates the isolated scope of the directive.
	 * @param {module:deliteful/*} Constructor A widget constructor.
	 * @param {Object} overwrite A hash that redefines part of the isolated scope and overwrites it.
	 * @return {Object} A hash representing the isolated scope of the directive.
	 */
	var setIsolatedScope = function (Constructor, overwrite) {
		var props = getProps(Constructor);
		var s = defaultScope(props);
		if (typeof overwrite === "object") { // if overwrite defined, overwrite the scope
			ObjectOverwrite(s, overwrite);
		}
		return s;
	};


	/**
	 * initialize the widget with attributes values.
	 * @param {Object} scope The scope of the directive.
	 * @param {Object} isolatedScope The isolated scope hash.
	 * @param {Object} attrs Attributes of the directive as a hash of (key, value) pairs.
	 */
	var initProps = function (scope, isolatedScope, attrs) {
		// for widget props which are reference as attributes
		Object.keys(isolatedScope).forEach(function (p) { 

			// if prop in widget has a value, initialise the scope with it
			if ( ! isUndefined(scope.widget[p]) ){
				scope[p] = scope.widget[p];
			}

			// if attrs were initialized, overwrite widget value
			if ( !isUndefined(attrs[p]) ){
				switch(isolatedScope[p]) {
					case "@":
						scope.widget[p] = attrs[p];
						break;
					case "=":
						scope.widget[p] = scope[p];
						break;
						// TODO: case '&' is not supported atm, the reason being
						// no use cas was found for it in deliteful widgets
				}
			}
		});	

		// for event attributes which the widget "knows"
		var eventAttrs = getEventAttrs(attrs);
		console.log("eventAttrs", eventAttrs);
		Object.keys(eventAttrs).forEach(function(p){
			var fp = formatEventAttr(p);
			if (! isUndefined(scope.widget[fp])) {
				scope.widget[fp] = eventAttrs[p];
			}
		});

	};

	/**
	 * inserts widget into parent scope
	 * requires `id` to be correctly defined as a string
	 * @param {Object} scope The scope of the directive
	 * @param {module:deliteful/*} widget The widget instance
	 * @param {String} id The value of the id attribute
	 */
	var exposeToParentScope = function (scope, widget, id) {
		if (! isUndefined(scope.$parent)) {
			scope.$parent[id] = widget;
		}
	};

	/**
	 * return props in scope which are exposed to the parent scope
	 * @param {Object} isolatedScope The isolated scope hash
	 * @return {Array} a list of all exposed properties.
	 */
	var getOutedScope = function (isolatedScope) {
		var isOuted = function (p) { return isolatedScope[p] === "="; }
		return Object.keys(isolatedScope).filter(isOuted);
	};

	/**
	 * sets watchers on props that are exposed to the parent scope
	 * @param {Scope} scope The scope of the directive
	 * @param {Object} isolatedScope The isolated scope hash
	 * @param {Object} attrs Attributes of the directive as a hash of (key, value) pairs
	 */
	var setWatchers = function (scope, isolatedScope, attrs) {
		getOutedScope(isolatedScope).forEach(function (p) {
			// if scope exposed property changes, update widget property
			scope.$watch(p, function (newValue, oldValue) {
				if (!isUndefined(newValue) && ! equals(scope.widget[p], newValue)) {
					scope.widget[p] = newValue;
				}
			});

			// if widget exposed property changes, update scope property
			scope.widget.watch(p, function (name, oldValue, newValue) {
				if (p in attrs && 
					! equals(scope.widget[p], scope[p])) {
					(function (scope, p) {
						if (scope.$root.$$phase !== "$digest") { 
							// NOTE: this seems to be the only & dirty way to avoid 
							// the $digest collision error 
							// https://github.com/angular/angular.js/wiki/Anti-Patterns
							scope.$apply(function(){
								scope[p] = scope.widget[p];
							});
						}
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
	 * @example <caption>Expose properties to parent scope</caption>
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
		// NOTE: the isolated scope is constituted of all the properties specific to a widget
		// which are retrieved from the constructor. By default every property is passed as a 
		// string then overwritten through the `overwrite`
		var isolatedScope = setIsolatedScope(Constructor, overwrite);
		return {
			restrict: "E",
			scope: isolatedScope,
			link: function (scope, elem, rawAttrs) {

				// create the instance
				scope.widget = createInstance(Constructor, init);

				// insert widget in angular directive
				elem.append(scope.widget);

				scope.widget.startup(); // TODO: check if startup is actually necassary

				// get relevant attributes
				var attrs = getAttrs(scope.widget, isolatedScope, rawAttrs); 
				// NOTE: rawAttrs hash contains many keys which are not actual attributes
				// attrs is a subset of rawAttrs that gets rid of them.

				// make widget available in parent scope if `id` was given
				var id = getId(attrs);
				if (id !== null) { 
					exposeToParentScope(scope, scope.widget, id); 
				}

				// initialize the props of the widget with the attribute values
				initProps(scope, isolatedScope, attrs);
				// TODO: be more careful with default values

				// bind widget exposed properties with directive scope
				setWatchers(scope, isolatedScope, rawAttrs);

			}
		};
	};
	return ngWidget;
});

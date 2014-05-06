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

	var getOutedScope = function (isolatedScope) {
		var isOuted = function (p) { return isolatedScope[p] === "="; }
		return Object.keys(isolatedScope)
			.filter(isOuted);
	}

	var diffArray = function (all, excluded) {
		var isIncluded = function (property) {
			return (excluded.indexOf(property) === -1);
		};
		return all.filter(isIncluded);
	};

	/**
	 * extracts all the propreties of the widget
	 */
	var getDefaultProps = function (Constructor) {
		// getting all the props
		var instance = new Constructor();
		var all = Object.getPrototypeOf(instance)._getProps();
		console.log("props", all);
		var unwanted = all.filter(function (prop) {
			var p = instance[prop];
			return typeof p === "function";
		});
		instance.destroy();

		console.log("unwanted", unwanted);
		// filtering relevant props
		var excluded = unwanted.concat(["baseClass", "focused", "widgetId", "invalidProperties", "invalidRendering"]);
		return diffArray(all, excluded);
	};

	/**
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

	var defaultScope = function (props) {
		var s = {};
		props.forEach(function (p) {
			s[p] = "@";
		});
		return s;
	};

	var setIsolatedScope = function (Constructor, overwrite) {
		var props = getDefaultProps(Constructor);
		var s = defaultScope(props);
		if (typeof overwrite === "object") { // if overwrite defined, overwrite the scope
			overwriteObject(s, overwrite);
		}
		return s;
	};

	var setTypedValue = function (instance, property, value) {
		// TODO: this should really be made more robust
		// also see if there is a way to use https://github.com/ibm-js/delite/blob/master/CustomElement.js#L102
		switch (typeof instance[property]) {
			case "number":
				return value - 0;
			default:
				return value;
		}
	};

	var initScope = function (attrs, scope, isolatedScope) {

		
	};
	

	var setWatchers = function (scope, props, attrs) {
		//var excluded = ["selectedItems", "renderItems", "allowRemap", "copyAllItemProps", "scrollDirection", "scrollableNode", "labelAttr", "iconclassAttr", "righttextAttr", "righticonclassAttr", "categoryAttr", "categoryFunc"];
			qqq = scope;
		qa = getAttrs(attrs);

		var excluded = [];
		var all = Object.keys(props);
		var following = getOutedScope(props);

		// initialise the widget with attributes values
		console.log("all", all); 
		all.forEach(function (p) {
			if (! isUndefined(attrs[p])){
				scope.widget[p] = scope[p];
				scope[p] = scope.widget[p];
			}
		});
		console.log("following", following);
		following.forEach(function (p) {
			//if (p === "selectedItem") {
			// if scope property changes, update widget property
			scope.$watch(p, function (newValue) {
				if (!isUndefined(newValue) && scope.widget[p] !== newValue) {
						console.log("-> triggered on", p, "\t scope.widget.p", scope.widget[p], "\t scope.p", scope[p], "\t newValue", newValue, "\t\t", (new Date()).getMilliseconds());
						scope.widget[p] = newValue;
				}
			});


			// if widget property changes, update scope property
			scope.widget.watch(p, function () {
				if (scope.widget[p] !== scope[p]) {
					console.log("<- triggered on", p, "\t scope.p", scope[p], "\t scope.widget.p", scope.widget[p]);
					(function (scope, p) {
						setTimeout(function () {							
							scope.$apply(function(){
								if (p in getAttrs(attrs))
									scope[p] = scope.widget[p];
							});
						}, 1);
						
					})(scope, p);

				}
			});
			//}
		});
	};


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

	return function ngWidget(name, Constructor, overwrite, init, deps) { // TODO: deps should be second argument
		var directiveName = "ng" + name;
		var isolatedScope = setIsolatedScope(Constructor, overwrite);
		return angular.module(name, deps ? deps : []).directive(directiveName, function () {
			return {
				restrict: "E",
				scope: isolatedScope,
				link: function (scope, elem, attrs) {

					// insert widget in angular directive
					scope.widget = typeof init === "function" ?
						init(Constructor) : new Constructor();

					elem.append(scope.widget);

					// make widget available in parent scope if `id` was given
					if (!isUndefined(scope.$parent)) {
						var id = getId(attrs);
						if (id !== null) {
							scope.$parent[id] = scope.widget;
						}
					}

					// process attrs values to their correct type
					//Object.keys(attrs.$attr).forEach(function (a) {
						//attrs[a] = setTypedValue(scope.widget, a, attrs[a]);
					//});
					p = scope;
					console.log("scope", scope)
					// bind widget proprieties with directive scope
					console.log("isolatedScope", isolatedScope);


					setWatchers(scope, isolatedScope, attrs);
				}
			};
		});
	};
});

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

	// proprieties of a widget
	var getDefaultProps = function (Constructor) {
		// getting all the props
		var instance = new Constructor();
		var all = Object.getPrototypeOf(instance)._getProps();
		instance.destroy();

		// filtering relevant props
		var excluded = ["baseClass", "focused", "widgetId", "invalidProperties", "invalidRendering"];
		return diffArray(all, excluded);
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

	var setWatchers = function (scope, props) {
		Object.keys(props).forEach(function (p) {
			// if scope property changes, update widget property
			scope.$watch(p, function (newValue) {
				if (!isUndefined(newValue)) {
					scope.widget[p] = newValue;
				}
			});

			// if widget property changes, update scope property
			scope.widget.watch(p, function () {
				scope[p] = scope.widget[p];
				setTimeout(function () {
					scope.$apply();
				}, 1);
			});
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

	return function (name, Constructor, overwrite) {
		var directiveName = "ng" + name;
		var isolatedScope = setIsolatedScope(Constructor, overwrite);
		return angular.module(name, []).directive(directiveName, function () {
			return {
				restrict: "E",
				scope: isolatedScope,
				link: function (scope, elem, attrs) {

					// insert widget in angular directive
					scope.widget = new Constructor();
					elem.append(scope.widget);

					// make widget available in parent scope if `id` was given
					if (!isUndefined(scope.$parent)) {
						var id = getId(attrs);
						if (id !== null) {
							scope.$parent[id] = scope.widget;
						}
					}

					// process attrs values to their correct type
					Object.keys(attrs.$attr).forEach(function (a) {
						attrs[a] = setTypedValue(scope.widget, a, attrs[a]);
					});

					// bind widget proprieties with directive scope
					setWatchers(scope, isolatedScope);
				}
			};
		});
	};
});

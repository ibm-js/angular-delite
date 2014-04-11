define([], function () {


	// helpers
	var isUndefined = function (value) {
		return typeof value === "undefined";
	};

	var intersectArrays = function (arr1, arr2) {
		var res = [];
		arr1.forEach(function(p){
			if (arr2.indexOf(p) !== -1) {
				res.push(p);
			}
		});
		return res;
	};

	var overwriteObject = function (obj1, obj2) {
		Object.keys(obj2).forEach(function(p){
			obj1[p] = obj2[p];
		});
		return obj1;
	};

	// properties of a widget
	var getDefaultProps = function (constructor) {
		// getting all the props
		var instance = new constructor();
		var allprops = Object.getPrototypeOf(instance)._getProps();
		instance.destroy();

		// filtring relevant props
		var excluded = ["baseClass", "focused", "widgetId", "invalidProperties", "invalidRendering"];
		var isExcluded = function (property) {
			return (excluded.indexOf(property) === -1);
		};
		var props = allprops.filter(isExcluded);
		return props;
	};

	var defaultScope = function (props) {
		var s = {};
		props.forEach(function(p){
			s[p] = '@';
		});
		return s;
	};

	var makeIsolatedScope = function (constructor, overwrite) {
		var myprops = getDefaultProps(constructor);
		var s = defaultScope(myprops);
		if (typeof overwrite === "object"){ // if overwrite defined, overwrite the scope
			overwriteObject(s, overwrite);
		}
		return s;
	};

	var setWatchers = function (scope, props) {
		Object.keys(props).forEach(function(p){
			// if scope property changes, update widget property
			scope.$watch(p, function (newValue) {
				if (! isUndefined(newValue)){
					scope.widget[p] = newValue;
				}
			});

			// if widget property changes, update scope property
			scope.widget.watch(p, function(){
				scope[p] = scope.widget[p];
				setTimeout(function () { scope.$apply(); }, 1);
			});
		});
	};

	var _nameWidget = function (name) {
		return "ng" + name;
	};

	return function (name, widget, overwrite) {
		angular.module(name, [])
			.directive(_nameWidget(name), function () {
				var isolatedScope = makeIsolatedScope(widget, overwrite);
				var directive = {
					restrict: 'E',
					controller: function ($scope) { },
					scope: isolatedScope,
					link: function (scope, elem, attrs) {
						// insert widget in angular directive
						var mywidget = new widget();
						scope.widget = mywidget;
						elem.append(scope.widget);

						// bind widget propreties with directive scope
						setWatchers(scope, isolatedScope);
					}
				};
				return directive;
			});
	};
});

define([], function () {


	// helpers
	var isUndefined = function (value) {
		return typeof value === "undefined";
	};

	var overwriteObject = function (obj1, obj2) {
		Object.keys(obj2).forEach(function(p){
			obj1[p] = obj2[p];
		});
		return obj1;
	};

	var diffArray = function(all, excluded){
		var isIncluded = function (property) { 
			return (excluded.indexOf(property) === -1); 
		};
		return all.filter(isIncluded);
	};

	// properties of a widget
	var getDefaultProps = function (constructor) {
		// getting all the props
		var instance = new constructor();
		var allprops = Object.getPrototypeOf(instance)._getProps();
		instance.destroy();

		// filtring relevant props
		var excluded = ["baseClass", "focused", "widgetId", "invalidProperties", "invalidRendering"];
		var props = diffArray(allprops, excluded);
		return props;
	};

	var defaultScope = function (props) {
		var s = {};
		props.forEach(function(p){
			s[p] = '@';
		});
		return s;
	};

	var setIsolatedScope = function (constructor, overwrite) {
		var myprops = getDefaultProps(constructor);
		var s = defaultScope(myprops);
		if (typeof overwrite === "object"){ // if overwrite defined, overwrite the scope
			overwriteObject(s, overwrite);
		}
		return s;
	};

	var setTypedValue = function (instance, property, value) {
		// TODO: this should really be made more robust
		// also see if there is a way to use https://github.com/ibm-js/delite/blob/master/CustomElement.js#L102
		switch(typeof instance[property]) {
			case "number": var asNumber = parseFloat(value);
						   if (! isNaN(asNumber)){
							   return asNumber;
						   }
			default: return value;
		}
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

	var getId = function(attrs){
		var allowed = ["id", "data-id", "x-id"];
		for (a in attrs){
			if (allowed.indexOf(a) > -1) { return attrs[a]; }
		}
		return null;
	}

	return function (name, constructor, overwrite) {
		var directiveName = "ng" + name;
		var isolatedScope = setIsolatedScope(constructor, overwrite);
		return angular.module(name, []).directive(directiveName, function () {
				var directive = {
					restrict: 'E',
					controller: function ($scope) { },
					scope: isolatedScope,
					link: function (scope, elem, attrs) {

						// insert widget in angular directive
						scope.widget = new constructor();
						elem.append(scope.widget);

						// make widget available in parent scope if `id` was given
						if (! isUndefined(scope.$parent)) {
							var id = getId(attrs);
							if (id !== null) {
								scope.$parent[id] = scope.widget;
							}
						}

						// process attrs values to their correct type
						for (a in attrs.$attr){
							attrs[a] = setTypedValue(scope.widget, a, attrs[a]);
						}

						// bind widget propreties with directive scope
						setWatchers(scope, isolatedScope);
					}
				};
				return directive;
			});
	};
});

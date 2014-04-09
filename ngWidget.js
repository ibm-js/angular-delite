define([], function () {

	var _makeScope = function (props) { 
		var scopeValue = {};
		props.forEach(function (name) {
			scopeValue[name] = "=";
		});
		return scopeValue; // {p: '=', ... }
	};

	var _makeArgs = function (props, scope) { 
		var args = {};
		props.forEach(function(p){
			args[p] = scope[p];
		});
		return args; // {p: $scope.p, ... }
	};

	var _setWatchers = function (scope, props) {
		props.forEach(function(p){
			// if scope property changes, update widget property
			scope.$watch(p, function (newValue) {
				if (newValue){
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

	return function (name, widget, props) {
		angular.module(name, [])
			.directive(_nameWidget(name), function () {
				return {
					restrict: 'E',
					scope: _makeScope(props),
					controller: function ($scope) {
						// init
						$scope.widget = new widget(_makeArgs(props, $scope));
					},
					link: function (scope, elem, attrs) {
						// insert widget in angular directive
						elem.append(scope.widget);

						// update widget.value when ngModel is changed
						_setWatchers(scope, props);
					}
				};
			});
	};
});

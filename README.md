<!-- TODO: mention something on on-click type of attributes -->

# angular-delite

This repository contains a few wrappers that allow you to use some 
of deliteful/dstore features into a regular angular application.

## Usage

### Using a deliteful widget in an angular context

Any regular deliteful widget can be wrapped into an angular module and used as
a directive. 

1. Create a new directive in your app and give it a name (eg: `ngProgressBar`).
`ngWidget` specifies your directive so that you end up with a custom element `<ng-progress-bar></ng-progress-bar>`
that accepts attributes matching the `deliteful/ProgressBar` widget.
```js
define([
	"angular",
	"angular-delite/wrappers/widget",
	"deliteful/ProgressBar"
	], function (angular, wrapper, ProgressBar) {
		angular.module("myApp", [])
			.directive("ngProgressBar", function(){
				return wrapper(ProgressBar);
			});
	});
```
2. Use you directive simply by invoking it in your app.
```html
<ng-progress-bar value="30"></ng-progress-bar>
```

<a id="init"></a>
### Initialize the widget
While attributes can perfectly initialize your widget, you may want do this when your widget instance is created, 
for some specific widgets that require it.
In that case, `ngWidget` lets you pass a hash that specifies an initial value for each or some of the properties.

```js
angular.module("myApp", [])
	.directive("ngProgressBar", function(){
		return ngWidget(ProgressBar, {}, {value: 70, max: 100});
	});
```

You can also passing in instead a function with the only condition that it returns an instance of the widget.

```js
angular.module("myApp", [])
	.directive("ngProgressBar", function(){
		return ngWidget(ProgressBar, {}, function(Constructor){
			var instance = new Constructor();
			instance.value = 42;
			return instance; // must return a widget instance created with Constructor
		});
	});
```


### Interacting with the widget

#### More about what `ngWidget` does

The directive created by `ngWidget` has a isolated scope. By default, this scope accepts any attribute whose name
matches the name of a widget property and sets up a one-way biding.

For example, in the case of `deliteful/ProgressBar`, the isolated scope defined by `ngWidget` will look like:
```js
{
	value          : "@",
	max            : "@",
	min            : "@",
	displayExtMsg  : "@",
	fractionDigits : "@",
	message        : "@"
}
```

#### Passing parent scope variables to the widget through attributes
This is done by overwritting the default isolated scope.

```js
angular.module("myapp", [])
	.directive("ngprogressbar", function(){
		return ngwidget(progressbar, {value: "="});
	});
```

This will produce the following scope 

```js
{
	value          : "=",
	max            : "@",
	min            : "@",
	displayExtMsg  : "@",
	fractionDigits : "@",
	message        : "@"
}
```

```html
<div ng-controller="MyCtrl">
	<input type="number" ng-model="v" />
	<!-- variable `$scope.v` is mapped to the property "value" of the widget -->
	<ng-progress-bar value="v"></ng-progress-bar>
</div>
```

#### Accessing the entire widget instance from parent scope
The deliteful widget can be accessed in the parent scope when an `id` attribute is added in the directive.

```html
<div ng-controller="ParentCtrl">
	<ng-my-widget name="Bob" id="myWidget"></ng-my-widget>
	This guys name is {{myWidget.name}}
</div>
```

```js
function ParentCtrl($scope){
	$scope.rename = function(){
		$scope.myWidget.name = "Paul";
	}
}
```

You can also use `data-id` or `x-id` instead, as `id` must be unique to an entire page, 
wherease our variable is unique to the parent scope only.

NB: you can't use this to initialize you widget from the controller, cf. https://github.com/tkrugg/angular-delite/issues/1
Instead use [this](#init).

### Store

#### Using Rest and Memory
`angular-delite/dstore/Rest` contains an angular module `"dstore.rest"` with a 
factory `Rest` that holds the store contructor, and can be called in any controller.

```js
define([
	"angular",
	"angular-delite/dstore/Rest" // contains an angular module "dstore.rest"
	], function (angular) {
		angular.module("myApp", ["dstore.rest"])
			.controller("MainCtrl", function($scope, Rest){

				var store = new Rest({target: "http://go.get.it"});

				store.get(3).then(function(book){
					console.log("Found it!", book);
				}, function(err){
					console.log("Something went wrong, look!", err);
				});

			});
	});
```

The memory store can be used the very same way.

```js
define([
	"angular",
	"angular-delite/dstore/Memory" // contains an angular module "dstore.memory"
	], function (angular) {
		angular.module("myApp", ["dstore.memory"])
			.controller("MainCtrl", function($scope, Memory){
				var store = new Memory();
				...
			});
	});
```

It is advised to wrap your store instance in a angular factory or other provider, so that you 
can properly use it from multiple controllers.

#### The wrapper
Similarly to delite widgets, a wrapper is provided for `dstores/*`. 
This wrapper comes as a function that returns a specification for a factory.
You can use it:

```js
define([
	"angular",
	"angular-delite/wrappers/store.js",
	"dstore/Memory"
	], function (angular, wrapper, Memory) {
		angular.module("myApp", [])
			.factory("Memory", function(){
				return wrapper(Memory);
			})
			.controller("MainCtrl", function($scope, Memory){
				var store = new Memory();
				...
			});
	});
```

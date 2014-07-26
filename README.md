<!-- TODO: mention something on on-click type of attributes -->

# angular-delite

This repository contains a few wrappers that allow you to use some 
of deliteful/dstore features into a regular angular application.

## The widget wrapper `wrappers/widget.js`

### Using a deliteful widget in an angular context

Any regular deliteful widget can be wrapped into an angular module and used as
a directive. 

1. Create a new directive in your app and give it a name (eg: `ngProgressBar`).
The wrapper specifies your directive so that you end up with a custom element `<ng-progress-bar></ng-progress-bar>`
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

2. Use your directive simply by invoking it in your app.

	```html
<ng-progress-bar value="30"></ng-progress-bar>
	```


<a id="init"></a>
### Initialize the widget

While attributes can perfectly initialize your widget, you may want do this when your widget instance is created, 
for some specific widgets that require it.
In that case, the wrapper lets you pass a hash that specifies an initial value for each or some of the properties.

```js
angular.module("myApp", [])
	.directive("ngProgressBar", function(){
		return wrapper(ProgressBar, {}, {value: 70, max: 100});
	});
```

You can also pass in instead a function with the only condition that it returns an instance of the widget.

```js
angular.module("myApp", [])
	.directive("ngProgressBar", function(){
		return wrapper(ProgressBar, {}, function(Constructor){
			var instance = new Constructor();
			instance.value = 42;
			return instance; // must return a widget instance created with Constructor
		});
	});
```


### Interacting with the widget

#### More about what the wrapper does

The directive created by the wrapper gets an isolated scope. By default, this scope accepts any attribute whose name
matches the name of a widget property and sets up a one-way biding.

For example, in the case of `deliteful/ProgressBar`, the isolated scope by default will look like:
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

With such a scope, you can guess that our widget will accept attributes such as:
`value="7"` or `display-ext-msg="true"`. -- NB: _notice how the attribute name is a slugified 
version of the property name, but this shouldn't be news to people familiar with angular_.

##### The special case of event attributes

You can use on the directive attributes such as `on-click`, `on-change`, ... which map directly
to `myWidget.onClick` and `myWidget.onChange`, ...

You can write things like:

```html
<ng-progress-bar on-click="console.log('value is', this.value)" value="30"></ng-progress-bar>
```

Also for practical reasons, `this` points to the widget instance, not the directive.

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
	value          : "=", // now set to two ways binding
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
	<ng-progress-bar value="v"></ng-progress-bar>
	<!-- variable `$scope.v` is mapped to the property "value" of the widget -->
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

## The store wrapper `wrappers/store.js`

### Using Rest and Memory

`angular-delite/dstore/Rest` contains an angular module `"dstore.rest"` with a 
factory `Rest` that holds the store constructor and can be called in any controller.

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

Note that the original `dstore/Rest.js` store has a number of methods that return [dojo promises](http://dojotoolkit.org/reference-guide/1.8/dojo/promise.html).
The `dstore.rest` module converts them to regular angular promises. Cf. [$q service API](https://docs.angularjs.org/api/ng/service/$q) documentation for more details on how to use them.

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

It is advised to wrap your store instance in an angular factory or service, to make it behaves like 
a singleton and properly interact with it from multiple controllers.

```js
define([
	"angular",
	"angular-delite/dstore/Memory"
	], function (angular) {
		angular.module("myApp", ["dstore.memory"])
			.factory("mystore", function(Memory){
				return new Memory({data: [...]});
			})
			.controller("OneCtrl", function($scope, mystore){
				mystore.get(6);
				...
			});
			.controller("AnotherCtrl", function($scope, mystore){
				mystore.get(3);
				...
			});
	});
```

### The wrapper
Similarly to delite widgets, a wrapper is provided for `dstores/*`. 
This wrapper comes as a function that returns a specification for a factory.
Use it like this:

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

In case some of the functions of the store return promises, make sure to pass in
`$q` as well so that they get wrapped in a regular angular promise.  cf. `dstore/Rest.js` for a more detailed example.

```js
		...
		angular.module("myApp", [])
			.factory("Rest", function($q){
				return wrapper(Rest, $q);
			})
		...
```


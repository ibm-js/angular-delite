# angular-delite

This repository contains a few wrappers that allow you to use some 
of deliteful/dstore features into a regular angular application.

## Usage

### Using a deliteful widget in an angular context

Any regular deliteful widget can be wrapped into an angular module and used as
a directive. 

1. create a file named `ngMyWidget.js` containing
```js
define([
	"angular-delite/ngWidget",
	"deliteful/MyWidget"
	], function (ngWidget, myWidget) {
		var ngMyWidget = ngWidget("myWidget", myWidget);
	});
```
this creates a angular module named `ngMyWidget`.
2. Invoke the module inside your app as a dependency.
```js
define([ "ngMyWidget" ], function (ngMyWidget) {
		angular.module("app", ["ngMyWidget"]);
	});
```
3. Use the directive
```html
<ng-my-widget name="Bob"></ng-my-widget>
```
```js
function myParentCtrl($scope){
	$scope.myWidget.name = "Alice";
}
```

### Interacting with the widget

#### Passing parent scope variables to the widget through attributes
The deliteful is wrapped into a regular directive with an isolated scope. 
By default, the latter references all the widget propreties and is set up for a one-way "string" data binding
`{prop1: "@", prop2: "@", prop3: "@", ...}` but it can be overwritten by passing a third 
parameter to the wrapper. For instance:
```js
var ngMyWidget = ngWidget("myWidget", myWidget, {prop2: "="});
// will produce scope {prop1: "@", prop2: "=", prop3: "@", ...}
```

This allows to expose some of the widget properties to the parent scope by overwriting 
the directive's default isolated scope.

```js
define([
	"angular-delite/ngWidget",
	"deliteful/MyWidget"
	], function (ngWidget, myWidget) {
		var ngMyWidget = ngWidget("myWidget", myWidget, {name: "="});
	});
```
```html
<div ng-controller="myParentCtrl">
	<input type="text" ng-model="name" />
	<!-- variable `$scope.name` is mapped to the property "name" of the widget -->
	<ng-my-widget name="name" id="myWidget"></ng-my-widget>
</div>
```

#### Accessing the widget from parent scope
The deliteful widget can be accessed in the parent scope when an `id` attribute is added in the directive.
```html
<div ng-controller="myParentCtrl">
	<ng-my-widget name="Bob" id="myWidget"></ng-my-widget>
</div>
```
```js
function myParentCtrl($scope){
	$scope.myWidget.name = "Alice";
}
```
You can also use `data-id` or `x-id` instead, as `id` must be unique to an entire page, 
wherease our variable is unique to the parent scope only.

### Store

Any store instance can be wrapped a regular angular module with `ngStore`

```js
define([
	"angular-delite/ngStore",
	"dstore/myStore"
	], function(ngWidget, myStore){
		ngStore("myStore", myStore);
	})
```

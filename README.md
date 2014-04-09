# angular-delite

## Usage

### Widget

Any regular deliteful widget can be wrapped into an angular module and used as
a directive. 

1. create a file named `ngMyWidget.js` containing
```js
define([
	"angular-delite/ngWidget",
	"deliteful/myWidget",
	], function (ngWidget, myWidget) {
		ngWidget("myWidget", myWidget, ["name", ...]);
	})
```
this creates a angular module named `ngMyWidget`.
2. Invoke the module inside your app as a dependency.
```js
define([ "ngMyWidget" ], function (ngMyWidget) {
		angular.module("app", ["ngMyWidget"]);
	})
```
3. Use the directive
```js
<ng-my-widget name="Bob"></ng-my-widget>
```


### Store

Any store instance can be wrapped a regular angular module with `ngStore`

```js
define([
	"angular-delite/ngStore",
	"dstore/myStore",
	], function(ngWidget, myStore){
		ngStore("myStore", myStore);
	})
```

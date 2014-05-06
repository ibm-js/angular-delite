define([
	"angular-delite/ngWidget",
	"deliteful/list/List",
	], function (ngWidget, List) {
		_list = ngWidget("List", List, {}, function(Constructor){
			return new Constructor({});
		});
		
    });

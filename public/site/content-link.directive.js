app.directive('contentLink', function () {
	return {
		restrict: 'E',
		templateUrl: 'site/content-link.template.html',
		scope: {
			text: '@',
			narrowText: '@',
			type: '@',
			contentId: '@'
		},
		link: function(scope, element, attrs){
			// Revisit menuState as service.
			scope.text = attrs.text || '';
			scope.narrowText = attrs.narrowText || null;
			scope.type = attrs.type || '';
			scope.contentId = attrs.contentId || null;
			// scope.menuState = menuState;
		},
	};
});

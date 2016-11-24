app.directive('notificationIconList', function (user) {
	return {
		restrict: 'E',
		templateUrl: 'notifications/notification-icon-list.template.html',
		link: function(scope, element, attrs){
			scope.user = user;
		},
	};
});


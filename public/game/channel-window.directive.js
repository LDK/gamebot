app.directive('channelWindow', function (user, gameState) {
	return {
		restrict: 'E',
		templateUrl: 'game/channel-window.template.html',
		link: function(scope, element, attrs){
			scope.gameState = gameState;
			scope.user = user;
		},
	};
});

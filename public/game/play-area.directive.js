app.directive('playArea', function (user, gameState) {
	return {
		restrict: 'E',
		templateUrl: 'game/play-area.template.html',
		link: function(scope, element, attrs){
			scope.gameState = gameState;
			scope.user = user;
		},
	};
});


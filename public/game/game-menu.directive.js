app.directive('gameMenu', function (user, gameState, $http) {
	return {
		restrict: 'E',
		templateUrl: 'game/game-menu.template.html',
		link: function(scope, element, attrs){
			scope.gameState = gameState;
			scope.user = user;
		},
	};
});


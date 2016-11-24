app.directive('playerList', function (user, gameState) {
	return {
		restrict: 'E',
		templateUrl: 'game/player-list.template.html',
		link: function(scope, element, attrs){
			scope.gameState = gameState;
			scope.user = user;
		},
	};
});


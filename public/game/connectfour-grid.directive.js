app.directive('connectfourGrid', function (user, gameState, bot) {
	return {
		restrict: 'E',
		templateUrl: 'game/connectfour-grid.template.html',
		link: function(scope, element, attrs){
			scope.gameState = gameState;
			scope.grid = gameState.grid
			scope.user = user;
			scope.bot = bot;
		},
	};
});

app.directive('strategoGrid', function (user, gameState, bot) {
	return {
		restrict: 'E',
		templateUrl: 'game/stratego-grid.template.html',
		link: function(scope, element, attrs){
			scope.gameState = gameState;
			scope.grid = gameState.grid
			scope.user = user;
			scope.bot = bot;
		},
	};
});

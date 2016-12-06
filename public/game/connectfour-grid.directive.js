app.directive('connectfourGrid', function (user, gameState) {
	return {
		restrict: 'E',
		templateUrl: 'game/connectfour-grid.template.html',
		link: function(scope, element, attrs){
			scope.gameState = gameState;
			scope.grid = gameState.grid
			scope.user = user;
			console.log('grid',scope.grid);
		},
	};
});

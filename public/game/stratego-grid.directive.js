app.directive('strategoGrid', function (user, gameState, bot) {
	return {
		restrict: 'E',
		templateUrl: 'game/stratego-grid.template.html',
		link: function(scope, element, attrs){
			scope.gameState = gameState;
			scope.grid = gameState.data.grid;
			scope.user = user;
			scope.derp = function() { console.log('derp'); };
			scope.bot = bot;
		},
	};
});

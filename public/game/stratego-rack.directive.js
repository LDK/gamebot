app.directive('strategoRack', function (user, gameState, bot) {
	return {
		restrict: 'E',
		templateUrl: 'game/stratego-rack.template.html',
		link: function(scope, element, attrs){
			scope.gameState = gameState;
			scope.user = user;
			scope.bot = bot;
		},
	};
});

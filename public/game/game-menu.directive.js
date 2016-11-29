// TODO: Make button options update on channel change... May have to do with blanking gameState in non-game-started rooms.
app.directive('gameMenu', function (user, gameState) {
	var gameMenuUrl = user.game ? 'game/'+user.game+'/game-menu.template.html' : false;
	return {
		restrict: 'E',
		gameMenuUrl: gameMenuUrl,
		template: '<div ng-include="gameMenuUrl"></div>',
		link: function(scope, element, attrs){
            attrs.$observe("game",function(v){
                gameMenuUrl = attrs.game.length ? 'game/'+attrs.game+'/game-menu.template.html' : gameMenuUrl;
				scope.game = attrs.game;
				scope.gameMenuUrl = gameMenuUrl;
            });
			scope.gameState = gameState;
			scope.user = user;
		},
	};
});


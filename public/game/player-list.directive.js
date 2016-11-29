app.directive('playerList', function (user, gameState) {
	var playerListUrl = user.game ? 'game/'+user.game+'/player-list.template.html' : false;
	return {
		restrict: 'E',
		playerListUrl: playerListUrl,
		template: '<div ng-include="playerListUrl"></div>',
		link: function(scope, element, attrs){
            attrs.$observe("game",function(v){
                playerListUrl = attrs.game.length ? 'game/'+attrs.game+'/player-list.template.html' : playerListUrl;
				scope.game = attrs.game;
				scope.playerListUrl = playerListUrl;
            });
			scope.gameState = gameState;
			scope.user = user;
		},
	};
});


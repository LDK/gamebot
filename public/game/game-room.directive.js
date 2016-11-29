app.directive('gameRoom', function (user, gameState) {
	var gameRoomUrl = user.game ? 'game/'+user.game+'/game-room.template.html' : false;
	return {
		restrict: 'E',
		gameRoomUrl: gameRoomUrl,
		template: '<div ng-include="gameRoomUrl"></div>',
		link: function(scope, element, attrs){
            attrs.$observe("game",function(v){
                gameRoomUrl = attrs.game.length ? 'game/'+attrs.game+'/game-room.template.html' : gameRoomUrl;
				scope.game = attrs.game;
				scope.gameRoomUrl = gameRoomUrl;
            });
			scope.gameState = gameState;
			scope.user = user;
		},
	};
});


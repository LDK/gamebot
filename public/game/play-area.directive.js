app.directive('playArea', function (user, gameState) {
	var playAreaUrl = user.game ? 'game/'+user.game+'/play-area.template.html' : false;
	return {
		restrict: 'E',
		playAreaUrl: playAreaUrl,
		template: '<div ng-include="playAreaUrl"></div>',
		link: function(scope, element, attrs){
            attrs.$observe("game",function(v){
                playAreaUrl = attrs.game.length ? 'game/'+attrs.game+'/play-area.template.html' : playAreaUrl;
				scope.game = attrs.game;
				scope.playAreaUrl = playAreaUrl;
            });
			scope.gameState = gameState;
			scope.user = user;
		},
	};
});

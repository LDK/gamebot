app.directive('npwWrestlerColumn', function (user, gameState, bot) {
	return {
		restrict: 'E',
		scope: {
			side: '@',
			player: '@'
		},
		templateUrl: 'game/npw-wrestler-column.template.html',
		link: function(scope, element, attrs){
			var player = gameState.data.players[attrs.player] || false;
			
			if (!bot.wrestlers) {
				bot.wrestlers = gameState.data.wrestlers;
			}
			if (gameState.data.player_wrestlers) {
				scope.user_wrestler = gameState.data.player_wrestlers[user.logged_in.username || -1] || null;
			}
			else {
				scope.user_wrestler = null;
			}
			scope.pickWrestler = function() {
				bot.command('npw','use',[scope.user_wrestler]);
				scope.wrestler = bot.wrestlers[scope.user_wrestler];
			}
			scope.pickMove = function(index) {
				if (!user.logged_in || gameState.move_picks[user.logged_in.username]) {
					return; // Once you make your pick, it's locked in until the next round, when this value clears.
				}
				bot.command('npw','pick',[index]);
			}
			scope.gameState = gameState;
			scope.user = user;
			scope.bot = bot;
		},
	};
});

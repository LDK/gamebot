app.directive('wrestlerColumn', function (user, gameState, bot) {
	return {
		restrict: 'E',
		scope: {
			side: '@',
			player: '@'
		},
		templateUrl: 'game/wrestler-column.template.html',
		link: function(scope, element, attrs){
			var player = gameState.players[attrs.player] || false;
			
			if (!bot.wrestlers) {
				bot.wrestlers = gameState.wrestlers;
			}
			if (gameState.player_wrestlers) {
				scope.user_wrestler = gameState.player_wrestlers[user.logged_in.username || -1] || null;
			}
			else {
				scope.user_wrestler = null;
			}
			if (gameState.move_picks) {
				scope.selected_move_index == gameState.move_picks[user.logged_in.username || -1] || null;
			}
			else {
				scope.move_picks = null;
			}
			scope.pickWrestler = function() {
				bot.command('wrestling','use',[scope.user_wrestler]);
				scope.wrestler = bot.wrestlers[scope.user_wrestler];
			}
			scope.pickMove = function(index) {
				if (!user.logged_in || gameState.move_picks[user.logged_in.username]) {
					return; // Once you make your pick, it's locked in until the next round, when this value clears.
				}
				bot.command('wrestling','pick',[index]);
				bot.selected_move_index = gameState.move_picks[user.logged_in.username];
			}
			scope.gameState = gameState;
			scope.user = user;
			scope.bot = bot;
		},
	};
});

app.directive('hand', function (user, gameState, bot) {
	return {
		restrict: 'E',
		templateUrl: 'game/hand.template.html',
		link: function(scope, element, attrs){
			scope.gameState = gameState;
			scope.user = user;
			var cards = user.cards;
			var playable = 0;
			for (var i in cards) {
				if (user.logged_in && gameState.data.turn_user == user.logged_in.username) {
					if (gameState.data.current_color == cards[i].color) {
						cards[i].playable = true;
						playable++;
					}
					if (gameState.data.current_label == cards[i].label) {
						cards[i].playable = true;
						playable++;
					}
				}
			}
			if (user.logged_in && playable == 0) {
				for (var i in cards) {
					if (cards[i].wild) {
						cards[i].playable = true;
						playable++;
					}
				}
			}
			if (cards) {
				cards.playable_count = playable;
				scope.cards = user.cards = cards;
			}
		},
	};
});

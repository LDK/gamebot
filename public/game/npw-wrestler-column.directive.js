app.directive('npwWrestlerColumn', function (user, gameState, bot, stage) {
	return {
		restrict: 'E',
		scope: {
			side: '@',
			player: '@',
			role: '@',
			wrestler: '@',
			img: '@'
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
			scope.menuOpen = false;
			scope.menuPage = 'strategy';
			scope.playerMenu = function(role, section) {
				var role = 'player';
				switch(section) {
					case 'strategy':
						jQuery('#brethart').animateSprite('play','walkSE',{ loop: true });
					break;
					case 'health':
						jQuery('#brethart').animateSprite('play','fallE',{ loop: false });
					break;
					case 'action':
						jQuery('#brethart').animateSprite('play','rollEUpSE',{ loop: false });
					break;
				}
				var playerOffset = jQuery('div.'+role).offset().top;
				var menuHeight = jQuery('div.wrestler-submenu').height();
				if (scope.menuOpen && scope.menuPage == section) {
					jQuery('div.wrestler-submenu')
					.animate({ top: playerOffset },300,function(){ 
						jQuery(this).hide(); 
						scope.menuOpen = false; 
					});
				}
				else if (!scope.menuOpen) {
					jQuery('div.wrestler-submenu')
					.width(jQuery('div.player').width())
					.css('top', playerOffset)
					.css('display','block')
					.show()
					.animate({ top: playerOffset - menuHeight },300,function(){ 
						scope.menuOpen = true;
					});
				}
				gameState.menuPage = scope.menuPage = section;
			}
			scope.gameState = gameState;
			scope.user = user;
			scope.bot = bot;
		},
	};
});

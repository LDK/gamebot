app.directive('npwWrestlerColumn', function (user, gameState, bot, stage) {
	return {
		restrict: 'E',
		scope: {
			side: '@',
			player: '@',
			role: '@',
			wrestler: '@',
			actorId: '@',
			slot: '@',
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
			scope.tagOut = function(id) {
				var play_params = {};
				play_params[id] = { type: 'tag' };
				var wrestler = $('npw-actor[actorid="'+id+'"]');
				var zone = wrestler.attr('zone');
				var team = wrestler.attr('team');
				var teammate = $('npw-actor[team="'+team+'"]:not([actorid="'+id+'"])');
				var teammate_id = teammate.attr('actorid');
				var teammate_zone = teammate.attr('zone');
				switch (teammate_zone) {
					case 'apron-east':
						$('div.actor#'+id).animateSprite('play','tagOutE');
						$('div.actor#'+teammate_id).animateSprite('play','tagInW');
						// TODO: Replace these setTimeouts with a callback from the animation layer
						setTimeout( function(){ bot.command('npw','play', play_params); }, 1000 );
					break;
					case 'apron-west':
						$('div.actor#'+id).animateSprite('play','tagOutW');
						$('div.actor#'+teammate_id).animateSprite('play','tagInE');
						setTimeout( function(){ bot.command('npw','play', play_params); }, 1000 );
					break;
				}
			}
			scope.playerMenu = function(id, role, section) {
				var selector = '#'+id;
				switch(section) {
					case 'strategy':
						jQuery(selector).animateSprite('play','exitRingApronWSE');
					break;
					case 'health':
						jQuery(selector).animateSprite('play','enterRingApronWSE');
					break;
					case 'action':
						jQuery(selector).animateSprite('play','fallE');
					break;
				}
				// var playerOffset = jQuery('div.'+role).offset().top;
				// var menuHeight = jQuery('div.wrestler-submenu').height();
				// if (scope.menuOpen && scope.menuPage == section) {
				// 	jQuery('div.wrestler-submenu')
				// 	.animate({ top: playerOffset },300,function(){
				// 		jQuery(this).hide();
				// 		scope.menuOpen = false;
				// 	});
				// }
				// else if (!scope.menuOpen) {
				// 	jQuery('div.wrestler-submenu')
				// 	.width(jQuery('div.player').width())
				// 	.css('top', playerOffset)
				// 	.css('display','block')
				// 	.show()
				// 	.animate({ top: playerOffset - menuHeight },300,function(){
				// 		scope.menuOpen = true;
				// 	});
				// }
				// gameState.menuPage = scope.menuPage = section;
			}
			scope.gameState = gameState;
			scope.user = user;
			scope.bot = bot;
			scope.actorId = attrs.actorid;
		},
	};
});

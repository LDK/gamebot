app.directive('npwArena', function (user, gameState, bot, stage, $http) {
	return {
		restrict: 'E',
		scope: {
			arenaId: '@',
			width: '@',
			height: '@',
			stageDisplay: '@'
		},
		templateUrl: 'game/npw-arena.template.html',
		link: function(scope, element, attrs){
			console.log('attrs',attrs);
			console.log('scope',scope);
			scope.stageDisplay = attrs.stagedisplay;
			scope.arenaId = attrs.arenaid;
			scope.drawArena = function() {
				scope.ringDrawn = false;
				var checkElements = setInterval(function(){
					jQuery('div.stage-element:not(.sub-element)').each(function(key,obj){
						clearInterval(checkElements);
						var etop = parseInt(jQuery(this).attr('data-top'));
						var eleft = parseInt(jQuery(this).attr('data-left'));
						jQuery(this).appendTo('#stage');
						jQuery(this).css('top',etop);
						jQuery(this).css('left',eleft);
					});
					jQuery('div.barricades').each(function(key,obj){
						if (parseInt(jQuery(obj).attr('data-top')) > 440) { 
							jQuery(this).addClass('front');
						}
					});
				},300);
			}
			scope.getArena = function(arena_id) {
				$http.get('http://npw.electric-bungalow.com/' + 'arena/' + arena_id + '/json').then(function(response){
					scope.arena = { id: arena_id };
					scope.arena.info = response.data.arena;
					scope.arena.elements = response.data.arena_elements;
					for (var key in scope.arena.elements) {
						scope.arena.elements[key].options = JSON.parse(scope.arena.elements[key].options);
					}
					scope.arena.options = response.data.arena_options;
					scope.drawArena();
				});
			};
			scope.gameState = gameState;
			scope.user = user;
			scope.bot = bot;
			scope.getArena(attrs.arenaid);
			jQuery('document').ready(scope.drawArena());
		},
	};
});

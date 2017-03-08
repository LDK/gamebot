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
			scope.getArena = function(arena_id) {
				$http.get('http://npw.electric-bungalow.com/' + 'arena/' + arena_id + '/json').then(function(response){
					scope.arena = { id: arena_id };
					scope.arena.info = response.data.arena;
					scope.arena.elements = response.data.arena_elements;
					scope.arena.options = response.data.arena_options;
				});
			};
			scope.gameState = gameState;
			scope.user = user;
			scope.bot = bot;
			scope.getArena(attrs.arenaid);
		},
	};
});

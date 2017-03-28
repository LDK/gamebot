app.directive('npwActor', function (user, gameState, bot, stage, $http) {
	return {
		restrict: 'E',
		scope: {
			position: '@',
			facing: '@',
			location: '@',
			zone: '@',
			actorId: '@'
		},
		templateUrl: 'game/npw-actor.template.html',
		link: function(scope, element, attrs){
			scope.gameState = gameState;
			scope.user = user;
			scope.bot = bot;
			scope.actorId = attrs.actorid;
			if (!stage.actors) {
				stage.actors = {};
			}
			stage.actors[attrs.actorid] = {
				position: scope.position,
				facing: scope.facing,
				location: scope.location,
				zone: scope.zone
			};
		},
	};
});

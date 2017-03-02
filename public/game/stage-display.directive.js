app.directive('stageDisplay', function (user, gameState, bot, stage) {
	return {
		restrict: 'E',
		scope: {
			image: '@',
			width: '@',
			height: '@'
		},
		templateUrl: 'game/stage-display.template.html',
		link: function(scope, element, attrs){
			scope.gameState = gameState;
			scope.user = user;
			scope.bot = bot;
			scope.centerStage = function(){
				var stageWidth = jQuery('#stage').width();
				var displayWidth = jQuery('stage-display').width();
				var leftOffset = Math.abs(stageWidth - displayWidth) / -2;
				var stageHeight = jQuery('#stage').height();
				var displayHeight = jQuery('stage-display').height();
				var topOffset = Math.abs(stageHeight - displayHeight) / -2;
				jQuery('#stage').animate({ left: leftOffset, top: topOffset }, 500, 'swing', function() { });
			};

			console.log('scope',scope);
		},
	};
});

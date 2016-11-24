'use strict';

// Register `gameRoom` component, along with its associated controller and template
angular.
	module('gameRoom').
	component('gameRoom', {
		templateUrl: 'game/game-room.template.html',
		controller: ['$http', '$routeParams', 'gameState', 'user', 
		function gameRoomController($http, $routeParams, gameState, user) {
			var self = this;
			var api_server = '';
			self.channels = [];
			self.active_channel = gameState.channel || null;
			self.gameState = gameState;
		}]
	});

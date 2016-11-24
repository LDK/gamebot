'use strict';

// Register `channelSelector` component, along with its associated controller and template
angular.
	module('channelSelector').
	component('channelSelector', {
		templateUrl: 'game/channel-selector.template.html',
		controller: ['$http', '$routeParams', 'gameState', 'user', 
		function channelSelectorController($http, $routeParams, gameState, user) {
			var self = this;
			var api_server = '';
			self.channels = [];
			self.active_channel = gameState.channel || null;
			self.gameState = gameState;
			var dataUrl = api_server + '/channels';
			$http.get(dataUrl).then(function(response) {
				self.channels = response.data;
			});
			self.update = function() {
				// Start with the defaults
				user.cards = [];
				self.gameState.players = [];
				self.gameState.setGameData({ channel: self.active_channel });
				self.gameState.started = false;
				self.gameState.wild_active = false;
				self.gameState.wild_skip = false;
				self.gameState.current_color = null;
				self.gameState.current_label = '';
				// Then get the real deal
				self.gameState.pollMessages();
				$http.post(api_server + '/command/status', { source: { channel: self.active_channel }} ).then(function(response){
					self.gameState.setGameData( response.data.game_state );
				});
			}
		}]
	});

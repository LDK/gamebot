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
			self.channels = {};
			self.gameState = gameState;
			self.user = user;
			var dataUrl = api_server + '/channels';
			$http.get(dataUrl).then(function(response) {
				for (var i in response.data) {
					var channel = response.data[i];
					self.channels[channel.name] = channel;
				}
			});
			self.update = function() {
				var game = false;
				console.log('self.channels!',self.channels,user.channel,self.channels[user.channel]);
				if (self.channels && user.channel && self.channels[user.channel] && self.channels[user.channel].game) {
					user.game = self.channels[user.channel].game;
				}
				if (user.game) {
					console.log('user.game',user.game);
					// Start with the defaults
					self.gameState.players = [];
					self.gameState.setGameData({ channel: user.channel });
					self.gameState.started = false;
					// Then get the real deal
					self.gameState.pollMessages();
					$http.post(api_server + '/command/status', { game: user.game, source: { channel: user.channel } } ).then(function(response){
						self.gameState.setGameData( response.data.game_state );
					});
				}
				console.log('user channel',user.channel);
			}
		}]
	});

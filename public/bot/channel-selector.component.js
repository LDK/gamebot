'use strict';

// Register `channelSelector` component, along with its associated controller and template
angular.
	module('channelSelector').
	component('channelSelector', {
		templateUrl: 'bot/channel-selector.template.html',
		controller: ['$http', '$routeParams', 'gameState', 'user', 'bot',
		function channelSelectorController($http, $routeParams, gameState, user, bot) {
			var self = this;
			var api_server = '';
			self.channels = {};
			self.gameState = gameState;
			self.user = user;
			self.bot = bot;
			self.user.channel = 'C10';
			var dataUrl = api_server + '/channels';
			$http.get(dataUrl).then(function(response) {
				for (var i in response.data) {
					var channel = response.data[i];
					self.channels[channel.name] = channel;
				}
				self.update();
			});
			self.update = function() {
				if (self.channels && user.channel && self.channels[user.channel] && self.channels[user.channel].game) {
					user.game = self.channels[user.channel].game;
				}
				if (user.game) {
					self.bot.activeGame = user.game;
					// Start with the defaults
					self.gameState.data.players = [];
					self.gameState.setGameData({ channel: user.channel });
					self.gameState.data.started = false;
					self.gameState.data.active = false;
					// Then get the real deal
					self.bot.pollMessages();
					$http.post(api_server + '/command/status', { game: user.game, source: { channel: user.channel } } ).then(function(response){
 					self.gameState.setGameData(response.data.game_state,true);
					});
				}
			}
			self.update();
		}]
	});

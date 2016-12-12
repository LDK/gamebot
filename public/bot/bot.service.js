app.factory('bot', function(user, gameState, $http, $timeout){
	var bot = {};
	var api_server = '';
	bot.command = function(game, cmd, params) {
		var source = { user: user.logged_in ? user.logged_in.username : null, channel: gameState.channel || null };
		// $http returns a promise, which has a then function, which also returns a promise
		var cmd_url =  api_server + '/command/'+cmd;
		var post_data = { source: source, game: game };
		if (params) {
			post_data.params = params;
		}
		var promise = $http.post(cmd_url, post_data).then(function (response) {
			// The then function here is an opportunity to modify the response
			if (response.data && response.data.game_state) {
				gameState.setGameData(response.data.game_state);
			}
			if (response.data && response.data.messages) {
				$http.post(api_server + '/messages', { messages: response.data.messages } ).then(function(response){
					bot.pollMessages();
				});
				gameState.setGameData(response.data.game_state);
				if (gameState.poll && gameState.poll.indexOf('cards') != -1) {
					bot.pollCards();
				}
			}
			return response.data;
		});
		// Return the promise to the controller
		return promise;
	};	
	bot.pollMessages = function() {
		var list = null;
		if (gameState.channel) {
			$http.get(api_server + '/messages/'+gameState.channel).then(function(response){
				var messages = response.data;
				for (var i in messages) {
					var message = messages[i];
					if (message.text) {
						for (var j in gameState.players) {
							var player = gameState.players[j];
							function decodeChars(text) {
							  return text
								.replace(/&amp;/g, "&")
								.replace(/&lt;/g, "<")
								.replace(/&gt;/g, ">")
								.replace(/&quot;/g, '"')
								.replace(/&#039;/g, "'");
							}
							message.text = message.text.replace('<@'+player.username+'>', player.display);
							message.text = decodeChars(message.text);
						}
					}
				}
				gameState.setGameData({messages: messages});
				var el = document.getElementById("channel-messages");
				if (el) {
					el.scrollTop = el.scrollHeight;
				}
			});
		}
	};
	bot.pollCards = function() {
		var list = null;
		if (user && user.channel && user.logged_in && user.game) {
			$http.post(api_server + '/command/cards', { game: user.game, source: { channel: gameState.channel, user: user.logged_in.username } }).then(function(response){
				var cards = response.data.cards;
				var playable = 0;
				user.cards = cards;

				for (var i in cards) {
					if (user.logged_in && gameState.turn_user == user.logged_in.username) {
						if (gameState.current_color == cards[i].color) {
							cards[i].playable = parseInt(playable)+1;
							playable++;
						}
						else if (gameState.current_label == cards[i].label) {
							cards[i].playable = parseInt(playable)+1;
							playable++;
						}
					}
				}
				if (user.logged_in && gameState.turn_user == user.logged_in.username && !playable) {
					for (var i in cards) {
						if (cards[i].wild) {
							cards[i].playable = parseInt(playable)+1;
							playable++;
						}
					}
				}
				if (user.cards) {
					user.cards.playable_count = playable;
				}
			});
		}
	};
	bot.pollGameState = function() {
		var list = null;
		if (user.channel) {
			var game = user.game;
			$http.post(api_server + '/command/status', { game: user.game, source: { channel: user.channel }} ).then(function(response){
				gameState.setGameData( response.data.game_state );
				gameState.setTurnUser();
			});
			bot.pollMessages();
			if (gameState.poll && gameState.poll.indexOf('cards') != -1) {
				bot.pollCards();
			}
			if (gameState.wrestlers && !bot.wrestlers) {
				bot.wrestlers = gameState.wrestlers;
			}
		}
		$timeout(bot.pollGameState,4000);
	};
	return bot;
});

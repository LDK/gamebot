app.factory('gameState', function(user, $http, $timeout){
	var gameState = {};
	var api_server = '';
	// Takes an array of usernames;
	gameState.setGamePlayers = function(players) {
		var usernames = [];
		for (var i in players) {
			if (typeof players[i] == 'string') {
				usernames.push(players[i]);
			}
			else if (typeof players[i] == 'object' && players[i].username) {
				usernames.push(players[i].username);
			}
		}
		gameState.usernames = usernames;
		var promise = $http.post(api_server + '/users',{ usernames: usernames }).then(
			function (response) {
				var players = [];
				var users = {};
				for (var key in response.data) {
					var player = response.data[key];
					users[player.username] = { username: player.username, display: player.display, id: player.id };
				}
				for (var i in usernames) {
					users[usernames[i]].position = parseInt(i) + 1;
					players.push(users[usernames[i]]);
				}
				gameState.players = players;
				gameState.setTurnUser();
				return players;
			}
		);

		return promise;
	}
	gameState.setTurnUser = function() {
		if (gameState.turn || gameState.turn === 0) { 
			if (gameState.players[gameState.turn]) {
				gameState.turn_user = gameState.players[gameState.turn].username;
			}
		}
	};
	gameState.setGameData = function(data) {
		for (var key in data) {
			if (key == 'players') {
				gameState.setGamePlayers(data[key]);
			}
			else {
				gameState[key] = data[key]
			}
		}
		gameState.setTurnUser();
	};
	gameState.pollMessages = function() {
		var list = null;
		if (gameState.channel) {
			$http.get(api_server + '/messages/'+gameState.channel).then(function(response){
				var messages = response.data;
				for (var i in messages) {
					var message = messages[i];
					if (message.text) {
						for (var j in gameState.players) {
							var player = gameState.players[j];
							message.text = message.text.replace('<@'+player.username+'>', player.display);
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
	gameState.pollCards = function() {
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
	gameState.pollGameState = function() {
		var list = null;
		if (user.channel) {
			var game = user.game;
			$http.post(api_server + '/command/status', { game: user.game, source: { channel: user.channel }} ).then(function(response){
				gameState.setGameData( response.data.game_state );
				gameState.setTurnUser();
			});
			gameState.pollMessages();
			if (gameState.poll && gameState.poll.indexOf('cards') != -1) {
				gameState.pollCards();
			}
		}
		$timeout(gameState.pollGameState,4000);
	};
	return gameState;
});

app.factory('gameState', function(user, $http, $timeout){
	var gameState = {
		data: {}
	};
	var api_server = '';
	// Takes an array of usernames;
	gameState.setGamePlayers = function(players) {
		gameState.data.usernames = [];
		for (var i in players) {
			if (typeof players[i] == 'string') {
				gameState.data.usernames.push(players[i]);
			}
			else if (typeof players[i] == 'object' && players[i].username) {
				gameState.data.usernames.push(players[i].username);
			}
		}
		var promise = $http.post(api_server + '/users',{ usernames: gameState.data.usernames }).then(
			function (response) {
				var players = [];
				var users = {};
				for (var key in response.data) {
					var player = response.data[key];
					users[player.username] = { username: player.username, display: player.display, id: player.id };
				}
				for (var i in gameState.data.usernames) {
					users[gameState.data.usernames[i]].position = parseInt(i) + 1;
					players.push(users[gameState.data.usernames[i]]);
				}
				gameState.data.players = players;
				gameState.setTurnUser();
				return players;
			}
		);
		return promise;
	}
	gameState.setTurnUser = function() {
		if (gameState.data.turn || gameState.data.turn === 0) { 
			if (gameState.data.players[gameState.data.turn]) {
				gameState.data.turn_user = gameState.data.players[gameState.data.turn].username;
			}
		}
	};
	gameState.setGameData = function(data,reset) {
		if (!gameState.data) {
			gameState.data = {};
		}
		for (var key in data) {
			if (key == 'players') {
				gameState.setGamePlayers(data[key]);
			}
			else {
				gameState.data[key] = data[key];
			}
		}
		gameState.setTurnUser();
	};
	return gameState;
});

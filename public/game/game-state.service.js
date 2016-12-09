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
	return gameState;
});

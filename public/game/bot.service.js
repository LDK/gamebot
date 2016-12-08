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
					gameState.pollMessages();
				});
				gameState.setGameData(response.data.game_state);
				if (gameState.poll && gameState.poll.indexOf('cards') != -1) {
					gameState.pollCards();
				}
			}
			return response.data;
		});
		// Return the promise to the controller
		return promise;
	};	
	return bot;
});

var exports = exports || {};
var connectfour = exports;

// Choose who plays first.
// Each player in his turn drops one of his checkers down any of the slots in the top of the grid.
// The play alternates until one of the players gets four checkers of his colour in a row. The four in a row can be horizontal, vertical, or diagonal.(See examples).
// The first player to get four in a row wins.
// If the board is filled with pieces and neither player has 4 in a row, then the game is a draw.

connectfour.games = {};
connectfour.game_counter = 0;
connectfour.debug = true;

connectfour.settings = {
	columns: 7,
	rows: 6
};

var inArray = function(a,b) {
	return b.indexOf(a)!==-1
};

/**
 * Returns a random integer between min (inclusive) and max (inclusive)
 * Using Math.round() will give you a non-uniform distribution!
 */
function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

connectfour.initGrid = function() {
	var square = (
		function(col,row,owner){ 
			if (isNaN(col) || isNaN(row)) { 
				return null;
			}
			return { 
				col: col,
				row: row,
				owner: owner || false
			};
		}
	);
	var grid = {};
	var cols = connectfour.settings.columns;
	var rows = connectfour.settings.rows;
	
	for (var col = 0; col < cols; col++) {
		grid[col] = { pieces: 0 };
		for (var row = rows - 1; row >= 0; row--) {
			grid[col][row] = new square(col, row);
		}
	}
	return grid;
}

connectfour.playerInGame = function(user, game) {
	for (i = 0; i < game.players.length; i++) {
		if (user == game.players[i]) {
			return true;
		}
	}
	return false;
}

connectfour.gameStart = function(channel, creator) {
	if (connectfour.games[channel] && connectfour.games[channel].active) {
		return { channel: creator, text: 'There is already a game in <#' + channel + '>.' };
	}
	connectfour.game_counter++;
	connectfour.games[channel] = {
		id: connectfour.game_counter,
		channel: channel,
		creator: creator,
		created: (Date.now() / 1000 | 0),
		started: false,
		turn: null,
		winner: null,
		grid: connectfour.initGrid(),
		players: [creator],
		colors: {},
		player_count: 1,
		game: 'connectfour',
		poll: ['status'],
		active: true
	};
	connectfour.games[channel].colors[creator] = 'colorRed';
	return { channel: channel, text: "Game started by <@" + creator + ">" };
}

// Returns array
connectfour.playerLeave = function(channel, player) {
	var game = connectfour.games[channel];
	var responses = [];
	if (!game || !game.active) {
		responses.push({ channel: player, text: 'No active game in <#' + channel + '>.' });
	}
	for (var i=0; i < game.players.length; i++) {
 		if (game.players[i] == player) {
			game.players.splice(i, 1);
			responses.push({ channel: channel, text: '<@' + player + '> has left the game.' });
		}
	}
	// Check for last-player-standing scenario.
	if (game.started && game.players.length < 2) {
		responses.push({ channel: channel, text: connectfour.gameDeclareWinner(game,game.players[0]) });
	}
	// Check for NO player-standing scenario.
	if (!game.players.length) {
		game.active = false;
		responses.push({ channel: channel, text: 'All players have left game.  Game cancelled.' });
	}
	game.player_count = game.players.length;
	return responses;
}

// Returns array
connectfour.playerJoin = function(channel, player) {
	var game = connectfour.games[channel];
	var responses = [];
	if (!game || !game.active) {
		responses.push({ channel: player, text: 'No active game in <#' + channel + '>.' });
		return responses;
	}
	if (game.started) {
		responses.push({ channel: player, text: 'Game has already begun play.' });
		return responses;
	}
	for (var i=0; i < game.players.length; i++) {
		if (game.players[i] == player) {
			// Player is already in game.  Let's not bother with a message.
			return responses;
		}
	}
	if (game.players.length > 1) {
		// More-than-2-player Connect Four is something I don't want to think about.
		responses.push({ channel: player, text: 'Game is full.' });
		return responses;
	}
	game.colors[player] = 'colorBlack';
	game.players.push(player);
	responses.push({ channel: game.channel, text: '<@' + player + '> has joined the game.' });
	game.player_count = game.players.length;
	return responses;
};
connectfour.endGame = function(game,message) {
	if (game.channel) {
		connectfour.games[game.channel].active = false;
		connectfour.games[game.channel].started = false;
		return message;
	}
};
connectfour.gameDeclareWinner = function(game, player) {
	connectfour.games[game.channel].winner = player;
	return connectfour.endGame(game, "<@" + player + "> IS THE WINNER!");
};
connectfour.gameDeclareDraw = function(game, player) {
	connectfour.games[game.channel].winner = null;
	return connectfour.endGame(game, "All columns are full.  The game is a draw.");
};
connectfour.gameDroppableColumns = function(game) {
	var droppable = [];
	for (var i in game.grid) {
		var col = game.grid[i];
		if (col && game.grid[i].pieces < connectfour.settings.rows) {
			droppable.push(i);
		}
	}
	return droppable;
};
connectfour.gameAdvanceTurn = function(game) { 
	if (game.turn >= game.players.length - 1) {
		game.turn = 0;
	}
	else {
		game.turn++;
	}
};
// Returns array
connectfour.nextTurn = function(game,skip,draw) {
	if (!game) {
		return [];
	}
	var responses = [];
	connectfour.gameAdvanceTurn(game);
	var player = game.players[game.turn];
	responses.push({ channel: player, text: "Your turn."});
	return responses;
};
connectfour.begin = function(channel) {
	var game = connectfour.games[channel];
	if (!game) {
		return 'No game in <#'+channel+'>';
	}
	if (game.started) {
		return 'Game has already begun play.';
	}
	var grid = game.grid;
	var responses = [];
	game.turn = getRandomInt(0,1);
	responses.push({ channel: channel, text: "<@" + game.players[game.turn] + "> has been selected to go first." });
	game.started = true;
	return responses;
};
connectfour.checkDiagonalStreak = function (game,col,row,hor,vert) {
	var streak = 1;
	var grid_square = game.grid[col][row];
	var owner = grid_square.owner;

	while (streak < 4) {
		switch (vert) {
			case 'up':
				row++;
			break;
			case 'down':
				row--;
			break;
		}
		switch (hor) {
			case 'right':
				col++;
			break;
			case 'left':
				col--;
			break;
		}
		grid_square = game.grid[col][row];
		if (owner && grid_square.owner && grid_square.owner == owner) {
			streak++;
			owner = grid_square.owner;
			if (streak > 3) {
				return owner;
			}
		}
		else {
			return false;
		}
	}

	return false;
};
connectfour.checkWin = function(game) {
	var streak = 1;
	var owner = false;
	var winner = false;
	// 1. check each column for a vertical win
	for (var col in game.grid) {
		if (winner) {
			break;
		}
		for (var row in game.grid[col]) {
			if (winner) {
				break;
			}
			var grid_square = game.grid[col][row];
			if (owner && grid_square.owner == owner) {
				streak++;
				if (streak > 3) {
					winner = owner;
				}
			}
			else {
				owner = grid_square.owner;
				streak = 1;
			}
		}
	}
	if (winner) {
		return winner;
	}
	streak = 1;
	owner = false;
	winner = false;
	// 2. check each row for a horizontal win
	for (var row = 0; row < connectfour.settings.rows; row++) {
		if (winner) {
			break;
		}
		for (var col in game.grid) {
			if (winner) {
				break;
			}
			var grid_square = game.grid[col][row];
			if (owner && grid_square.owner == owner) {
				streak++;
				if (streak > 3) {
					winner = owner;
				}
			}
			else {
				owner = grid_square.owner;
				streak = 1;
			}
		}
	}
	if (winner) {
		return winner;
	}
	// 3. for all columns that are at least 3 columns from the right edge:
	for (var col = connectfour.settings.columns - 4; col >= 0; col--) {
		// 	a. for all rows that are at least 3 rows from the bottom:
		for (var row = 3; row < connectfour.settings.rows; row++) {			
			// (i). check each square as starting point for right-down-diagonal win
			winner = connectfour.checkDiagonalStreak(game,col,row,'right','down');
		}
		// 	b. for all rows that are at least 3 rows from the top:
		for (var row = connectfour.settings.rows - 4; row >= 0; row--) {			
			// (i). check each square as starting point for right-up-diagonal-win
			winner = connectfour.checkDiagonalStreak(game,col,row,'right','up');
		}
	}
	if (winner) {
		return winner;
	}
	// 4. for all columns that are at least 3 columns from the left edge:
	for (var col = 3; col < connectfour.settings.columns; col++) {
		// a. for all rows that are at least 3 rows from the bottom:
		for (var row = 3; row < connectfour.settings.rows; row++) {			
			// (i). check each square as starting point for left-down-diagonal win
			winner = connectfour.checkDiagonalStreak(game,col,row,'left','down');
		}
		// b. for all rows that are at least 3 rows from the top:
		for (var row = connectfour.settings.rows - 4; row >= 0; row--) {			
			// (i). check each square as starting point for left-up-diagonal-win
			winner = connectfour.checkDiagonalStreak(game,col,row,'left','up');
		}
	}
	if (winner) {
		return winner;
	}
	return false;
};

connectfour.checkDraw = function(game) {
	return false;
};

// Returns array 
connectfour.dropPiece = function(game, player, col) {
	var grid = game.grid;
	var col_data = grid[col];
	var responses = [];
	if (!game || !player || !grid || !col_data || (!col && col !== 0)) {
		return responses;
	}
	if (col_data.pieces >= connectfour.settings.rows) {
		responses.push({ channel: player, text: "Column "+col+" is Full." });
		return responses;
	}
	var row = parseInt(col_data.pieces); // If there are 0 pieces in the column, it falls to row 0.
	
	if (isNaN(row)) {
		row = 0;
	}

	grid[col][row].owner = player;
	col_data.pieces++;
	
	responses.push({ channel: game.channel, text: "<@" + player + "> drops a piece in column " + col + "." });

	if (connectfour.checkWin(game)) {
		var winnerObj = { channel: game.channel };
		winnerObj.text = connectfour.gameDeclareWinner(game, player);
		responses.push(winnerObj);
	}
	else if (connectfour.checkDraw(game)) {
		var drawObj = { channel: game.channel };
		drawObj.text = connectfour.gameDeclareDraw(game, player);
		responses.push(drawObj);		
	}
	else {
		responses = responses.concat(connectfour.nextTurn(game));
	}
	return responses;
}

connectfour.getChannelId = function(channel, options) {
	if (!channel || !connectfour.channels) {
		return null;
	}
	channel = channel.replace('#','');
	if (channel.indexOf('|') > -1) {
		channel = channel.split('|');
		channel = channel[1].replace('>','');
	}
	var id;
	for (var i = 0; i < connectfour.channels.length; i++) {
		if (channel == connectfour.channels[i].name) {
			id = connectfour.channels[i].id;
		}
	}
	if (!id && options.channel) {
		return options.channel;
	}
	return id;
};

connectfour.getChannelName = function(channel, options) {
	if (!channel) {
		return null;
	}
	channel = channel.replace('#','');
	if (channel.indexOf('|') > -1) {
		channel = channel.split('|');
		channel = channel[1].replace('>','');
	}
	var channel_name;
	for (var i = 0; i < connectfour.channels.length; i++) {
		if (channel == connectfour.channels[i].id) {
			channel_name = connectfour.channels[i].name;
		}
	}
	if (!channel_name && options && options.channel) {
		return options.channel;
	}
	return channel_name;
};

/**
	THE COMMAND FUNCTION
	This is the function that serves as the bridge between the slack (or web) interface and the game module.
 */

connectfour.command = function(cmd, options, params) {
	var res = {}
	if (connectfour.commands[cmd]) {
		var channel = options.channel;
		res.messages = connectfour.commands[cmd](options, params);
		if (res.messages && res.messages.constructor != Array) {
			res.messages = [res.messages];
		}
		if (channel) {
			res.game_state = connectfour.games[channel];
		}
	}
	return res;
};

/**
	THE COMMANDS OBJECT
	Each property of this object is a function that takes an options 
 (likely a slack message)
	and a params array, and returns a text response or else a null value.
	The name of each command corresponds to a text command sent by a user in slack
 */

connectfour.commands = {};
connectfour.commands.begin = function(options, params) {
	var channel = params[0] ? connectfour.getChannelId(params[0], options) : options.channel;
	var game = connectfour.games[channel];
	if (!game) {
		return 'No game in this channel.';
	}
	var responses = [];
	// One response for the channel to report game beginning.
	responses = responses.concat(connectfour.begin(channel));
	return responses;
};
connectfour.commands.status = function(options, params) {
	options = options || {};
	var channel = params[0] ? connectfour.getChannelId(params[0], options) : options.channel || null;
	if (!channel || channel == options.user || channel[0] == 'D') {
		return [{ channel: options.user, text: 'Specify which channel, example: `connectfour status #connectfour`.' }];
	}
	var game = connectfour.games[channel];
	if (!game) {
		return ['No active game in <#' + channel + '>.', { channel: channel } ] ;
	}
	else {
		var player_count = game.players.length;
		var status_message = '';
		var player_list = 'None';
		var responses = [];
		if (player_count > 0) {
			player_list = '';
			for (var i = 0; i < player_count; i++) {
			    player_list += '<@' + game.players[i] + '>';
				if (i < player_count - 1) {
					player_list += ', ';
				} 
			}
		}
		responses.push({ channel: channel, text:  "Channel: <#" + channel + ">" });
		responses.push({ channel: channel, text:  "Players: " + player_list + "" });
		responses.push({ channel: channel, text:  "Started: " + (game.started ? 'Yes' : 'No') + "" });
		if (game.started && game.turn) {
			responses.push({ channel: channel, text:  "Turn: <@" + game.players[game.turn] + ">" });
		}
		return responses;
	}
};
connectfour.commands.drop = function(options, params) {
	var channel = params[1] ? connectfour.getChannelId(params[1], options) : options.channel;
	if (!channel || channel == options.user || channel[0] == 'D') {
		return { channel: options.user, text: 'Specify which channel, example: `connectfour status #connectfour`.' };
	}
	var game = connectfour.games[channel];
	if (!game) {
		return { channel: options.user, text: 'No active game in this channel.' };
	}
	var col = params[0];
	var col_data = col ? game.grid[col] : false;
	if (game.players[game.turn] != options.user) {
		return { channel: options.user, text: 'Not your turn.' };
	}
	if (!col) {
		return { channel: options.user, text: 'Which column (by number)?' };
	}
	if (!channel || channel == options.user || channel[0] == 'D') {
		return { channel: options.user, text: 'Specify which channel, example: `connectfour drop (column) #connectfour`.' };
	}
	var droppable = connectfour.gameDroppableColumns(game);
	if (!droppable[col]) {
		return { channel: options.user, text: 'Cannot drop a piece in this column.  Please try again.' };
	}
	else {
		var result = connectfour.dropPiece(game, options.user, col);
		return result;
	}
};
connectfour.commands.join = function(options, params) {
	var channel = params[0] ? connectfour.getChannelId(params[0], options) : options.channel;
	return connectfour.playerJoin(channel, options.user);
};
connectfour.commands.leave = function(options, params) {
	var channel = params[0] ? connectfour.getChannelId(params[0], options) : options.channel;
	return connectfour.playerLeave(channel, options.user);
};
connectfour.commands.start = function(options, params) {
	options = options || {};
	var channel = params[0] ? connectfour.getChannelId(params[0], options) : options.channel;
	connectfour.gameStart(channel,options.user);
	return [{ channel: channel, text: "Game started by <@" + options.user + ">" }];
};

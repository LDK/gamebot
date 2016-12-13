var exports = exports || {};
var stratego = exports;

// Each player in his turn moves one piece.
// Pieces move 1 square per turn, horizontally or vertically. Only the scout can move over multiple empty squares per turn. Pieces cannot jump over another piece.
// If a piece is moved onto a square occupied by an opposing piece, their identities are revealed.
	// If the attacked piece is the flag, the attacking side wins the game.
	// If the engaging pieces are of equal rank, they are both removed.
	// If the spy attacks the marshal, the spy defeats the higher ranked marshal. 
	// However, if the marshal attacks the spy, the spy loses. 
	// Bombs lose when they are attacked by a miner.
	// Bombs defeat every other piece.
	// Otherwise, the weaker piece is removed from the board, and the stronger piece is moved into the place formerly occupied by the weaker piece.

// The play alternates until one of the players gets four checkers of his colour in a row. The four in a row can be horizontal, vertical, or diagonal.(See examples).
// The first player to get four in a row wins.
// If the board is filled with pieces and neither player has 4 in a row, then the game is a draw.

stratego.games = {};
stratego.game_counter = 0;
stratego.debug = true;

stratego.piece = function(rank,color,owner) {
	return {
		rank: rank,
		color: color,
		owner: owner
	};
};

stratego.settings = {
	columns: 10,
	rows: 10,
	pieces: {
		B: {
			name: 'Bomb',
			movement: 0,
			allotment: 6
		},
		F: {
			name: 'Flag',
			movement: 0,
			allotment: 1
		},
		1: {
			name: 'Marshal',
			movement: 1,
			allotment: 1
		},
		2: {
			name: 'General',
			movement: 1,
			allotment: 1
		},
		3: {
			name: 'Colonel',
			movement: 1,
			allotment: 2
		},
		4: {
			name: 'Major',
			movement: 1,
			allotment: 3
		},
		5: {
			name: 'Captain',
			movement: 1,
			allotment: 4
		},
		6: {
			name: 'Lieutenant',
			movement: 1,
			allotment: 4
		},
		7: {
			name: 'Sergeant',
			movement: 1,
			allotment: 4
		},
		8: {
			name: 'Miner',
			movement: 1,
			allotment: 5,
			defuse: true
		},
		9: {
			name: 'Scout',
			movement: 9,
			allotment: 8
		},
		S: {
			name: 'Spy',
			movement: 1,
			allotment: 1
		},
	}
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

// The Stratego board (or "grid") consists of 10 x 10 squares. 
// Within the board there are two obstacles of 2 x 2 squares each. Pieces are not allowed to move there.
// Choose who plays first.

stratego.initGrid = function() {
	var square = (
		function(col,row,owner){ 
			if (isNaN(col) || isNaN(row)) { 
				return null;
			}
			return { 
				col: col,
				row: row,
				owner: owner,
				piece: piece || false,
				obstacle: obstacle || false
			};
		}
	);
	var grid = {};
	var cols = stratego.settings.columns;
	var rows = stratego.settings.rows;
	
	for (var col = 0; col < cols; col++) {
		grid[col] = { pieces: 0 };
		for (var row = 0; row < rows.length; row++) {
			grid[col][row] = new square(col, row);
		}
	}
		
	return grid;
}

stratego.playerInGame = function(user, game) {
	for (i = 0; i < game.players.length; i++) {
		if (user == game.players[i]) {
			return true;
		}
	}
	return false;
}

stratego.gameStart = function(channel, creator) {
	if (stratego.games[channel] && stratego.games[channel].active) {
		return { channel: creator, text: 'There is already a game in <#' + channel + '>.' };
	}
	stratego.game_counter++;
	stratego.games[channel] = {
		id: stratego.game_counter,
		channel: channel,
		creator: creator,
		created: (Date.now() / 1000 | 0),
		started: false,
		turn: null,
		winner: null,
		grid: stratego.initGrid(),
		players: [creator],
		colors: {},
		player_count: 1,
		game: 'stratego',
		poll: ['status'],
		active: true,
		last_turn_ts: null
	};
	stratego.games[channel].colors[creator] = 'colorRed';
	return { channel: channel, text: "Game started by <@" + creator + ">" };
}

// Returns array
stratego.playerLeave = function(channel, player) {
	var game = stratego.games[channel];
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
		responses.push({ channel: channel, text: stratego.gameDeclareWinner(game,game.players[0]) });
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
stratego.playerJoin = function(channel, player) {
	var game = stratego.games[channel];
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
stratego.endGame = function(game,message) {
	if (game.channel) {
		stratego.games[game.channel].active = false;
		stratego.games[game.channel].started = false;
		return message;
	}
};
stratego.gameDeclareWinner = function(game, player) {
	stratego.games[game.channel].winner = player;
	return stratego.endGame(game, "<@" + player + "> IS THE WINNER!");
};
stratego.gameDeclareDraw = function(game, player) {
	stratego.games[game.channel].winner = null;
	return stratego.endGame(game, "All columns are full.  The game is a draw.");
};
stratego.gameDroppableColumns = function(game) {
	var droppable = [];
	for (var i in game.grid) {
		var col = game.grid[i];
		if (col && game.grid[i].pieces < stratego.settings.rows) {
			droppable.push(i);
		}
	}
	return droppable;
};
stratego.gameAdvanceTurn = function(game) { 
	if (game.turn >= game.players.length - 1) {
		game.turn = 0;
	}
	else {
		game.turn++;
	}
	game.last_turn_ts = (Date.now() / 1000 | 0);
};
// Returns array
stratego.nextTurn = function(game,skip,draw) {
	if (!game) {
		return [];
	}
	var responses = [];
	stratego.gameAdvanceTurn(game);
	var player = game.players[game.turn];
	responses.push({ channel: player, text: "Your turn."});
	return responses;
};
stratego.begin = function(channel) {
	var game = stratego.games[channel];
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
stratego.initPieces = function(game, player, color) {
	if (!game.player_pieces) {
		game.player_pieces = {};
	}
	game.player_pieces[player] = [];
	for (var rank in game.settings.pieces) {
		var piece = new stratego.piece(rank,color,player);
		game.player_pieces[player].push(piece);
	}
	console.log('game.player_pieces');
}
// Returns array 
stratego.placePiece = function(game, player, col, row, rank) {
	var grid = game.grid;
	var col_data = grid[col];
	var responses = [];
	if (!game || !player || !grid || !col_data || (!col && col !== 0)) {
		return responses;
	}
	if (col_data.pieces >= stratego.settings.rows) {
		responses.push({ channel: player, text: "Square "+col+","+row+" is occupied." });
		return responses;
	}

	grid[col][row].owner = player;

	responses = responses.concat(stratego.nextTurn(game));
	return responses;
}

stratego.getChannelId = function(channel, options) {
	if (!channel || !stratego.channels) {
		return null;
	}
	channel = channel.replace('#','');
	if (channel.indexOf('|') > -1) {
		channel = channel.split('|');
		channel = channel[1].replace('>','');
	}
	var id;
	for (var i = 0; i < stratego.channels.length; i++) {
		if (channel == stratego.channels[i].name) {
			id = stratego.channels[i].id;
		}
	}
	if (!id && options.channel) {
		return options.channel;
	}
	return id;
};

stratego.getChannelName = function(channel, options) {
	if (!channel) {
		return null;
	}
	channel = channel.replace('#','');
	if (channel.indexOf('|') > -1) {
		channel = channel.split('|');
		channel = channel[1].replace('>','');
	}
	var channel_name;
	for (var i = 0; i < stratego.channels.length; i++) {
		if (channel == stratego.channels[i].id) {
			channel_name = stratego.channels[i].name;
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

stratego.command = function(cmd, options, params) {
	var res = {}
	if (stratego.commands[cmd]) {
		var channel = options.channel;
		res.messages = stratego.commands[cmd](options, params);
		if (res.messages && res.messages.constructor != Array) {
			res.messages = [res.messages];
		}
		if (channel) {
			res.game_state = stratego.games[channel];
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

stratego.commands = {};
stratego.commands.begin = function(options, params) {
	var channel = params[0] ? stratego.getChannelId(params[0], options) : options.channel;
	var game = stratego.games[channel];
	if (!game) {
		return 'No game in this channel.';
	}
	var responses = [];
	// One response for the channel to report game beginning.
	responses = responses.concat(stratego.begin(channel));
	return responses;
};
stratego.commands.status = function(options, params) {
	options = options || {};
	var channel = params[0] ? stratego.getChannelId(params[0], options) : options.channel || null;
	if (!channel || channel == options.user || channel[0] == 'D') {
		return [{ channel: options.user, text: 'Specify which channel, example: `stratego status #stratego`.' }];
	}
	var game = stratego.games[channel];
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
stratego.commands.drop = function(options, params) {
	var channel = params[1] ? stratego.getChannelId(params[1], options) : options.channel;
	if (!channel || channel == options.user || channel[0] == 'D') {
		return { channel: options.user, text: 'Specify which channel, example: `stratego status #stratego`.' };
	}
	var game = stratego.games[channel];
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
		return { channel: options.user, text: 'Specify which channel, example: `stratego drop (column) #stratego`.' };
	}
	var droppable = stratego.gameDroppableColumns(game);
	if (!droppable[col]) {
		return { channel: options.user, text: 'Cannot drop a piece in this column.  Please try again.' };
	}
	else {
		var result = stratego.dropPiece(game, options.user, col);
		return result;
	}
};
stratego.commands.join = function(options, params) {
	var channel = params[0] ? stratego.getChannelId(params[0], options) : options.channel;
	return stratego.playerJoin(channel, options.user);
};
stratego.commands.leave = function(options, params) {
	var channel = params[0] ? stratego.getChannelId(params[0], options) : options.channel;
	return stratego.playerLeave(channel, options.user);
};
stratego.commands.start = function(options, params) {
	options = options || {};
	var channel = params[0] ? stratego.getChannelId(params[0], options) : options.channel;
	stratego.gameStart(channel,options.user);
	return [{ channel: channel, text: "Game started by <@" + options.user + ">" }];
};

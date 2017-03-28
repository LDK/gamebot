// New Power Wrestling Simulator v0.1

var exports = exports || {};
var npw = exports;

// Each player selects a wrestler before "Begin Match" is available.

// Defining a turn:
// - Player move options are populated based on match situation.
// - Players submit moves
// - Sequence plays out in simulator.
// - Gamestate updates based on sequence results.
// - If the match has not ended, next turn.

// A weighted-probability draw based on move probability and player damage determines whose move is successful.
// - Damage is applied.
// - If a finishing move was executed, a pin attempt occurs.
// -- Attacked player's success at kicking out is determined by a weighted-probability. 
// -- If attacked player fails to kick out, attacking player wins.
// The play alternates until one of the players wins the match.
// If the game reaches its time limit without a winner, then the game is a draw.

npw.games = {};
console.log('npw games initialized');
npw.game_counter = 0;
npw.debug = true;
npw.settings = {
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
function pickOne(items) {
	var index = getRandomInt(0, items.length - 1);
	return items[index];
}
function escapeHtml(text) {
	return text
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;");
}

npw.move = (
		function(name,probability,damage,commentary,special){ 
			if (!probability || !damage || isNaN(probability) || isNaN(damage) || !name || !name.length) { 
				// Probability and damage must be numbers above 0.  Name can't be empty.
				return false;
			}
			var finisher = false;
			var dq = false;
			if (special) {
				if (special.finisher) {
					finisher = true;
				}
				if (special.dq_chance) {
					dq = { chance: special.dq_chance };
					if (special.dq_type) {
						dq.type = special.dq_type;
					}
					dq.cumulative = special.dq_cumulative ? true : false;
				}
			}
			return { 
				name: name,
				probability: probability,
				damage: damage || false,
				commentary: commentary || '',
				finisher: finisher,
				dq: dq
			};
		}
	);
npw.wrestlers = {};
// throat punch, eye rake, chop, kick, hurricanrana, superkick, toprope knee drop, some kind of closed fisted face punch, almost definitely a low blow and an actual fireball -- probably not that last time.
npw.wrestlers.razor = {
	name: 'Razor Ramon',
	id: 'razor',
	tendency: 'power',
	position: 'standing',
	facing: 'NW',
	location: 'ASE',
	zone: 'apron-south',
	damage: {
		head: 0,
		neck: 0,
		chest: 0,
		back: 0,
		leftAnkle: 0,
		rightAnkle: 0,
		leftKnee: 0,
		rightKnee: 0,
		leftLeg: 0,
		rightLeg: 0,
		leftArm: 0,
		rightArm: 0,
		leftShoulder: 0,
		rightShoulder: 0
	}
};
npw.wrestlers.bret = {
	name: 'Bret Hart',
	id: 'bret',
	tendency: 'submission',
	position: 'standing',
	facing: 'SE',
	location: 'AWN',
	zone: 'apron-west',
	damage: {
		head: 0,
		neck: 0,
		chest: 0,
		back: 0,
		leftAnkle: 0,
		rightAnkle: 0,
		leftKnee: 0,
		rightKnee: 0,
		leftLeg: 0,
		rightLeg: 0,
		leftArm: 0,
		rightArm: 0,
		leftShoulder: 0,
		rightShoulder: 0
	}
};
npw.wrestlers.hbk = {
	name: 'Shawn Michaels',
	id: 'hbk',
	tendency: 'aerial',
	position: 'standing',
	facing: 'NW',
	location: 'SEC',
	zone: 'ring',
	damage: {
		head: 0,
		neck: 0,
		chest: 0,
		back: 0,
		leftAnkle: 0,
		rightAnkle: 0,
		leftKnee: 0,
		rightKnee: 0,
		leftLeg: 0,
		rightLeg: 0,
		leftArm: 0,
		rightArm: 0,
		leftShoulder: 0,
		rightShoulder: 0
	}
};
npw.wrestlers.undertaker = {
	name: 'The Undertaker',
	id: 'undertaker',
	tendency: 'power',
	position: 'standing',
	facing: 'SE',
	location: 'NWC',
	zone: 'ring',
	damage: {
		head: 0,
		neck: 0,
		chest: 0,
		back: 0,
		leftAnkle: 0,
		rightAnkle: 0,
		leftKnee: 0,
		rightKnee: 0,
		leftLeg: 0,
		rightLeg: 0,
		leftArm: 0,
		rightArm: 0,
		leftShoulder: 0,
		rightShoulder: 0
	}
};
npw.useWrestler = function(game, player, wrestler) {
	game.player_wrestlers[player] = wrestler;
}
npw.playerInGame = function(user, game) {
	for (i = 0; i < game.players.length; i++) {
		if (user == game.players[i]) {
			return true;
		}
	}
	return false;
}
npw.clearPicks = function(game) {
	for (var key in game.players) {
		var player = game.players[key];
		game.move_picks[player] = null;
	}
}
npw.moves = {
	dropkick: {
		name: 'dropkick',
		risk: 10,
		impact: 12,
		factors: {
			impact: {
				aerial: 1.5,
				kick: 1.5
			},
			risk: {
				aerial: -1.25
			}
		},
		type: 'aerial',
		positions: ['standing','topRope','secondRope','running']
	},
	kick: {
		name: 'kick',
		risk: 4,
		impact: 4,
		factors: {
			impact: {
				kick: 2.0
			}
		},
		type: 'striking',
		positions: ['standing','topRope','secondRope','running']
	},
	punch: {
		name: 'punch',
		risk: 3,
		impact: 2,
		factors: {
			impact: {
				punch: 2.5
			}
		},
		type: 'striking',
		positions: ['standing','topRope','secondRope','running']
	},
	punch: {
		name: 'punch',
		risk: 3,
		impact: 2,
		factors: {
			impact: {
				punch: 2.5
			}
		},
		type: 'striking',
		positions: ['standing','topRope','secondRope','running']
	},
};

npw.gameStart = function(channel, creator) {
	console.log('gameStart');
	if (npw.games[channel] && npw.games[channel].active) {
		console.log('whatttt',npw);
		return { channel: creator, text: 'There is already a match in <#' + channel + '>.' };
	}
	npw.game_counter++;
	console.log('starting game in '+channel);
	npw.games[channel] = {
		id: npw.game_counter,
		channel: channel,
		creator: creator,
		created: (Date.now() / 1000 | 0),
		started: true,
		winner: null,
		players: [creator],
		wrestlers: npw.wrestlers,
		wrestler_owners: {},
		move_picks: {},
		player_count: 1,
		game: 'npw',
		poll: ['status'],
		active: true,
		arena_id: 1,
		log: []
	};
	npw.wrestlers.razor.owner = creator;
	npw.games[channel].wrestler_owners.razor = creator;
	console.log('after game start',npw.games);
	return { channel: channel, text: "Match started by <@" + creator + ">" + JSON.stringify(npw) };
}
// Returns array
npw.playerLeave = function(channel, player) {
	var game = npw.games[channel];
	var responses = [];
	if (!game || !game.active) {
		responses.push({ channel: player, text: 'No active match in <#' + channel + '>.' });
	}
	for (var i=0; i < game.players.length; i++) {
 		if (game.players[i] == player) {
			game.players.splice(i, 1);
			responses.push({ channel: channel, text: '<@' + player + '> has left the match.' });
		}
	}
	// Check for last-player-standing scenario.
	if (game.started && game.players.length < 2) {
		responses.push({ channel: channel, text: npw.endGame(npw.gameDeclareWinner(game,game.players[0])) });
	}
	// Check for NO player-standing scenario.
	if (!game.players.length) {
		game.active = false;
		responses.push({ channel: channel, text: 'All players have left the match. Match cancelled.' });
	}
	game.player_count = game.players.length;
	return responses;
}

// Returns array
npw.playerJoin = function(channel, player) {
	var game = npw.games[channel];
	var responses = [];
	if (!game || !game.active) {
		responses.push({ channel: player, text: 'No active match in <#' + channel + '>.' });
		return responses;
	}
	if (game.started) {
		responses.push({ channel: player, text: 'Match has already begun.' });
		return responses;
	}
	for (var i=0; i < game.players.length; i++) {
		if (game.players[i] == player) {
			// Player is already in game.  Let's not bother with a message.
			return responses;
		}
	}
	if (game.players.length > 1) {
		// No triple-threats in Microleague npw
		responses.push({ channel: player, text: 'Match is full.' });
		return responses;
	}
	game.players.push(player);
	npw.wrestlers.bret.owner = creator;
	npw.games[channel].wrestler_owners.bret = creator;
	responses.push({ channel: game.channel, text: '<@' + player + '> has joined the match.' });
	game.player_count = game.players.length;
	return responses;
};
npw.endGame = function(game,message) {
	if (game.channel) {
		npw.games[game.channel].active = false;
		npw.games[game.channel].started = false;
		return message;
	}
};
npw.gameDeclareWinner = function(game, player) {
	game.winner = player;
	return npw.endGame(game, "<@" + player + "> IS THE WINNER!");
};
npw.gameDeclareDraw = function(game, player) {
	game.winner = null;
	return npw.endGame(game, "The time limit has expired.  The match is a draw!");
};
npw.gameDroppableColumns = function(game) {
	var droppable = [];
	for (var i in game.grid) {
		var col = game.grid[i];
		if (col && game.grid[i].pieces < npw.settings.rows) {
			droppable.push(i);
		}
	}
	return droppable;
};
npw.gameAdvanceTurn = function(game) { 
	if (game.turn >= game.players.length - 1) {
		game.turn = 0;
	}
	else {
		game.turn++;
	}
	game.last_turn_ts = (Date.now() / 1000 | 0);
};
// Returns array
npw.nextTurn = function(game,skip,draw) {
	if (!game) {
		return [];
	}
	var responses = [];
	npw.gameAdvanceTurn(game);
	var player = game.players[game.turn];
	return responses;
};
npw.begin = function(channel) {
	var game = npw.games[channel];
	if (!game) {
		return 'No match in <#'+channel+'>';
	}
	if (game.started) {
		return 'Match has already begun.';
	}
	var responses = [];
	npw.clearPicks(game);
	var wrestler_names = [];
	var first = npw.wrestlers[game.player_wrestlers[game.players[0]]].long_name;
	var second = npw.wrestlers[game.player_wrestlers[game.players[1]]].long_name;
	wrestler_names.push(escapeHtml(first));
	wrestler_names.push(escapeHtml(second));
	responses.push({ channel: channel, text: "Ladies and gentlemen, welcome to the GameBot Coliseum!" });
	responses.push({ channel: channel, text: "Introducing first... " + wrestler_names[0] + "!" });
	responses.push({ channel: channel, text: "And his opponent... " + wrestler_names[1] + "!" });
	responses.push({ channel: channel, text: "The bell rings and we are underway." });
	game.started = true;
	return responses;
};
npw.checkWin = function(game) {
	return false;
};

npw.checkDraw = function(game) {
	return false;
};
npw.getChannelId = function(channel, options) {
	if (!channel || !npw.channels) {
		return null;
	}
	channel = channel.replace('#','');
	if (channel.indexOf('|') > -1) {
		channel = channel.split('|');
		channel = channel[1].replace('>','');
	}
	var id;
	for (var i = 0; i < npw.channels.length; i++) {
		if (channel == npw.channels[i].name) {
			id = npw.channels[i].id;
		}
	}
	if (!id && options.channel) {
		return options.channel;
	}
	return id;
};
npw.getChannelName = function(channel, options) {
	if (!channel) {
		return null;
	}
	channel = channel.replace('#','');
	if (channel.indexOf('|') > -1) {
		channel = channel.split('|');
		channel = channel[1].replace('>','');
	}
	var channel_name;
	for (var i = 0; i < npw.channels.length; i++) {
		if (channel == npw.channels[i].id) {
			channel_name = npw.channels[i].name;
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

npw.command = function(cmd, options, params) {
	var res = {}
	if (npw.commands[cmd]) {
		var channel = options.channel;
		res.messages = npw.commands[cmd](options, params);
		if (res.messages && res.messages.constructor != Array) {
			res.messages = [res.messages];
		}
		if (channel) {
			res.game_state = npw.games[channel];
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

npw.commands = {};
npw.commands.begin = function(options, params) {
	console.log('begin',options,params);
	var channel = params[0] ? npw.getChannelId(params[0], options) : options.channel;
	var game = npw.games[channel];
	if (!game) {
		return 'No game in this channel.';
	}
	var responses = [];
	// One response for the channel to report game beginning.
	responses = responses.concat(npw.begin(channel));
	return responses;
};
npw.commands.status = function(options, params) {
	options = options || {};
	var channel = params[0] ? npw.getChannelId(params[0], options) : options.channel || null;
	if (!channel || channel == options.user || channel[0] == 'D') {
		return [{ channel: options.user, text: 'Specify which channel, example: `npw status #npw`.' }];
	}
	var game = npw.games[channel];
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
		return responses;
	}
};
npw.commands.use = function(options, params) {
	console.log('use options',options,'params',params);
	var channel = params[1] ? npw.getChannelId(params[1], options) : options.channel;
	if (!channel || channel == options.user || channel[0] == 'D') {
		return { channel: options.user, text: 'Specify which channel, example: `npw use (wrestler) #npw`.' };
	}
	var game = npw.games[channel];
	console.log('use game',channel,game,npw.games);
	var wrestler_id = params[0] || 0;
	if (!game) {
		return { channel: options.user, text: 'No active match in this channel.' };
	}
	var result = npw.useWrestler(game, options.user, wrestler_id);
	return result;
};
npw.commands.pick = function(options, params) {
	var channel = params[1] ? npw.getChannelId(params[1], options) : options.channel;
	if (!channel || channel == options.user || channel[0] == 'D') {
		return { channel: options.user, text: 'Specify which channel, example: `npw pick (move number) #npw`.' };
	}
	var game = npw.games[channel];
	var index = params[0] || 0;
	if (!game) {
		return { channel: options.user, text: 'No active match in this channel.' };
	}
	var result = npw.pickMove(game, options.user, index);
	return result;
};
npw.commands.join = function(options, params) {
	var channel = params[0] ? npw.getChannelId(params[0], options) : options.channel;
	return npw.playerJoin(channel, options.user);
};
npw.endGame = function(game,message) {
	if (game.channel) {
		npw.games[game.channel].active = false;
		npw.games[game.channel].started = false;
		return message;
	}
};
npw.commands.end = function(options, params) {
	var channel = params[0] ? npw.getChannelId(params[0], options) : options.channel;
	var game = npw.games[channel];
	console.log('GAME',game);
	console.log('GAMES',npw.games);
	var responses = [{ channel: channel, text: npw.endGame(game, 'Game is ova!') }];
	return responses;
};
npw.commands.leave = function(options, params) {
	var channel = params[0] ? npw.getChannelId(params[0], options) : options.channel;
	return npw.playerLeave(channel, options.user);
};
npw.commands.start = function(options, params) {
	options = options || {};
	var channel = params[0] ? npw.getChannelId(params[0], options) : options.channel;
	console.log('HELLO',channel,options);
	npw.gameStart(channel,options.user);
	return { channel: channel, text: "Game started by <@" + options.user + ">" };
};

var exports = exports || {};
var wrestling = exports;

// Each player selects a wrestler before "Begin Match" is available.
// Each player in his turn selects a move to attempt (with finishing moves not available until a player has 32+ damage).
// A weighted-probability draw based on move probability and player damage determines whose move is successful.
// - Damage is applied.
// - If a finishing move was executed, a pin attempt occurs.
// -- Attacked player's success at kicking out is determined by a weighted-probability. 
// -- If attacked player fails to kick out, attacking player wins.
// The play alternates until one of the players wins the match.
// If the game reaches its time limit without a winner, then the game is a draw.

wrestling.games = {};
wrestling.game_counter = 0;
wrestling.debug = true;

wrestling.settings = {
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

wrestling.move = (
		function(name,probability,damage,commentary,finisher){ 
			if (!probability || !damage || isNaN(probability) || isNaN(damage) || !name || !name.length) { 
				// Probability and damage must be numbers above 0.  Name can't be empty.
				return false;
			}
			return { 
				name: name,
				probability: probability,
				damage: damage || false,
				commentary: commentary || '',
				finisher: finisher || false
			};
		}
	);
wrestling.wrestlers = {};
wrestling.wrestlers['hogan'] = {
	id: 'hogan',
	display: 'Hulk Hogan',
	short_name: 'Hogan',
	long_name: '"The Immortal" Hulk Hogan',
	nickname: "The Hulkster",
	moves: [
		wrestling.move('Punch',20,2,'%SN lands a punch on %sn.'),
		wrestling.move('Kick',20,2,'%SN kicks %sn.'),
		wrestling.move('Chop',20,2,'%SN assaults %sn.'),
		wrestling.move('Wrist Lock',16,3,'%SN grabs a wrist lock on %sn.'),
		wrestling.move('Elbow Drop',16,3,'%SN drops an elbow on %sn.'),
		wrestling.move('Body Slam',12,4,'%SN scoops %sn up and slams him down!'),
		wrestling.move('Clothesline',12,4,'%SN rocks %sn with a clothesline!'),
		wrestling.move('Atomic Drop',10,5),'%SN hits an Atomic Drop on %sn!',
		wrestling.move('Big Boot',8,6,"There's the Big Boot from %SND!  %sn is down!"),
		wrestling.move('Leg Drop',5,8,"%SN drops the leg!  %snd is in big trouble!",true)
	],
};
wrestling.wrestlers['savage'] = {
	id: 'savage',
	display: 'Randy Savage',
	short_name: 'Savage',
	long_name: '"Macho Man" Randy Savage',
	nickname: "Macho Man",
	moves: [
		wrestling.move('Stomp',20,2,'%SN stomps on %sn.'),
		wrestling.move('Punch',20,2,'%SN punches %sn.'),
		wrestling.move('Kick',20,2,'%SN with a kick to the midsection of %sn.'),
		wrestling.move('Snap Mare',16,3,'%SN flips %sn over with a snap mare.'),
		wrestling.move('Elbow Smash',16,3,'%SN smashes %sn with an elbow.'),
		wrestling.move('Body Block',12,4,'%SN takes %sn down with a running body block!'),
		wrestling.move('Double Chop',12,4,'%SN with a hard double chop to %sn!'),
		wrestling.move('Knee Drop',10,5,'%SN drops the knee on %sn!'),
		wrestling.move('Ax Handle',8,6,'%SND comes off the top with a devastating double ax-handle!  %snd is down!'),
		wrestling.move('Big Elbow',5,8,'%SND poses on the top rope and comes crashing down on %snd with a big flying elbow drop!  This is gonna be it!', true)
	],
};
wrestling.wrestlers['dibiase'] = {
	id: 'dibiase',
	display: 'Ted Dibiase',
	short_name: 'Dibiase',
	long_name: '"The Million Dollar Man" Ted Dibiase',
	nickname: "The Million Dollar Man",
	moves: [
		wrestling.move('Chop',20,2,'%SN chops %sn in the corner.'),
		wrestling.move('Head Smash',20,2,"%SN smashes %sn's head into the turnbuckle."),
		wrestling.move('Punch',20,2,'%SN lands a quick punch on %sn.'),
		wrestling.move('Chin Lock',16,3,'%SN grounds %sn with a chin lock.'),
		wrestling.move('Arm Lock',16,3,'%SN wrenches on the arm of %sn'),
		wrestling.move('Knee Drop',12,4,'%SN drops a knee to the head of %sn!'),
		wrestling.move('Fist Drop',12,4,'%SN measures %sn and drops a fist!'),
		wrestling.move('Clothesline',10,5,'%SN hits %sn with a devastating clothesline!'),
		wrestling.move('Back Suplex',8,6,'%SN takes %sn up and down with a back suplex!'),
		wrestling.move('$1M Dream',5,8,'%SND has %snd locked in the Million Dollar Dream!  Down on the mat!',true)
	],
};

wrestling.useWrestler = function(game, player, wrestler) {
	game.player_wrestlers[player] = wrestler;
}

wrestling.attemptMoves = function(game) {
	var chances = [];
	var i = 0;
	if (game.move_picks[game.players[0]] === 0 && game.move_picks[game.players[1]] === 0) {
		return [{ channel: game.channel, text: 'Neither wrestler manages to gain an advantage.' }];
	}
	for (var player in game.move_picks) {
		var wrestler = wrestling.wrestlers[game.player_wrestlers[player]];
		var move = wrestler.moves[game.move_picks[player]];
		if (!move) {
			move = wrestling.move('Block',18,-2,"%SN blocks %sn's attempt");
		}
		if (move && move.finisher) {
			var opponent_damage = i == 0 ? game.damage[game.players[1]] : game.damage[game.players[0]];
			i++;
			if ((opponent_damage && opponent_damage < 35) || opponent_damage === 0) {
				// Finisher will not work until you do 35 points of damage.
				continue;
			}
		}
		for (var j = 0; j < parseInt(move.probability); j++) {
			chances.push(player);
		}
	}
	if (chances.length < 1) {
		wrestling.clearPicks(game);
		return [{ channel: game.channel, text: 'Neither wrestler manages to gain an advantage.' }];
	}
	var winner = chances[getRandomInt(0, chances.length - 1)];
	wrestler = wrestling.wrestlers[game.player_wrestlers[winner]];
	var loser = null;
	if (!move || move.name != 'Block') { 
		move = wrestler.moves[game.move_picks[winner]];
	}
	for (var i in game.players) {
		var player = game.players[i];
		if (player != winner) { 
			loser = player;
		} // so poetic
	}
	if (move.damage > 0) {
		game.damage[loser] += parseInt(move.damage);
	}
	else {
		game.damage[winner] += parseInt(move.damage); // i.e. if we successfully block.
	}
	wrestling.clearPicks(game);
	var response_text = '';
	var winner_name = wrestling.wrestlers[game.player_wrestlers[winner]].short_name;
	var loser_name = wrestling.wrestlers[game.player_wrestlers[loser]].short_name;
	
	response_text += move.commentary;
	response_text = response_text.replace('%SND', pickOne([
		wrestling.wrestlers[game.player_wrestlers[winner]].short_name,
		wrestling.wrestlers[game.player_wrestlers[winner]].display,
		wrestling.wrestlers[game.player_wrestlers[winner]].nickname
	]));
	response_text = response_text.replace('%snd', pickOne([
		wrestling.wrestlers[game.player_wrestlers[loser]].short_name,
		wrestling.wrestlers[game.player_wrestlers[loser]].display,
		wrestling.wrestlers[game.player_wrestlers[loser]].nickname
	]));
	response_text = response_text.replace('%SN', pickOne([
		wrestling.wrestlers[game.player_wrestlers[winner]].short_name,
		wrestling.wrestlers[game.player_wrestlers[winner]].nickname
	]));
	response_text = response_text.replace('%sn', pickOne([
		wrestling.wrestlers[game.player_wrestlers[loser]].short_name,
		wrestling.wrestlers[game.player_wrestlers[loser]].nickname
	]));
	response_text = response_text.replace('%S',winner_name);
	response_text = response_text.replace('%s',loser_name);
	response_text = response_text.replace('%N',wrestling.wrestlers[game.player_wrestlers[winner]].nickname);
	response_text = response_text.replace('%n',wrestling.wrestlers[game.player_wrestlers[loser]].nickname);
	response_text = response_text.replace('%D',wrestling.wrestlers[game.player_wrestlers[winner]].display);
	response_text = response_text.replace('%d',wrestling.wrestlers[game.player_wrestlers[loser]].display);
	response_text = response_text.replace('%L',wrestling.wrestlers[game.player_wrestlers[winner]].long_name);
	response_text = response_text.replace('%l',wrestling.wrestlers[game.player_wrestlers[loser]].long_name);
	response_text = escapeHtml(response_text);

	var responses = [{ channel: game.channel, text: response_text }];
	if (move.finisher && game.damage[loser] > 35) {
		responses.push({ channel: game.channel, text: winner_name + " goes for the cover!" });
		var damage_factor = 1;
		if (game.damage[loser] > 39) {
			damage_factor++;
		}
		if (game.damage[loser] > 49) {
			damage_factor++;
		}
		var success = getRandomInt(0,damage_factor);
		if (success > 0) {
			responses.push({ channel: game.channel, text: "1.. 2.. 3!  It's over!" });
			responses.push({ channel: game.channel, text: "Here is your winner... " + escapeHtml(wrestling.wrestlers[game.player_wrestlers[winner]].long_name) + "!" });
			responses.push({ channel: game.channel, text: wrestling.endGame(game, wrestling.gameDeclareWinner(winner)) });
		}
		else {
			responses.push({ channel: game.channel, text: "1.. 2.. No!  A kickout!" });
		}
		// Do some probability thing here based on damage to decide if he kicks out or not.
	}
	return responses;
}

wrestling.pickMove = function(game, player, index) {
	game.move_picks[player] = index - 1;
	if (game.move_picks[game.players[0]] && game.move_picks[game.players[1]]) {
		// Both players have picked
		return wrestling.attemptMoves(game);
	}
	else {

	}
}

wrestling.playerInGame = function(user, game) {
	for (i = 0; i < game.players.length; i++) {
		if (user == game.players[i]) {
			return true;
		}
	}
	return false;
}

wrestling.clearPicks = function(game) {
	for (var key in game.players) {
		var player = game.players[key];
		game.move_picks[player] = null;
	}
}

wrestling.gameStart = function(channel, creator) {
	if (wrestling.games[channel] && wrestling.games[channel].active) {
		return { channel: creator, text: 'There is already a match in <#' + channel + '>.' };
	}
	wrestling.game_counter++;
	wrestling.games[channel] = {
		id: wrestling.game_counter,
		channel: channel,
		creator: creator,
		created: (Date.now() / 1000 | 0),
		started: false,
		turn: null,
		winner: null,
		players: [creator],
		player_wrestlers: {},
		wrestlers: wrestling.wrestlers,
		move_picks: {},
		player_count: 1,
		game: 'wrestling',
		poll: ['status'],
		damage: {},
		active: true
	};
	wrestling.games[channel].damage[creator] = 0;
	return { channel: channel, text: "Match started by <@" + creator + ">" };
}

// Returns array
wrestling.playerLeave = function(channel, player) {
	var game = wrestling.games[channel];
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
		responses.push({ channel: channel, text: wrestling.endGame(wrestling.gameDeclareWinner(game,game.players[0])) });
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
wrestling.playerJoin = function(channel, player) {
	var game = wrestling.games[channel];
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
		// No triple-threats in Microleague Wrestling
		responses.push({ channel: player, text: 'Match is full.' });
		return responses;
	}
	game.players.push(player);
	game.damage[player] = 0;
	responses.push({ channel: game.channel, text: '<@' + player + '> has joined the match.' });
	game.player_count = game.players.length;
	return responses;
};
wrestling.endGame = function(game,message) {
	if (game.channel) {
		wrestling.games[game.channel].active = false;
		wrestling.games[game.channel].started = false;
		return message;
	}
};
wrestling.gameDeclareWinner = function(game, player) {
	game.winner = player;
	return wrestling.endGame(game, "<@" + player + "> IS THE WINNER!");
};
wrestling.gameDeclareDraw = function(game, player) {
	game.winner = null;
	return wrestling.endGame(game, "The time limit has expired.  The match is a draw!");
};
wrestling.gameDroppableColumns = function(game) {
	var droppable = [];
	for (var i in game.grid) {
		var col = game.grid[i];
		if (col && game.grid[i].pieces < wrestling.settings.rows) {
			droppable.push(i);
		}
	}
	return droppable;
};
wrestling.gameAdvanceTurn = function(game) { 
	if (game.turn >= game.players.length - 1) {
		game.turn = 0;
	}
	else {
		game.turn++;
	}
	game.last_turn_ts = (Date.now() / 1000 | 0);
};
// Returns array
wrestling.nextTurn = function(game,skip,draw) {
	if (!game) {
		return [];
	}
	var responses = [];
	wrestling.gameAdvanceTurn(game);
	var player = game.players[game.turn];
	return responses;
};
wrestling.begin = function(channel) {
	var game = wrestling.games[channel];
	if (!game) {
		return 'No match in <#'+channel+'>';
	}
	if (game.started) {
		return 'Match has already begun.';
	}
	var responses = [];
	wrestling.clearPicks(game);
	var wrestler_names = [];
	var first = wrestling.wrestlers[game.player_wrestlers[game.players[0]]].long_name;
	var second = wrestling.wrestlers[game.player_wrestlers[game.players[1]]].long_name;
	wrestler_names.push(escapeHtml(first));
	wrestler_names.push(escapeHtml(second));
	responses.push({ channel: channel, text: "Ladies and gentlemen, welcome to the GameBot Coliseum!" });
	responses.push({ channel: channel, text: "Introducing first... " + wrestler_names[0] + "!" });
	responses.push({ channel: channel, text: "And his opponent... " + wrestler_names[1] + "!" });
	responses.push({ channel: channel, text: "The bell rings and we are underway." });
	game.started = true;
	return responses;
};
wrestling.checkWin = function(game) {
	return false;
};

wrestling.checkDraw = function(game) {
	return false;
};
wrestling.getChannelId = function(channel, options) {
	if (!channel || !wrestling.channels) {
		return null;
	}
	channel = channel.replace('#','');
	if (channel.indexOf('|') > -1) {
		channel = channel.split('|');
		channel = channel[1].replace('>','');
	}
	var id;
	for (var i = 0; i < wrestling.channels.length; i++) {
		if (channel == wrestling.channels[i].name) {
			id = wrestling.channels[i].id;
		}
	}
	if (!id && options.channel) {
		return options.channel;
	}
	return id;
};
wrestling.getChannelName = function(channel, options) {
	if (!channel) {
		return null;
	}
	channel = channel.replace('#','');
	if (channel.indexOf('|') > -1) {
		channel = channel.split('|');
		channel = channel[1].replace('>','');
	}
	var channel_name;
	for (var i = 0; i < wrestling.channels.length; i++) {
		if (channel == wrestling.channels[i].id) {
			channel_name = wrestling.channels[i].name;
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

wrestling.command = function(cmd, options, params) {
	var res = {}
	if (wrestling.commands[cmd]) {
		var channel = options.channel;
		res.messages = wrestling.commands[cmd](options, params);
		if (res.messages && res.messages.constructor != Array) {
			res.messages = [res.messages];
		}
		if (channel) {
			res.game_state = wrestling.games[channel];
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

wrestling.commands = {};
wrestling.commands.begin = function(options, params) {
	var channel = params[0] ? wrestling.getChannelId(params[0], options) : options.channel;
	var game = wrestling.games[channel];
	if (!game) {
		return 'No game in this channel.';
	}
	var responses = [];
	// One response for the channel to report game beginning.
	responses = responses.concat(wrestling.begin(channel));
	return responses;
};
wrestling.commands.status = function(options, params) {
	options = options || {};
	var channel = params[0] ? wrestling.getChannelId(params[0], options) : options.channel || null;
	if (!channel || channel == options.user || channel[0] == 'D') {
		return [{ channel: options.user, text: 'Specify which channel, example: `wrestling status #wrestling`.' }];
	}
	var game = wrestling.games[channel];
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
wrestling.commands.use = function(options, params) {
	var channel = params[1] ? wrestling.getChannelId(params[1], options) : options.channel;
	if (!channel || channel == options.user || channel[0] == 'D') {
		return { channel: options.user, text: 'Specify which channel, example: `wrestling use (wrestler) #wrestling`.' };
	}
	var game = wrestling.games[channel];
	var wrestler_id = params[0] || 0;
	if (!game) {
		return { channel: options.user, text: 'No active match in this channel.' };
	}
	var result = wrestling.useWrestler(game, options.user, wrestler_id);
	return result;
};
wrestling.commands.pick = function(options, params) {
	var channel = params[1] ? wrestling.getChannelId(params[1], options) : options.channel;
	if (!channel || channel == options.user || channel[0] == 'D') {
		return { channel: options.user, text: 'Specify which channel, example: `wrestling pick (move number) #wrestling`.' };
	}
	var game = wrestling.games[channel];
	var index = params[0] || 0;
	if (!game) {
		return { channel: options.user, text: 'No active match in this channel.' };
	}
	var result = wrestling.pickMove(game, options.user, index);
	return result;
};
wrestling.commands.join = function(options, params) {
	var channel = params[0] ? wrestling.getChannelId(params[0], options) : options.channel;
	return wrestling.playerJoin(channel, options.user);
};
wrestling.commands.leave = function(options, params) {
	var channel = params[0] ? wrestling.getChannelId(params[0], options) : options.channel;
	return wrestling.playerLeave(channel, options.user);
};
wrestling.commands.start = function(options, params) {
	options = options || {};
	var channel = params[0] ? wrestling.getChannelId(params[0], options) : options.channel;
	wrestling.gameStart(channel,options.user);
	return { channel: channel, text: "Game started by <@" + options.user + ">" };
};

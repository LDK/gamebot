// New Power Wrestling Simulator v0.1

var exports = exports || {};
var npw = exports;

// Each player selects a wrestler before "Begin Match" is available.
// Each player in his turn selects a move to attempt (with finishing moves not available until a player has 32+ damage).
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
npw.wrestlers['hogan'] = {
	id: 'hogan',
	display: 'Hulk Hogan',
	short_name: 'Hogan',
	long_name: '"The Immortal" Hulk Hogan',
	nickname: "The Hulkster",
	moves: [
		npw.move('Punch',20,2,'%SN lands a punch on %sn.'),
		npw.move('Kick',20,2,'%SN kicks %sn.'),
		npw.move('Chop',20,2,'%SN assaults %sn.'),
		npw.move('Wrist Lock',16,3,'%SN grabs a wrist lock on %sn.'),
		npw.move('Elbow Drop',16,3,'%SN drops an elbow on %sn.'),
		npw.move('Body Slam',12,4,'%SN scoops %sn up and slams him down!'),
		npw.move('Clothesline',12,4,'%SN rocks %sn with a clothesline!'),
		npw.move('Atomic Drop',10,5),'%SN hits an Atomic Drop on %sn!',
		npw.move('Big Boot',8,6,"There's the Big Boot from %SND!  %sn is down!"),
		npw.move('Leg Drop',5,8,"%SN drops the leg!  %snd is in big trouble!",{ finisher: true })
	],
};
npw.wrestlers['savage'] = {
	id: 'savage',
	display: 'Randy Savage',
	short_name: 'Savage',
	long_name: '"Macho Man" Randy Savage',
	nickname: "Macho Man",
	moves: [
		npw.move('Stomp',20,2,'%SN stomps on %sn.'),
		npw.move('Punch',20,2,'%SN punches %sn.'),
		npw.move('Kick',20,2,'%SN with a kick to the midsection of %sn.'),
		npw.move('Snap Mare',16,3,'%SN flips %sn over with a snap mare.'),
		npw.move('Elbow Smash',16,3,'%SN smashes %sn with an elbow.'),
		npw.move('Body Block',12,4,'%SN takes %sn down with a running body block!'),
		npw.move('Double Chop',12,4,'%SN with a hard double chop to %sn!'),
		npw.move('Knee Drop',10,5,'%SN drops the knee on %sn!'),
		npw.move('Ax Handle',8,6,'%SND comes off the top with a devastating double ax-handle!  %snd is down!'),
		npw.move('Big Elbow',5,8,'%SND poses on the top rope and comes crashing down on %snd with a big flying elbow drop!  This is gonna be it!', { finisher: true })
	],
};
npw.wrestlers['dibiase'] = {
	id: 'dibiase',
	display: 'Ted Dibiase',
	short_name: 'Dibiase',
	long_name: '"The Million Dollar Man" Ted Dibiase',
	nickname: "The Million Dollar Man",
	moves: [
		npw.move('Chop',20,2,'%SN chops %sn in the corner.'),
		npw.move('Head Smash',20,2,"%SN smashes %sn's head into the turnbuckle."),
		npw.move('Punch',20,2,'%SN lands a quick punch on %sn.'),
		npw.move('Chin Lock',16,3,'%SN grounds %sn with a chin lock.'),
		npw.move('Arm Lock',16,3,'%SN wrenches on the arm of %sn'),
		npw.move('Knee Drop',12,4,'%SN drops a knee to the head of %sn!'),
		npw.move('Fist Drop',12,4,'%SN measures %sn and drops a fist!'),
		npw.move('Clothesline',10,5,'%SN hits %sn with a devastating clothesline!'),
		npw.move('Back Suplex',8,6,'%SN takes %sn up and down with a back suplex!'),
		npw.move('$1M Dream',5,8,'%SND has %snd locked in the Million Dollar Dream!  Down on the mat!',true)
	],
};
// throat punch, eye rake, chop, kick, hurricanrana, superkick, toprope knee drop, some kind of closed fisted face punch, almost definitely a low blow and an actual fireball -- probably not that last time.
npw.wrestlers['weiss'] = {
	id: 'weiss',
	display: 'Adam Weiss',
	short_name: 'Weiss',
	long_name: '"The Fireball" Adam Weiss',
	nickname: "The Fireball",
	moves: [
		npw.move('Chop',20,2,'%SN delivers a loud chop to %sn.'),
		npw.move('Kick',20,2,"%SN smashes %sn's with a kick."),
		npw.move('Eye Rake',20,4,'%SN wrenches on the arm of %sn',{ dq_chance: 5, dq_cumulative: true, dq_type: 'ref_enough' }),
		npw.move('Throat Punch',18,5,'%SN with a shot to the throat of %sn.',{ dq_chance: 10, dq_cumulative: true, dq_type: 'ref_enough' }),
		npw.move('Hurricanrana',12,4,'%SN grounds %sn with a chin lock.'),
		npw.move('Super Kick',12,4,'%SN drops a knee to the head of %sn!'),
		npw.move('KO Punch',12,7,'%SN measures %sn and pounds him with a closed fist!',{ dq_chance: 10, dq_cumulative: true, dq_type: 'ref_enough' }),
		npw.move('Low Blow',8,10,'%SN with a blatant low blow on %snd!',{ dq_chance: 50, dq_cumulative: false, dq_type: 'ref_see' }),
		npw.move('Flying Knee',8,6,'%SN takes %sn up and down with a back suplex!'),
		npw.move('Flamedriver',5,8,'%SND has %snd locked in the Million Dollar Dream!  Down on the mat!',{ finisher: true })
	],
};
npw.wrestlers['hectic'] = {
	id: 'hectic',
	display: 'Jason Hectic',
	short_name: 'Hectic',
	long_name: '"Frenetic" Jason Hectic',
	nickname: "The Frenetic One",
	moves: [
		npw.move('Chop',20,2,'%SN gives %sn a vicious knife-edge chop in the corner.'),
		npw.move('Back Elbow',20,2,"%SN hits a spinning back elbow that floors %sn."),
		npw.move('Leg Kick',20,2,'%SN wears away at the legs of %sn with a stiff kick.'),
		npw.move('Headscissors',16,3,'%SN grounds %sn with a headscissors takeover.'),
		npw.move('Knee Bar',16,3,'%SN cranks on the knee and legs of %sn with a knee bar.'),
		npw.move('Knee Drop',12,4,'%SN drops a knee to the head of %sn!'),
		npw.move('Fist Drop',12,4,'%SN measures %sn and drops a fist!'),
		npw.move('Clothesline',10,5,'%SN hits %sn with a devastating clothesline!'),
		npw.move('Shooting Star',5,8,'%SN comes off the top rope with a Shooting Star Press!! Incredible!'),
		npw.move('$1M Dream',5,8,'%SND has %snd locked in the Million Dollar Dream!  Down on the mat!',{ finisher: true })
	],
};

npw.useWrestler = function(game, player, wrestler) {
	game.player_wrestlers[player] = wrestler;
}

npw.attemptMoves = function(game) {
	var chances = [];
	var i = 0;
	if (game.move_picks[game.players[0]] === 0 && game.move_picks[game.players[1]] === 0) {
		return [{ channel: game.channel, text: 'Neither wrestler manages to gain an advantage.' }];
	}
	for (var player in game.move_picks) {
		var wrestler = npw.wrestlers[game.player_wrestlers[player]];
		var move = wrestler.moves[game.move_picks[player]];
		if (!move) {
			move = npw.move('Block',18,-2,"%SN blocks %sn's attempt");
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
		npw.clearPicks(game);
		return [{ channel: game.channel, text: 'Neither wrestler manages to gain an advantage.' }];
	}
	var winner = chances[getRandomInt(0, chances.length - 1)];
	wrestler = npw.wrestlers[game.player_wrestlers[winner]];
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
	npw.clearPicks(game);
	var response_text = '';
	var winner_name = npw.wrestlers[game.player_wrestlers[winner]].short_name;
	var loser_name = npw.wrestlers[game.player_wrestlers[loser]].short_name;
	
	response_text += move.commentary;
	response_text = response_text.replace('%SND', pickOne([
		npw.wrestlers[game.player_wrestlers[winner]].short_name,
		npw.wrestlers[game.player_wrestlers[winner]].display,
		npw.wrestlers[game.player_wrestlers[winner]].nickname
	]));
	response_text = response_text.replace('%snd', pickOne([
		npw.wrestlers[game.player_wrestlers[loser]].short_name,
		npw.wrestlers[game.player_wrestlers[loser]].display,
		npw.wrestlers[game.player_wrestlers[loser]].nickname
	]));
	response_text = response_text.replace('%SN', pickOne([
		npw.wrestlers[game.player_wrestlers[winner]].short_name,
		npw.wrestlers[game.player_wrestlers[winner]].nickname
	]));
	response_text = response_text.replace('%sn', pickOne([
		npw.wrestlers[game.player_wrestlers[loser]].short_name,
		npw.wrestlers[game.player_wrestlers[loser]].nickname
	]));
	response_text = response_text.replace('%S',winner_name);
	response_text = response_text.replace('%s',loser_name);
	response_text = response_text.replace('%N',npw.wrestlers[game.player_wrestlers[winner]].nickname);
	response_text = response_text.replace('%n',npw.wrestlers[game.player_wrestlers[loser]].nickname);
	response_text = response_text.replace('%D',npw.wrestlers[game.player_wrestlers[winner]].display);
	response_text = response_text.replace('%d',npw.wrestlers[game.player_wrestlers[loser]].display);
	response_text = response_text.replace('%L',npw.wrestlers[game.player_wrestlers[winner]].long_name);
	response_text = response_text.replace('%l',npw.wrestlers[game.player_wrestlers[loser]].long_name);
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
			responses.push({ channel: game.channel, text: "Here is your winner... " + escapeHtml(npw.wrestlers[game.player_wrestlers[winner]].long_name) + "!" });
			responses.push({ channel: game.channel, text: npw.endGame(game, npw.gameDeclareWinner(winner)) });
		}
		else {
			responses.push({ channel: game.channel, text: "1.. 2.. No!  A kickout!" });
		}
		// Do some probability thing here based on damage to decide if he kicks out or not.
	}
	return responses;
}

npw.pickMove = function(game, player, index) {
	game.move_picks[player] = index - 1;
	if (game.move_picks[game.players[0]] && game.move_picks[game.players[1]]) {
		// Both players have picked
		return npw.attemptMoves(game);
	}
	else {

	}
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
		started: false,
		turn: null,
		winner: null,
		players: [creator],
		player_wrestlers: {},
		wrestlers: npw.wrestlers,
		move_picks: {},
		player_count: 1,
		game: 'npw',
		poll: ['status'],
		damage: {},
		active: true
	};
	npw.games[channel].damage[creator] = 0;
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
	game.damage[player] = 0;
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

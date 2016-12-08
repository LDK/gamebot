var exports = exports || {};
var uno = exports;

uno.games = {};
uno.game_counter = 0;
uno.debug = true;

uno.settings = {
	deal_per: 7
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

/**
 * Shuffles array in place.
 * @param {Array} a items The array containing the items.
 */
function shuffle(a) {
    var j, x, i;
    for (i = a.length; i; i--) {
        j = Math.floor(Math.random() * i);
        x = a[i - 1];
        a[i - 1] = a[j];
        a[j] = x;
    }
}

uno.initDeck = function() {
	var card = (
		function(color,label,value,special,wild){ 
			return { 
				color: color || null,
				label: label || '',
				value: value || 0,
				special: special || false,
				wild: wild || false
			}; 
		}
	);
	var deck = [];
	var colors = ['Red','Green','Yellow','Blue'];
	for (var i=0; i<4; i++) {
		var color = colors[i];
		// One zero card for each color;
		deck.push(new card(color,'0',0));
		for (var j=1; j<10; j++) {
			// Two in each color for cards 1-9
			deck.push(new card(color,''+j,j));
			deck.push(new card(color,''+j,j));
		}
		// SPECIALS
		// Two Skips in each color, worth 20 points
		deck.push(new card(color,'Skip',20,true));
		deck.push(new card(color,'Skip',20,true));
		// Two Reverses in each color, worth 20 points
		deck.push(new card(color,'Reverse',20,true));
		deck.push(new card(color,'Reverse',20,true));
		// Two Draw Twos in each color, worth 20 points
		deck.push(new card(color,'Draw Two',20,true));
		deck.push(new card(color,'Draw Two',20,true));
	}
	// WILDS
	// Four normal Wilds
	deck.push(new card(null,'Wild',50,true,true));
	deck.push(new card(null,'Wild',50,true,true));
	deck.push(new card(null,'Wild',50,true,true));
	deck.push(new card(null,'Wild',50,true,true));
	// Four Wild Draw Fours
	deck.push(new card(null,'Wild Draw Four',50,true,true));
	deck.push(new card(null,'Wild Draw Four',50,true,true));
	deck.push(new card(null,'Wild Draw Four',50,true,true));
	deck.push(new card(null,'Wild Draw Four',50,true,true));
	
	return deck;
}

uno.playerInGame = function(user, game) {
	for (i = 0; i < game.players.length; i++) {
		if (user == game.players[i]) {
			return true;
		}
	}
	return false;
}

// Returns an array of *indexes* that correlate to playable cards in the player's hand.
uno.playerPlayableCards = function(user,game) {
	if (!uno.playerInGame(user,game)) {
		return 'You are not in this game.';
	}
	if (!game.started) {
		return 'The game has not started.';
	}
	if (!game.hands[user].length) {
		// This should never happen unless the game is over or hasn't started, I'm thinking.  But for now..
		return 'You have no cards.';
	}
	if (!game.current_color) {
		return 'A color is not currently set, so no cards may be played.';
	}
	var color = game.current_color;
	var label = game.current_label;
	var hand = game.hands[user];
	var playable = [];
	var wilds = [];
	for (var index in hand) {
		var card = hand[index];
		if (card.wild) {
			// We will set aside the wilds for the moment.
			wilds.push(index);
		}
		else if (card.color == color || card.label == label) {
			// A card in the player's hand matches the active color, or matches the label.
			playable.push(index);
		}
	}
	if (playable.length == 0 && wilds.length > 0) {
		// We have no normal playable cards, but we have wilds!
		return wilds;
	}
	return playable;
};

// Returns a comma separated string of cards.
uno.cardList = function (stack, options) {
	options = options || {};
	if (!stack || !stack.length) {
		return 'No cards.';
	}
	var result = '';
	var numerator = 0;
	for (var i = 0; i < stack.length; i++) {
		if (!options.indexes || inArray(i,options.indexes)) {
			// For filtering down to specific indexes, e.g. listing playable cards
			var card = stack[i];
			if (options.numerate) {
				numerator++;
				result += "[" + (numerator) + "] ";
			}
			if (card.color) {
				result += card.color + ' ';
			}
			result += card.label;
			if (i < stack.length - 1) {
				result += ', ';
			}
		}
	}
	return result;
}

uno.gameStart = function(channel, creator) {
	if (uno.games[channel] && uno.games[channel].active) {
		return { channel: creator, text: 'There is already a game in <#' + channel + '>.' };
	}
	uno.game_counter++;
	uno.games[channel] = {
		id: uno.game_counter,
		game: 'uno',
		poll: ['status','cards'],
		channel: channel,
		creator: creator,
		created: (Date.now() / 1000 | 0),
		started: false,
		turn: null,
		winner: null,
		current_color: null,
		current_label: null,
		reverse: false,
		wild_active: false,
		wild_skip: false,
		discard: [],
		deck: uno.initDeck(),
		players: [creator],
		hands: {},
		points: {},
		active: true,
		settings: {
			time_limit: 120000, // 2 minutes in milliseconds
			time_limit_event: 'skip'
		},
		next_turn_ts: null
	};
	uno.games[channel].hands[creator] = [];
	uno.games[channel].points[creator] = 0;
	shuffle(uno.games[channel].deck);
	return { channel: channel, text: "Game started by <@" + creator + ">" };
}

// Returns array
uno.playerLeave = function(channel, player) {
	var game = uno.games[channel];
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
		responses.push({ channel: channel, text: uno.gameDeclareWinner(game,game.players[0]) });
	}
	// Check for NO player-standing scenario.
	if (!game.players.length) {
		game.active = false;
		responses.push({ channel: channel, text: 'All players have left game.  Game cancelled.' });
	}
	return responses;
}

// Returns array
uno.playerJoin = function(channel, player) {
	var game = uno.games[channel];
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
			return [];
		}
	}
	game.players.push(player);
	game.hands[player] = [];
	game.points[player] = 0;
	responses.push({ channel: game.channel, text: '<@' + player + '> has joined the game.' });
	return responses;
}
uno.playerSetColor = function(game, player, color) {
	var ucfirst = function(str) {
		str += '';
		var f = str.charAt(0).toUpperCase();
		return f + str.substr(1);
	};
	if (['blue','yellow','red','green'].indexOf(color.toLowerCase()) != -1) {
		game.current_color = ucfirst(color.toLowerCase());
		game.wild_active = false;
	}
	return { channel: game.channel, text: '<@' + player + '> sets the active color to '+game.current_color+'.'};
}
uno.endGame = function(game,message) {
	if (game.channel) {
		uno.games[game.channel].active = false;
		uno.games[game.channel].started = false;
		return message;
	}
};
uno.gameDeclareWinner = function(game, player) {
	uno.games[game.channel].winner = player;
	return uno.endGame(game, "<@" + player + "> IS THE WINNER!");
};
uno.cardName = function(card) {
	var card_name = '';
	if (card.color) {
		card_name += card.color + ' ';
	}
	if (card.label) {
		card_name += card.label;
	}
	return card_name;
}
// Returns array
uno.playerCardList = function(game, player) {
	var responses = [];
	responses.push({ channel: player, text: "Your Cards: " + uno.cardList(game.hands[player]) });
	if (!game.wild_active) {
		var playable = uno.playerPlayableCards(player,game);
		if (playable.length) {
			responses.push({ channel: player, text: "Playable: " + uno.cardList(game.hands[player],{ indexes: playable, numerate: true }) });
			responses.push({ channel: player, text: "Type `uno play (number) #" + uno.getChannelName(game.channel) + "` to play." });
		}
		else {
			responses.push({ channel: player, text: "No playable cards. Type `uno draw #" + uno.getChannelName(game.channel) +"` to draw a card." });
		}
	}
	responses.push({ channel: game.channel, data: game.hands[player], user: player });
	return responses;
}
uno.gameAdvanceTurn = function(game) { 
	if (!game.reverse) {
		if (game.turn >= game.players.length - 1) {
			game.turn = 0;
		}
		else {
			game.turn++;
		}
	}
	else {
		if (game.turn == 0) {
			game.turn = game.players.length - 1;
		}
		else {
			game.turn--;
		}
	}
};
// Returns array
uno.nextTurn = function(game,skip,draw) {
	if (!game) {
		return [];
	}
	var responses = [];
	if (game.wild_active) {
		if (draw > 0) {
			game.wild_skip = true;
			var next_turn = (game.turn + 0);
			if (!game.reverse) {
				if (next_turn >= game.players.length - 1) {
					next_turn = 0;
				}
				else {
					next_turn++;
				}
			}
			else {
				if (next_turn == 0) {
					next_turn = game.players.length - 1;
				}
				else {
					next_turn--;
				}
			}
			responses = responses.concat(uno.playerDraw(game, game.players[next_turn], draw));
		}
		responses.push({ channel: game.players[game.turn], text: "<@" + game.players[game.turn] + ">, Set the color by typing `uno color (color)`, example: `uno color blue`." });
		return responses;
	}
	uno.gameAdvanceTurn(game);
	var player = game.players[game.turn];
	if (skip) {
		if (draw == 0) {
			responses.push({ channel: game.channel, text: "<@" + player + "> is skipped." });
		}
		else {
			responses = responses.concat(uno.playerDraw(game, player, draw));
		}
		responses = responses.concat(uno.nextTurn(game,false,draw));
	}
	var card_name = '';
	if (game.current_color) {
		card_name += game.current_color + ' ';
	}
	card_name += game.current_label;
	responses.push({ channel: game.players[game.turn], text: "Your turn. Active card is: " + card_name });
	responses = responses.concat(uno.playerCardList(game,game.players[game.turn]));
	return responses;
}
// Returns array 
uno.deal = function(channel) {
	var game = uno.games[channel];
	if (!game) {
		return 'No game in <#'+channel+'>';
	}
	if (game.started) {
		return 'Game has already begun play.';
	}
	var deck = game.deck;
	var responses = [];
	for (var key in game.players) {
		var player = game.players[key];
		for (var i = 1; i <= uno.settings.deal_per; i++) {
			var card = deck.pop();
			game.hands[player].push(card);
		}
	}
	responses.push({ channel: channel, text: "Dealt "+uno.settings.deal_per+" cards to each player." });
	var card = deck.pop();
	game.discard.push(card);
	game.current_color = card.color;
	game.current_label = card.label;
	game.turn = getRandomInt(0,game.players.length-1);
	responses.push({ channel: channel, text: "<@" + game.players[game.turn] + "> has been selected to go first." });
	game.started = true;
	if (card.wild) {
		game.wild_active = true;
	}
	responses.push({ channel: channel, text: "First card is: "+ uno.cardName(card) });
	return responses;
}
// Returns array
uno.playerDraw = function(game, player, num, autoplay) {
	num = num || 1;
	var drawn = [];
	if (num > 1) {
		autoplay = false;
	}
	var card;
	var hand = game.hands[player];
	for (var i = 0; i < num; i++) {
		card = game.deck.pop();
		hand.push(card);
		drawn.push(card);
	}
	var responses = [];
	if (num == 1) {
		responses.push({ channel: game.channel, text: "<@" + player + "> draws a card." });
	}
	else {
		responses.push({ channel: game.channel, text: "<@" + player + "> draws " + num + " cards." });
	}
	responses.push({ channel: player, text: 'You Drew: ' + uno.cardList(drawn) });
	if (game.deck.length < 1) {
		game.deck = discard;
		game.discard = [];
		shuffle(game.deck);
		responses.push({ channel: game.channel, text: "All cards in deck have been drawn.  Shuffling discard pile as new deck." });
	}
	if (autoplay) {
		var hand = game.hands[player];
		if (game.current_color == card.color || game.current_label == card.label || card.wild) {
			responses.push({ channel: player, text: "Playable card!  Played automatically." });
			responses = responses.concat(uno.playCard(game, player, hand.length - 1));
		}
		else {
			responses.push({ channel: player, text: "Not playable.  You pass this turn." });
			responses = responses.concat(uno.nextTurn(game));
		}
	}
	return responses;
}
// Returns array 
uno.playCard = function(game, player, index) {
	if (!game || !player || (!index && index !== 0)) {
		return [];
	}
	var hand = game.hands[player];
	var card = hand[index];
	game.discard.unshift(card);
	game.current_label = card.label;
	var responses = [];
	var skip = false;
	var draw = 0;
	if (card.color) {
		game.current_color = card.color;
	}
	else if (card.wild) {
		game.wild_active = true;
		game.current_color = null;
	}
	if (card.label == 'Skip') {
		skip = true;
	}
	if (card.label == 'Draw Two') {
		skip = true;
		draw = 2;
	}
	if (card.label == 'Wild Draw Four') {
		skip = true
		draw = 4;
	}
	if (card.label == 'Reverse') {
		game.reverse = !game.reverse;
		if (game.players.length < 3) {
			skip = true;
		}
	}
	hand.splice(index, 1);
	responses.push({ channel: game.channel, text: "<@" + player + "> plays a " + uno.cardName(card) + "." });
	if (hand.length === 1) {
		responses.push({ channel: game.channel, text: "<@" + player + "> HAS ONE CARD LEFT!" });
	}
	if (hand.length === 0) {
		var winnerObj = { channel: game.channel };
		winnerObj.text = uno.gameDeclareWinner(game, player)
		responses.push(winnerObj);
	}
	else {
		responses = responses.concat(uno.nextTurn(game,skip,draw));
	}
	return responses;
}

uno.getChannelId = function(channel, options) {
	if (!channel || !uno.channels) {
		return null;
	}
	channel = channel.replace('#','');
	if (channel.indexOf('|') > -1) {
		channel = channel.split('|');
		channel = channel[1].replace('>','');
	}
	var id;
	for (var i = 0; i < uno.channels.length; i++) {
		if (channel == uno.channels[i].name) {
			id = uno.channels[i].id;
		}
	}
	if (!id && options.channel) {
		return options.channel;
	}
	return id;
};

uno.getChannelName = function(channel, options) {
	if (!channel || !uno.channels) {
		return null;
	}
	channel = channel.replace('#','');
	if (channel.indexOf('|') > -1) {
		channel = channel.split('|');
		channel = channel[1].replace('>','');
	}
	var channel_name;
	for (var i = 0; i < uno.channels.length; i++) {
		if (channel == uno.channels[i].id) {
			channel_name = uno.channels[i].name;
		}
	}
	if (!channel_name && options && options.channel) {
		return options.channel;
	}
	return channel_name;
};

/**
	THE COMMAND FUNCTION
	This is the function that serves as the bridge between the slack interface and the game module.
 */

uno.command = function(cmd, options, params) {
	var res = {};
	params = params || [];
	if (uno.commands[cmd]) {
		var channel = options.channel;
		res.messages = uno.commands[cmd](options, params);
		for (var i in res.messages) {
			var message = res.messages[i];
			if (message.data) {
				switch (cmd) {
					case 'cards':
						res.data = message.data;
						res.type = 'cards';
					break;
				}
			}
		}
		if (res.messages && res.messages.constructor != Array) {
			res.messages = [res.messages];
		}
		if (channel) {
			res.game_state = uno.games[channel];
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

uno.commands = {};
uno.commands.deal = function(options, params) {
	var channel = params[0] ? uno.getChannelId(params[0], options) : options.channel;
	var game = uno.games[channel];
	if (!game) {
		return 'No game in this channel.';
	}
	var responses = [];
	// One response for the channel to report dealing.
	responses = responses.concat(uno.deal(channel));
	// A private message to each player in the game, informing them of their cards.
	for (var i = 0; i < game.players.length; i++) {
		var player = game.players[i];
		options.user = player;
		responses = responses.concat(uno.commands.cards(options, params));
	}
	return responses;
};
uno.commands.color = function(options, params) {
	// For setting the color after playing a Wild.
	// Unless we're in debug, no in-channel feedback for errant color calls.  They know what they did.
	var game = uno.games[options.channel];
	var channel = params[0] ? uno.getChannelId(params[0], options) : options.channel;
	if (!game || !game.wild_active) {
		if (uno.debug) {
			return ('No active game or wild_active not set: ' + JSON.stringify(game));
		}
	}
	var color = params[0];
	var responses = [];
	// First report the color change
	responses.push(uno.playerSetColor(game, options.user, color));
	responses = responses.concat(uno.nextTurn(game,game.wild_skip));
	game.wild_skip = false;
	return responses;
};
uno.commands.cards = function(options, params) {
	var channel = params[0] ? uno.getChannelId(params[0], options) : options.channel;
	if (!channel || channel == options.user || channel[0] == 'D') {
		return [{ channel: options.user, text: 'Specify which channel, example: `uno cards #uno`.' }];
	}
	var game = uno.games[channel];
	if (!game) {
		return [{ channel: options.user, text: 'No active game in <#' + channel + '>.' }];
	}
	else {
		var response = uno.playerCardList(game,options.user)
		return response;
	}	
};
uno.commands.status = function(options, params) {
	options = options || {};
	var channel = params[0] ? uno.getChannelId(params[0], options) : options.channel || null;
	if (!channel || channel == options.user || channel[0] == 'D') {
		return [{ channel: options.user, text: 'Specify which channel, example: `uno status #uno`.' }];
	}
	var game = uno.games[channel];
	if (!game) {
		return ['No active game in <#' + channel + '>.', { channel: channel } ] ;
	}
	else {
		var cards_in_deck = game.deck.length;
		var cards_in_discard = game.discard.length;
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
		responses.push({ channel: channel, text:  "Cards in deck: " + cards_in_deck + "" });
		responses.push({ channel: channel, text:  "Cards in discard: " + cards_in_discard + "" });
		responses.push({ channel: channel, text:  "Started: " + (game.started ? 'Yes' : 'No') + "" });
		if (game.started) {
			if (game.turn) {
				responses.push({ channel: channel, text:  "Turn: <@" + game.players[game.turn] + ">" });
			}
			if (game.current_label) {
				var response = 'Active Card: ';
				if (game.current_color) {
					response += game.current_color + ' ';
				}
				response += game.current_label;
				responses.push({ channel: channel, text: response });
			}
		}
		var playable = uno.playerPlayableCards(options.user,game);
		responses.push({ channel: channel, text:  "Reversed: " + (game.reverse ? 'Yes' : 'No') + "" });
		return responses;
	}
}
uno.commands.play = function(options, params) {
	var channel = params[1] ? uno.getChannelId(params[1], options) : options.channel;
	if (!channel || channel == options.user || channel[0] == 'D') {
		return { channel: options.user, text: 'Specify which channel, example: `uno status #uno`.' };
	}
	var game = uno.games[channel];
	var play_number = params[0];
	if (!game) {
		return { channel: options.user, text: 'No active game in this channel.' };
	}
	if (game.players[game.turn] != options.user) {
		return { channel: options.user, text: 'Not your turn.' };
	}
	if (!play_number) {
		return { channel: options.user, text: 'Play which card (by number)?' };
	}
	if (!channel || channel == options.user || channel[0] == 'D') {
		return { channel: options.user, text: 'Specify which channel, example: `uno play (number) #uno`.' };
	}
	var playable = uno.playerPlayableCards(options.user,game);
	var hand = game.hands[options.user];
	var index = playable[play_number - 1];
	if (!hand[index]) {
		return { channel: options.user, text: 'Not one of your playable cards.  Please try again.' };
	}
	else {
		var result = uno.playCard(game, options.user, index);
		return result;
	}
};
// Returns array
uno.commands.draw = function(options, params) {
	var channel = params[0] ? uno.getChannelId(params[0], options) : options.channel;
	if (!channel || channel == options.user || channel[0] == 'D') {
		return { channel: options.user, text: 'Specify which channel, example: `uno draw #uno`.' };
	}
	var game = uno.games[channel];
	if (game.players[game.turn] != options.user) {
		return { channel: channel, text: 'Not your turn.' };
	}
	var responses = [];
	responses = responses.concat(uno.playerDraw(game, options.user, 1, true));
	return responses;
};
uno.commands.join = function(options, params) {
	var channel = params[0] ? uno.getChannelId(params[0], options) : options.channel;
	return uno.playerJoin(channel, options.user);
};
uno.commands.leave = function(options, params) {
	var channel = params[0] ? uno.getChannelId(params[0], options) : options.channel;
	return uno.playerLeave(channel, options.user);
};
uno.commands.start = function(options, params) {
	options = options || {};
	var channel = params[0] ? uno.getChannelId(params[0], options) : options.channel;
	uno.gameStart(channel,options.user);
	return { channel: channel, text: "Game started by <@" + options.user + ">" };
};

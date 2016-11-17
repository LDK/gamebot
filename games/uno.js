var uno = exports;

uno.games = {};
uno.game_counter = 0;
uno.debug = true;

uno.settings = {
	deal_per: 7
};

var fn={md5:function(){},each:function(a,b){if("object"!=typeof a||null===a)throw"each: Invalid object supplied.";if("function"!=typeof b)throw"each: Invalid row_callback function supplied.";if(a.constructor==Array)for(var c=0;c<a.length;c++)b.call(null,c,a[c]);else if(a.constructor==Object)for(var d in a)b.call(null,d,a[d]);return!0},isNumeric:function(a){return("number"==typeof a||"float"==typeof a||"decimal"==typeof a)&&!isNaN(a)},isObject:function(a){return!fn.empty(a)&&"object"==typeof a},empty:function(a){return"undefined"==typeof a||"null"==typeof a||null===a||""===a||a===!1},vcenter:function(a,b){if("undefined"==typeof b){var c=$(a).parent(),d=$(c).outerHeight(),e=$(a).outerHeight(),f=Math.floor((d-e)/2);$(a).css({top:f})}},strpos:function(a,b,c){var d=(a+"").indexOf(b,c||0);return d!==-1&&d},html_decode:function(a){var b=document.createElement("div");return b.innerHTML=a,b.firstChild.nodeValue},microtime:function(a){var b=(new Date).getTime()/1e3,c=parseInt(b,10);return a?b:Math.round(1e3*(b-c))/1e3+" "+c},generate_random_string:function(){return fn.generateRandomString(arguments)},addCommas:function(a){a+="",x=a.split("."),x1=x[0],x2=x.length>1?"."+x[1]:"";for(var b=/(\d+)(\d{3})/;b.test(x1);)x1=x1.replace(b,"$1,$2");return x1+x2},sec2time:function(a){var b="",c=Math.floor(a/60),d=a%60;if(d<10&&(d="0"+d),c>=60){var e=Math.floor(c/60);c%=60,c<10&&(c="0"+c),b=e+":"+c+":"+d}else b=c+":"+d;return b}};fn.number_format=function(a,b,c,d){a=(a+"").replace(/[^0-9+\-Ee.]/g,"");var e=isFinite(+a)?+a:0,f=isFinite(+b)?Math.abs(b):0,g="undefined"==typeof d?",":d,h="undefined"==typeof c?".":c,i="",j=function(a,b){var c=Math.pow(10,b);return""+Math.round(a*c)/c};return i=(f?j(e,f):""+Math.round(e)).split("."),i[0].length>3&&(i[0]=i[0].replace(/\B(?=(?:\d{3})+(?!\d))/g,g)),(i[1]||"").length<f&&(i[1]=i[1]||"",i[1]+=new Array(f-i[1].length+1).join("0")),i.join(h)},fn.getQueryStringParam=function(a,b){a=a.replace(/[\[]/,"\\[").replace(/[\]]/,"\\]");var c=new RegExp("[\\?&]"+a+"=([^&#]*)");if("undefined"!=typeof b&&b.length>0)var d=c.exec(b);else var d=c.exec(location.search);return null==d?"":decodeURIComponent(d[1].replace(/\+/g," "))},fn.trim=function(a,b){var c,d=0,e=0;for(a+="",b?(b+="",c=b.replace(/([\[\]\(\)\.\?\/\*\{\}\+\$\^\:])/g,"$1")):c=" \n\r\t\f\v            ​\u2028\u2029　",d=a.length,e=0;e<d;e++)if(c.indexOf(a.charAt(e))===-1){a=a.substring(e);break}for(d=a.length,e=d-1;e>=0;e--)if(c.indexOf(a.charAt(e))===-1){a=a.substring(0,e+1);break}return c.indexOf(a.charAt(0))===-1?a:""},fn.dater=function(a,b){return fn.date(a,fn.strtotime(b))},fn.inArray=function(a,b){return b.indexOf(a)!==-1},fn.max=function(a){return Math.max.apply(Math,a)},fn.gmdate=function(a,b){var c="undefined"==typeof b?new Date:"object"==typeof b?new Date(b):new Date(1e3*b);return b=Date.parse(c.toUTCString().slice(0,-4))/1e3,this.date(a,b)},fn.date=function(a,b){var d,e,g,f=/\\?([a-z])/gi,h=function(a,b){return(a+="").length<b?new Array(++b-a.length).join("0")+a:a},i=["Sun","Mon","Tues","Wednes","Thurs","Fri","Satur","January","February","March","April","May","June","July","August","September","October","November","December"];return g=function(a,b){return e[a]?e[a]():b},e={d:function(){return h(e.j(),2)},D:function(){return e.l().slice(0,3)},j:function(){return d.getDate()},l:function(){return i[e.w()]+"day"},N:function(){return e.w()||7},S:function(){var a=e.j();return a<4|a>20&&["st","nd","rd"][a%10-1]||"th"},w:function(){return d.getDay()},z:function(){var a=new Date(e.Y(),e.n()-1,e.j()),b=new Date(e.Y(),0,1);return Math.round((a-b)/864e5)+1},W:function(){var a=new Date(e.Y(),e.n()-1,e.j()-e.N()+3),b=new Date(a.getFullYear(),0,4);return h(1+Math.round((a-b)/864e5/7),2)},F:function(){return i[6+e.n()]},m:function(){return h(e.n(),2)},M:function(){return e.F().slice(0,3)},n:function(){return d.getMonth()+1},t:function(){return new Date(e.Y(),e.n(),0).getDate()},L:function(){var a=e.Y();return a%4===0&a%100!==0|a%400===0},o:function(){var a=e.n(),b=e.W(),c=e.Y();return c+(12===a&&b<9?1:1===a&&b>9?-1:0)},Y:function(){return d.getFullYear()},y:function(){return(e.Y()+"").slice(-2)},a:function(){return d.getHours()>11?"pm":"am"},A:function(){return e.a().toUpperCase()},B:function(){var a=3600*d.getUTCHours(),b=60*d.getUTCMinutes(),c=d.getUTCSeconds();return h(Math.floor((a+b+c+3600)/86.4)%1e3,3)},g:function(){return e.G()%12||12},G:function(){return d.getHours()},h:function(){return h(e.g(),2)},H:function(){return h(e.G(),2)},i:function(){return h(d.getMinutes(),2)},s:function(){return h(d.getSeconds(),2)},u:function(){return h(1e3*d.getMilliseconds(),6)},e:function(){throw"Not supported (see source code of date() for timezone on how to add support)"},I:function(){var a=new Date(e.Y(),0),b=Date.UTC(e.Y(),0),c=new Date(e.Y(),6),d=Date.UTC(e.Y(),6);return 0+(a-b!==c-d)},O:function(){var a=d.getTimezoneOffset(),b=Math.abs(a);return(a>0?"-":"+")+h(100*Math.floor(b/60)+b%60,4)},P:function(){var a=e.O();return a.substr(0,3)+":"+a.substr(3,2)},T:function(){return"UTC"},Z:function(){return 60*-d.getTimezoneOffset()},c:function(){return"Y-m-d\\TH:i:sP".replace(f,g)},r:function(){return"D, d M Y H:i:s O".replace(f,g)},U:function(){return d/1e3|0}},this.date=function(a,b){return d=null===b?new Date:b instanceof Date?new Date(b):new Date(1e3*b),a.replace(f,g)},this.date(a,b)},fn.getParamNames=function(a){var b=a.toString();return b.slice(b.indexOf("(")+1,b.indexOf(")")).match(/([^\s,]+)/g)},fn.strtotime=function(a,b){var c,d,e,f,g="";if(a=(a+"").replace(/\s{2,}|^\s|\s$/g," ").replace(/[\t\r\n]/g,""),"now"===a)return null===b||isNaN(b)?(new Date).getTime()/1e3|0:0|b;if(!isNaN(g=Date.parse(a)))return g/1e3|0;b=b?new Date(1e3*b):new Date,a=a.toLowerCase();var h={day:{sun:0,mon:1,tue:2,wed:3,thu:4,fri:5,sat:6},mon:["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"]},i=function(a){var c=a[2]&&"ago"===a[2],d=(d="last"===a[0]?-1:1)*(c?-1:1);switch(a[0]){case"last":case"next":switch(a[1].substring(0,3)){case"yea":b.setFullYear(b.getFullYear()+d);break;case"wee":b.setDate(b.getDate()+7*d);break;case"day":b.setDate(b.getDate()+d);break;case"hou":b.setHours(b.getHours()+d);break;case"min":b.setMinutes(b.getMinutes()+d);break;case"sec":b.setSeconds(b.getSeconds()+d);break;case"mon":if("month"===a[1]){b.setMonth(b.getMonth()+d);break}default:var e=h.day[a[1].substring(0,3)];if("undefined"!=typeof e){var f=e-b.getDay();0===f?f=7*d:f>0?"last"===a[0]&&(f-=7):"next"===a[0]&&(f+=7),b.setDate(b.getDate()+f),b.setHours(0,0,0,0)}}default:if(!/\d+/.test(a[0]))return!1;switch(d*=parseInt(a[0],10),a[1].substring(0,3)){case"yea":b.setFullYear(b.getFullYear()+d);break;case"mon":b.setMonth(b.getMonth()+d);break;case"wee":b.setDate(b.getDate()+7*d);break;case"day":b.setDate(b.getDate()+d);break;case"hou":b.setHours(b.getHours()+d);break;case"min":b.setMinutes(b.getMinutes()+d);break;case"sec":b.setSeconds(b.getSeconds()+d)}}return!0};if(e=a.match(/^(\d{2,4}-\d{2}-\d{2})(?:\s(\d{1,2}:\d{2}(:\d{2})?)?(?:\.(\d+))?)?$/),null!==e)return e[2]?e[3]||(e[2]+=":00"):e[2]="00:00:00",f=e[1].split(/-/g),f[1]=h.mon[f[1]-1]||f[1],f[0]=+f[0],f[0]=f[0]>=0&&f[0]<=69?"20"+(f[0]<10?"0"+f[0]:f[0]+""):f[0]>=70&&f[0]<=99?"19"+f[0]:f[0]+"",parseInt(this.strtotime(f[2]+" "+f[1]+" "+f[0]+" "+e[2])+(e[4]?e[4]/1e3:""),10);var j="([+-]?\\d+\\s(years?|months?|weeks?|days?|hours?|min|minutes?|sec|seconds?|sun\\.?|sunday|mon\\.?|monday|tue\\.?|tuesday|wed\\.?|wednesday|thu\\.?|thursday|fri\\.?|friday|sat\\.?|saturday)|(last|next)\\s(years?|months?|weeks?|days?|hours?|min|minutes?|sec|seconds?|sun\\.?|sunday|mon\\.?|monday|tue\\.?|tuesday|wed\\.?|wednesday|thu\\.?|thursday|fri\\.?|friday|sat\\.?|saturday))(\\sago)?";if(e=a.match(new RegExp(j,"gi")),null===e)return!1;for(c=0,d=e.length;c<d;c++)if(!i(e[c].split(" ")))return!1;return b.getTime()/1e3|0},fn.array_chunk=function(a,b,c){var d,e="",f=0,g=-1,h=a.length||0,i=[];if(b<1)return null;if("[object Array]"===Object.prototype.toString.call(a))if(c)for(;f<h;)(d=f%b)?i[g][f]=a[f]:i[++g]={},i[g][f]=a[f],f++;else for(;f<h;)(d=f%b)?i[g][d]=a[f]:i[++g]=[a[f]],f++;else if(c)for(e in a)a.hasOwnProperty(e)&&((d=f%b)?i[g][e]=a[e]:i[++g]={},i[g][e]=a[e],f++);else for(e in a)a.hasOwnProperty(e)&&((d=f%b)?i[g][d]=a[e]:i[++g]=[a[e]],f++);return i},fn.nFormatter=function(a,b){return null===a||_.isUndefined(a)?null:(_.isNumber(a)||(a=Number(a.replace(/[^\d.]/g,""))),a>=1e9?(b=b?"B":"",(a/1e9).toFixed(1).replace(/\.0$/,"")+b):a>=1e6?(b=b?"M":"",(a/1e6).toFixed(1).replace(/\.0$/,"")+b):a>=1e3?(b=b?"K":"",(a/1e3).toFixed(1).replace(/\.0$/,"")+b):a)},fn.convertHexToRGB=function(a){function b(a){return parseInt(e(a).substring(0,2),16)}function c(a){return parseInt(e(a).substring(2,4),16)}function d(a){return parseInt(e(a).substring(4,6),16)}function e(a){return"#"==a.charAt(0)?a.substring(1,7):a}return R=b(a),G=c(a),B=d(a),R+", "+G+", "+B},fn.converRgbToHex=function(a){function c(a){return a=parseInt(a,10),isNaN(a)?"00":(a=Math.max(0,Math.min(a,255)),"0123456789ABCDEF".charAt((a-a%16)/16)+"0123456789ABCDEF".charAt(a%16))}var b=a.split(",");return c(b[0])+c(b[1])+c(b[2])},fn.RGBToHex=function(a,b,c){function d(a){return a=parseInt(a,10),isNaN(a)?"00":(a=Math.max(0,Math.min(a,255)),"0123456789ABCDEF".charAt((a-a%16)/16)+"0123456789ABCDEF".charAt(a%16))}return d(a)+d(b)+d(c)},fn.wordwrap=function(a,b,c,d){if(c=c||"\n",b=b||75,d=d||!1,!a)return a;var e=".{1,"+b+"}(\\s|$)"+(d?"|.{"+b+"}|.+$":"|\\S+?(\\s|$)");return a.match(RegExp(e,"g")).join(c)},fn.nl2br=function(a,b){var c=b||"undefined"==typeof b?"<br />":"<br>";return(a+"").replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g,"$1"+c+"$2")},fn.entities=function(a){var b=$("<div />"),c="";return b.text(a),c=b.html(),c=c.replace(/'/g,"&rsquo;").replace(/"/g,"&rdquo;")},"undefined"!=typeof Url&&(fn.current_url=new Url);

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
	fn.each(hand,function(index,card){ //hehe
		if (card.wild) {
			// We will set aside the wilds for the moment.
			wilds.push(index);
		}
		else if (card.color == color || card.label == label) {
			// A card in the player's hand matches the active color, or matches the label.
			playable.push(index);
		}
	});
	if (playable.length == 0 && wilds.length > 0) {
		// We have no normal playable cards, but we have wilds!
		return wilds;
	}
	return playable;
};

// Returns a comma separated string of cards.
uno.cardList = function (stack, options) {
	options = options || {};
	if (!stack.length) {
		return 'No cards.';
	}
	var result = '';
	var numerator = 0;
	for (var i = 0; i < stack.length; i++) {
		if (!options.indexes || fn.inArray(i,options.indexes)) {
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
	if (uno.games[channel]) {
		return 'There is already a game in <#' + channel + '>';
	}
	uno.game_counter++;
	uno.games[channel] = {
		id: uno.game_counter,
		channel: channel,
		created: (Date.now() / 1000 | 0),
		creator: creator,
		deck: uno.initDeck(),
		discard: [],
		players: [creator],
		hands: {},
		points: {},
		started: false,
		current_color: null,
		current_label: null,
		reverse: false,
		wild_active: false,
		wild_skip: false,
		turn: null
	};
	uno.games[channel].hands[creator] = [];
	uno.games[channel].points[creator] = 0;
	shuffle(uno.games[channel].deck);
	return 'Started a game in <#' + channel + '>';
}

uno.addPlayer = function(channel, user) {
	if (!uno.games[channel]) {
		return false;
	}
	uno.games[channel].players.push(user);
	return true;
}

// Returns array
uno.playerLeave = function(message, channel) {
	var channel = channel || message.channel;
	var user = message.user;
	var responses = [];
	if (!uno.games[channel]) {
		return false;
	}
	var game = uno.games[channel];
	for (var i=0; i < game.players.length; i++) {
		if (game.players[i] == user) {
			game.players.splice(i, 1);
			responses.push({ channel: channel, text: '<@' + user + '> has left the game.' });
		}
	}
	// Check for last-player-standing scenario.
	if (game.started && game.players.length < 2) {
		responses.push({ channel: channel, text: uno.gameDeclareWinner(game,game.players[0]) });
	}
	return responses;
}

// Returns array
uno.playerJoin = function(channel, player) {
	var game = uno.games[channel];
	var responses = [];
	if (!game) {
		responses.push({ channel: player, text: 'No game in <#' + channel + '>.' });
	}
	if (game.started) {
		responses.push({ channel: player, text: 'Game has already begun play.' });
	}
	for (var i=0; i < game.players.length; i++) {
		if (game.players[i] == player) {
			return false;
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
	if (fn.inArray(color.toLowerCase(),['blue','yellow','red','green'])) {
		game.current_color = ucfirst(color.toLowerCase());
		game.wild_active = false;
	}
	return 'The new active color is '+game.current_color+'.';
}
uno.endGame = function(game,message) {
	if (game.channel) {
		uno.games[game.channel] = null;
		return message;
	}
};
uno.gameDeclareWinner = function(game, player) {
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
		responses.push({ channel: game.channel, text: "<@" + game.players[game.turn] + ">, Set the color by typing `uno color (color)`, example: `uno color blue`." });
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
	fn.each(game.players,function(key,player){
		for (var i = 1; i <= uno.settings.deal_per; i++) {
			var card = deck.pop();
			game.hands[player].push(card);
		}
	});
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
	if (!game || !player || !index) {
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
		responses.push({ channel: game.channel, text: uno.gameDeclareWinner(game, player) });
	}
	responses = responses.concat(uno.nextTurn(game,skip,draw));
	return responses;
}

uno.getChannelId = function(channel, options) {
	if (!channel) {
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
	if (!channel) {
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
	if (uno.commands[cmd]) {
		return uno.commands[cmd](options, params);
	}
};


/**
	THE COMMANDS OBJECT
	Each property of this object is a function that takes an options array (likely a slack message)
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
	console.log('deal command',responses);
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
		return uno.playerCardList(game,options.user);
	}	
};
uno.commands.status = function(options, params) {
	var channel = params[0] ? uno.getChannelId(params[0], options) : options.channel;
	if (!channel || channel == options.user || channel[0] == 'D') {
		return { channel: options.user, text: 'Specify which channel, example: `uno status #uno`.' };
	}
	var game = uno.games[channel];
	if (!game) {
		return 'No active game in <#' + channel + '>.';
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
		console.log('play command',result);
		return result;
	}
};
uno.commands.discard = function(options, params) {
	var game = uno.games[options.channel];
	return (JSON.stringify(game.discard));
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
uno.commands.gameJSON = function(options, params) {
	if (!uno.games[options.channel]) {
		return false;
	}
	else {
		return (JSON.stringify(uno.games[options.channel]));
	}
};
uno.commands.start = function(options, params) {
	var channel = params[0] ? uno.getChannelId(params[0], options) : options.channel;
	uno.gameStart(channel,options.user);
	return { channel: channel, text: "Game started by <@" + options.user + ">" };
};


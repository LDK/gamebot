/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

This is a game bot built by Daniel Swinney with Botkit.

# RUN THE BOT:

  Get a Bot token from Slack:

    -> http://my.slack.com/services/new/bot

  Run your bot from the command line:

    token=<MY TOKEN> node slack_bot.js

# USE THE BOT:

# BOTKIT:

  This bot was created with Botkit, using this as a starting point:
	https://github.com/howdyai/botkit/blob/master/slack_bot.js

  Botkit has many features for building cool and useful bots!

  Read all about it here:

    -> http://howdy.ai/botkit

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

if (!process.env.token) {
    console.log('Error: Specify token in environment');
    process.exit(1);
}

var Botkit = require('./lib/Botkit.js');
var os = require('os');

var controller = Botkit.slackbot({
  json_file_store: 'storage.json'
});

var fullTeamList = [];
var fullChannelList = [];

var bot = controller.spawn({
    token: process.env.token
}).startRTM(function (err, bot) {
    if (err) {
        throw new Error(err);
    }

    // @ https://api.slack.com/methods/users.list
    bot.api.users.list({}, function (err, response) {
        if (response.hasOwnProperty('members') && response.ok) {
            var total = response.members.length;
            for (var i = 0; i < total; i++) {
                var member = response.members[i];
                fullTeamList.push({name: member.name, id: member.id});
            }
        }
    });

    // @ https://api.slack.com/methods/channels.list
    bot.api.channels.list({}, function (err, response) {
        if (response.hasOwnProperty('channels') && response.ok) {
            var total = response.channels.length;
            for (var i = 0; i < total; i++) {
                var channel = response.channels[i];
                fullChannelList.push({name: channel.name, id: channel.id});
            }
        }
    });
});

// For every entry in this array, there must be a game in node module format at a corresponding filename.
// Example, if bot_games == ['go_fish','hearts'], there must be files called go_fish.js and hearts.js
// The modules contained in those files are registered as properties of the controller.
var bot_games = ['uno'];

for (var i = 0; i < bot_games.length; i++) {
	controller[bot_games[i]] = require('./games/'+bot_games[i]+'.js');
	controller[bot_games[i]].users = fullTeamList;
	controller[bot_games[i]].channels = fullChannelList;
}

// This listens for the name of one of the registered games, followed by a command and any params.
// It then sends that command to the module's command processing function and states the response in channel.
// TODO: allow these to be private messages.

controller.hears(bot_games, 'ambient,direct_message,direct_mention,mention', function(bot, message) {
	var request = message.text.split(' ');
	var bot_game = request[0];
	var command = request[1];
	var params = [];
	var channel = message.channel;
	for (var i = 2; i < request.length; i++) {
		params.push(request[i]);
	}
	var cmd_result = this[bot_game].command(command, message, params);
	if (cmd_result && cmd_result.constructor != Array) {
		cmd_result = [cmd_result];
	}
	else if (!cmd_result) {
		cmd_result = [];
		console.log('No result',command,message,params);
	}
	console.log('cmd result',cmd_result);
	var responses = {};
	for (var i = 0; i < cmd_result.length; i++) {
		var res = cmd_result[i];
		var response = '';
		var message_channel = channel;
		if (typeof res == 'string') {
			response = res;
		}
		else if (typeof res == 'object') {
			message_channel = res.channel || channel;
			if (res.text) {
				response = res.text;
				console.log('response',response);
			}
		}
		else {
			console.log('wtf is',res);
		}
		if (!responses[message_channel]) {
			responses[message_channel] = [];
		}
		responses[message_channel].push(response);
	}
	for (var channel in responses) {
		if (responses.hasOwnProperty(channel)) {
			console.log('Sending '+responses[channel].length+' joined responses to ',channel, responses[channel]);
			bot.say({ channel: channel, text: responses[channel].join("\n") });
		}
	}
});

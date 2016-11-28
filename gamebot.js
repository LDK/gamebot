var md5 = require('md5');
var async = require('async');
var sqlite3 = require('sqlite3').verbose();
var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');

var restapi = express();
restapi.use(bodyParser.json());
restapi.use(bodyParser.urlencoded({ extended: true })); 
restapi.use(express.static('public'));

var games = ['uno','skipbo'];

for (var i = 0; i < games.length; i++) {
	restapi[games[i]] = require('./games/'+games[i]+'.js');
	restapi[games[i]].users = [];
	restapi[games[i]].channels = [];
}

restapi.game = 'uno';

var db = new sqlite3.Database('data/'+restapi.game);

restapi.replaceUsernames = function(text) {
	var re = /(<@(.*?)>)/gi;
	var usernames = text.match(re);
	if (usernames) {
		_.each(usernames,function(username,key){
			username = username.replace('<@','').replace('>','');
			if (restapi.userLookup[username]) {
				text = text.replace('<@' + username + '>', restapi.userLookup[username].display);
			}
		});
	}
	return text;
}

String.prototype.replaceAll = function(search, replace)
{
    //if replace is not sent, return original string otherwise it will
    //replace search string with 'undefined'.
    if (replace === undefined) {
        return this.toString();
    }

    return this.replace(new RegExp('[' + search + ']', 'g'), replace);
};

db.serialize(function() {
	db.run(`
		CREATE TABLE IF NOT EXISTS  'channels' (
			'id'	INTEGER PRIMARY KEY AUTOINCREMENT,
			'name'	TEXT NOT NULL UNIQUE,
			'display'	TEXT DEFAULT NULL UNIQUE,
			'type'	TEXT DEFAULT 'channel',
			'extra'	TEXT NOT NULL DEFAULT '{}'
		);
	`);
	db.run(`
		CREATE TABLE IF NOT EXISTS 'users' (
			'id'	INTEGER PRIMARY KEY AUTOINCREMENT,
			'username'	TEXT NOT NULL,
			'password'	TEXT NOT NULL,
			'display'	TEXT DEFAULT NULL
		);
	`);
	db.run(`
		CREATE TABLE IF NOT EXISTS  'messages' (
			'id'	INTEGER PRIMARY KEY AUTOINCREMENT,
			'channel'	TEXT DEFAULT NULL,
			'channel_type'	TEXT DEFAULT NULL,
			'text'	TEXT DEFAULT NULL,
			'extra'	TEXT NOT NULL DEFAULT '{}',
			'ts'	NUMERIC DEFAULT NULL,
			FOREIGN KEY('channel') REFERENCES channels(name),
			FOREIGN KEY('channel_type') REFERENCES channels(type),
			FOREIGN KEY('user') REFERENCES users(username)
		);
	`);
	restapi.userLookup = {};
	db.each("SELECT username, display FROM users", 
		function(err, user){
			restapi[restapi.game].users.push(user.username);
			restapi.userLookup[user.username] = user;
		},
		function(err, cntx){
	        if (err) return err;
		}
	);
	db.each("SELECT name FROM channels", 
		function(err, channel){
			restapi[restapi.game].channels.push({ id: channel.name, name: channel.display });
		},
		function(err, cntx){
	        if (err) return err;
		}
	);
});

restapi.post('/command/:command', function(req, res){
	var command = req.params.command;
	var options = req.body.source;
	var params = req.body.params || [];
	var username = req.body.user || null;
	var cmd_result = restapi[restapi.game].command(command, options, params);
	var messages = cmd_result.messages;
	var game_state = cmd_result.game_state;
	var response = {};
	if (game_state) {
		response.game_state = game_state || null;
	}
	response.messages = messages;
	if (cmd_result.data && cmd_result.type) {
		response[cmd_result.type] = cmd_result.data;
	}
	res.json(response);
});


restapi.get('/users', function(req, res){
	var users = {};
	db.each(`
		SELECT id, username, display FROM users
	`,
	    function (err, row) {
	        if (err) return err;
			users[row.username] = row;
	    },
	    function (err, cntx) {
	        if (err) return err;
			res.json(users);
	    }
	);
});

restapi.post('/users', function(req, res){
	var users = {};
	var usernames = req.body.usernames;
	if (!usernames || typeof(usernames) == 'undefined' || !usernames.length) {
		res.json([]);
		return;
	}
	var in_string = "'" + usernames.join("','") + "'";
	var query = 'SELECT id, username, display FROM users WHERE username IN (' + in_string + ')';
	db.each(query,
	    function (err, row) {
	        if (err) return err;
			users[row.username] = row;
	    },
	    function (err, cntx) {
	        if (err) return err;
			res.json(users);
	    }
	);
});

restapi.get('/user/:username', function(req, res){
	db.get("SELECT id, username, display FROM users WHERE username = '" + req.params.username + "'", function(err, row){
		res.json(row);
	});
});

restapi.get('/channel/:channelName', function(req, res){
	var query = "SELECT id, name, display FROM channels WHERE name = '" + req.params.channelName + "'";
	db.get(query, function(err, row){
		res.json(row);
	});
});


restapi.get('/channels', function(req, res){
	var rows = [];
	db.each(`
		SELECT id, name, display FROM channels WHERE type = 'channel'
	`,
	    function (err, row) {
	        if (err) return err;
			rows.push(row);
	    },
	    function (err, cntx) {
	        if (err) return err;
			res.json(rows);
	    }
	);
});

restapi.get('/channel/:channelName', function(req, res){
	var query = "SELECT id, name, display FROM channels WHERE name = '" + req.params.channelName + "'";
	db.get(query, function(err, row){
		res.json(row);
	});
});

restapi.get('/messages/:channel', function(req, res){
	var query = 'SELECT id, text, ts FROM messages WHERE channel = "' + req.params.channel + '" ORDER BY id asc';
	var messages = [];
	db.each(query, 
		function(err, message){
			message.text = restapi.replaceUsernames(message.text);
			messages.push(message);
		},
		function(err, cntx){
	        if (err) return err;
			res.json(messages);
		}
	);
});

restapi.post('/messages/:channel', function(req, res){
	var text = restapi.replaceUsernames(req.body.text);
	var query = `
		INSERT INTO messages (channel, channel_type, text)
		VALUES ('` + req.params.channel + `', 'channel', "` + text + `");
	`;
	db.run(query, function(err, row){
        if (err){
            console.log('messages/:channel',err);
            res.status(500);
        }
        else {
            res.status(202);
        }
        res.end();
	})
});

restapi.post('/messages', function(req, res){
	if (req.body.messages && req.body.messages.length) {
		for (var i in req.body.messages) {
			var message = req.body.messages[i];
			if (!message.channel || !message.text) {
				console.log('breaking on',message);
				break;
			}
			var text = restapi.replaceUsernames(message.text);
			var query = `
				INSERT INTO messages (channel, channel_type, text)
				VALUES ('` + message.channel + `', 'channel', "` + text + `");
			`;
			db.run(query, function(err, row){
		        if (err){
		            console.log('/messages',err);
		            res.status(500);
		        }
		        else {
		            res.status(202);
		        }
		        res.end();
			})
		}
	}
});

restapi.post('/login', function(req, res) {
	var query = "SELECT id, username, display FROM users WHERE display = '" + req.body.username + "' and password = '" + req.body.password + "'";
	db.get(query, function(err, row){
		res.json(row);
	});
});

restapi.post('/register', function(req, res) {
	function guid() {
	  function s4() {
	    return Math.floor((1 + Math.random()) * 0x10000)
	      .toString(16)
	      .substring(1);
	  }
	  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
	    s4() + '-' + s4() + s4() + s4();
	};
	
	var query = "INSERT INTO users (username, display, password) VALUES((SELECT 'U' || (MAX(id) + 1) FROM users), '" + req.body.username + "', '"+ req.body.password +"')";

	db.run(query, function(err, row) {
		if (err) {
			console.log('ERROR',query,err);
			res.json(err);
		}
		var user_query = "SELECT id, username, display FROM users WHERE display = '" + req.body.username + "' and password = '" + req.body.password + "'";
		db.get(user_query, function(err, user){
			if (err) {
				console.log('ERROR',query,err);
				res.json(err);
			}
			restapi.userLookup[user.username] = user;
			res.json(user);
		});
	});
});

var listenPort = 3000;
restapi.listen(listenPort);

console.log("GameBot server running on port "+listenPort+".");

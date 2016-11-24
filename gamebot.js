var md5 = require('md5');
var async = require('async');
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('data/uno');
var express = require('express');
var bodyParser = require('body-parser');

var uno = require('./uno.js');

var restapi = express();
restapi.use(bodyParser.json());
restapi.use(bodyParser.urlencoded({ extended: true })); 
restapi.use(express.static('public'));

db.serialize(function() {
	// db.run(`
	// 	CREATE TABLE 'users' ( 'id' INTEGER PRIMARY KEY AUTOINCREMENT, 'username' TEXT NOT NULL, 'password' TEXT NOT NULL, 'display' TEXT DEFAULT NULL )
	// `);
	// db.run(`
	// 	CREATE TABLE "channels" ( `id` INTEGER PRIMARY KEY AUTOINCREMENT, `name` TEXT NOT NULL UNIQUE, `display` TEXT DEFAULT NULL UNIQUE, `type` TEXT DEFAULT 'channel', `extra` TEXT NOT NULL DEFAULT '{}' )
	// `);
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
		CREATE TABLE IF NOT EXISTS 'game_decks' ( 
			'channel' TEXT NOT NULL, 
			'cards' TEXT DEFAULT '[]', 
			'deck_type' TEXT DEFAULT 'deck', 
			'username' TEXT DEFAULT NULL, 
			FOREIGN KEY('channel') REFERENCES channel(name) 
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
		CREATE TABLE IF NOT EXISTS 'games' ( 
			'id' INTEGER PRIMARY KEY AUTOINCREMENT, 
			'channel' TEXT NOT NULL, 
			'creator' TEXT DEFAULT NULL, 
			'created' NUMERIC DEFAULT NULL, 
			'started' NUMERIC DEFAULT 0, 
			'turn' INTEGER DEFAULT NULL, 
			'winner' TEXT DEFAULT NULL, 
			'current_color' TEXT DEFAULT NULL, 
			'current_label' TEXT DEFAULT NULL, 
			'reverse' NUMERIC DEFAULT 0, 
			'wild_active' NUMERIC DEFAULT 0, 
			'wild_skip' NUMERIC DEFAULT 0, 
			FOREIGN KEY('channel') REFERENCES 'channels'('name'), 
			FOREIGN KEY('creator') REFERENCES 'users'('username'), 
			FOREIGN KEY('winner') REFERENCES 'users'('username') 
		);
	`);
	db.run(`
		CREATE TABLE IF NOT EXISTS  'messages' (
			'id'	INTEGER PRIMARY KEY AUTOINCREMENT,
			'channel'	TEXT DEFAULT NULL,
			'channel_type'	TEXT DEFAULT NULL,
			'user'	TEXT DEFAULT NULL,
			'text'	TEXT DEFAULT NULL,
			'extra'	TEXT NOT NULL DEFAULT '{}',
			'ts'	NUMERIC DEFAULT NULL,
			FOREIGN KEY('channel') REFERENCES channels(name),
			FOREIGN KEY('channel_type') REFERENCES channels(type),
			FOREIGN KEY('user') REFERENCES users(username)
		);
	`);
	db.run(`
		CREATE TABLE IF NOT EXISTS 'game_players' (
			'game_id'	INTEGER NOT NULL,
			'username'	TEXT NOT NULL,
			'position'	INTEGER DEFAULT 0,
			'points'	INTEGER DEFAULT 0,
			PRIMARY KEY('game_id','username'),
			FOREIGN KEY('game_id') REFERENCES games(id),
			FOREIGN KEY('username') REFERENCES users(username)
		);
	`);
	uno.users = [];
	uno.channels = [];
	db.each("SELECT username FROM users", 
		function(err, user){
			uno.users.push(user.username);
		},
		function(err, cntx){
	        if (err) return err;
		}
	);
	db.each("SELECT name FROM channels", 
		function(err, channel){
			uno.channels.push({ id: channel.name, name: channel.display });
		},
		function(err, cntx){
	        if (err) return err;
		}
	);
});

restapi.get('/games', function(req, res){
	var rows = [];
	db.each(`
		SELECT games.id, games.channel, channel.display as channel_name, creator.display as creator_name, winner.display as winner_name
		FROM games 
		INNER JOIN channels channel
		ON games.channel = channel.name
		LEFT JOIN users creator
		ON games.creator = creator.username
		LEFT JOIN users winner
		ON games.winner = winner.username
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

restapi.get('/game/:channel', function(req, res){
	var query = "SELECT * FROM games WHERE channel = '" + req.params.channel + "'";
	db.get(query, function(err, row){
		if (!row) {
			return;
		}
		var players = [];
		var query = `
			SELECT player.username, player.display, game_players.points, game_players.position
			FROM games 
			INNER JOIN game_players
				ON games.id = game_players.game_id
			INNER JOIN users player
				ON player.username = game_players.username
			WHERE games.channel = '`+ req.params.channel +`'
			AND games.winner IS NULL
			ORDER BY game_players.position ASC;
		`;
		console.log('query',query);
		db.each(query,
			function(err, player){
		        if (err) return err;
				players.push(player);
			},
			function(err, cntx){
		        if (err) return err;
				row.players = players;
				res.json(row);
			});
	});
});

restapi.post('/command/:command', function(req, res){
	var command = req.params.command;
	var options = req.body.source;
	var params = req.body.params || [];
	var username = req.body.user || null;
	var cmd_result = uno.command(command, options, params);
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
	if (!usernames || !usernames.length) {
		res.json([]);
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
			messages.push(message);
		},
		function(err, cntx){
	        if (err) return err;
			res.json(messages);
		}
	);
});

restapi.post('/messages/:channel', function(req, res){
	var query = `
		INSERT INTO messages (channel, channel_type, user, text)
		VALUES ('` + req.params.channel + `', 'channel', '`+ req.body.user +`', "` + req.body.text + `");
	`;
	db.run(query, function(err, row){
        if (err){
            console.log(err);
            res.status(500);
        }
        else {
            res.status(202);
        }
        res.end();
	})
});

restapi.post('/messages', function(req, res){
	console.log('MESSAGES POST BODY',req.body);
	if (req.body.messages && req.body.messages.length) {
		for (var i in req.body.messages) {
			var message = req.body.messages[i];
			if (!message.channel || !message.text) {
				console.log('breaking on',message);
				break;
			}
			var query = `
				INSERT INTO messages (channel, channel_type, user, text)
				VALUES ('` + message.channel + `', 'channel', '`+ message.user +`', "` + message.text + `");
			`;
			console.log('message insert query',query);
			db.run(query, function(err, row){
		        if (err){
		            console.log(err);
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

restapi.post('/data', function(req, res){
    db.run("UPDATE counts SET value = value + 1 WHERE key = ?", "counter", function(err, row){
        if (err){
            console.log(err);
            res.status(500);
        }
        else {
            res.status(202);
        }
        res.end();
    });
});

restapi.post('/login', function(req, res) {
	var query = "SELECT id, username, display FROM users WHERE display = '" + req.body.username + "' and password = '" + req.body.password + "'";
	console.log('query',query);
	db.get(query, function(err, row){
		res.json(row);
	});
});

restapi.listen(3000);

console.log("Submit GET or POST to http://localhost:3000/data");

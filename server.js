var md5 = require('md5');
var async = require('async');
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('data/uno');
var express = require('express');
var bodyParser = require('body-parser');

var uno = require('./uno.js');

var restapi = express();
restapi.use(express.static('public'));
restapi.use('/',express.static('public'));
restapi.use(bodyParser.json());
restapi.use(function (req, res, next) {
	console.log(req.body) // populated!
	next();
});

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
		CREATE TABLE IF NOT EXISTS  'users' (
			'id'	INTEGER PRIMARY KEY AUTOINCREMENT,
			'username'	TEXT NOT NULL,
			'password'	TEXT NOT NULL,
			'display'	TEXT DEFAULT NULL
		);
	`);
	db.run(`
		CREATE TABLE IF NOT EXISTS  'games' (
			'id'	INTEGER PRIMARY KEY AUTOINCREMENT,
			'channel'	TEXT NOT NULL,
			'creator'	TEXT DEFAULT NULL,
			'started'	NUMERIC DEFAULT 0,
			'winner'	TEXT DEFAULT NULL,
			'game_data'	TEXT NOT NULL DEFAULT '{}',
			FOREIGN KEY('channel') REFERENCES channels(name),
			FOREIGN KEY('creator') REFERENCES users(username),
			FOREIGN KEY('winner') REFERENCES users(username)
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
	db.get("SELECT id, channel, creator, started, winner, game_data FROM games WHERE channel = '" + req.params.channel + "'", function(err, row){
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
		db.each(query,
			function(err, player){
		        if (err) return err;
				console.log('row',row);
				console.log('pl',player);
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
	console.log('REQ',req.body);
	var command = req.params.command;
	var options = req.body.source;
	var params = req.body.params || [];
	var cmd_result = uno.command(command, options, params);
	console.log('cmd_result',cmd_result);
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

restapi.get('/channel/:channelId', function(req, res){
	db.get("SELECT id, name, display FROM channels WHERE id = " + req.params.channelId, function(err, row){
		res.json(row);
	});
});

restapi.get('/messages/:channel', function(req, res){
	db.get("SELECT id, text, ts FROM messages WHERE channel = " + req.params.channel, function(err, row){
		res.json(row);
	});
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


restapi.listen(3000);

console.log("Submit GET or POST to http://localhost:3000/data");

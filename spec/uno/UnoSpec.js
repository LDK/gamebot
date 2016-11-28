describe('Uno', function() {
	var uno = require('../../games/uno');

	it("should contain a games object", function() {
		expect(uno.games).toEqual(jasmine.any(Object));
	});

	beforeEach(function() {
		uno.games = {};
	});
	
	it("should contain a settings object", function() {
		expect(uno.settings).toEqual(jasmine.any(Object));
	});

	it("should contain a commands object", function() {
		expect(uno.commands).toEqual(jasmine.any(Object));
	});

	it("should be able to initialize a deck of cards", function() {
		var deck = uno.initDeck();
		expect(deck).toEqual(jasmine.any(Object));
		expect(deck.length).toEqual(108);
	});

	it("should be able to start a game", function(){
		uno.gameStart('CFake','UFake');
		expect(uno.games['CFake']).toBeDefined();
		expect(uno.games['CFake'].creator).toEqual('UFake');
		expect(uno.games['CFake'].started).toEqual(false);
	});

	it("should be able to start a game via command message", function(){
		uno.command('start', { channel: 'CFake', user: 'UFake' });
		expect(uno.games['CFake']).toBeDefined();
		expect(uno.games['CFake'].creator).toEqual('UFake');
		expect(uno.games['CFake'].started).toEqual(false);
	});

	describe('when game has been created', function(){

		beforeEach(function() {
			uno.games = {};
			uno.gameStart('CFake','UFake');
		});

		it("should have only one player, the game creator", function(){
			expect(uno.games['CFake'].players.length).toEqual(1);
			expect(uno.games['CFake'].players[0]).toEqual('UFake');
		});

		it("should be able to add a player via join command", function(){
			uno.command('join', { channel: 'CFake', user: 'UAlsoFake' });
			expect(uno.games['CFake'].players.length).toEqual(2);
			expect(uno.games['CFake'].players[1]).toEqual('UAlsoFake');
		});

		it("should be able to deal cards via command message", function(){
			uno.command('join', { channel: 'CFake', user: 'UAlsoFake' });
			uno.command('deal', { channel: 'CFake', user: 'UFake' });
			for (var player in uno.games['CFake'].players) {
				// Each player should be accounted for with 7 cards in the game's hands object.
				var username = uno.games['CFake'].players[player];
				var hand = uno.games['CFake'].hands[username];
				expect(hand).toEqual(jasmine.any(Object));
				expect(hand.length).toEqual(7);
			}
		});
		
		it("should be possible to leave the game", function(){
			var result = uno.command('leave', { channel: 'CFake', user: 'UFake' });
			expect(uno.games['CFake'].players.length).toEqual(0);
		});

		it("should cancel the game if the creator leaves before anyone else joins", function(){
			var result = uno.command('leave', { channel: 'CFake', user: 'UFake' });
			expect(uno.games['CFake'].active).toEqual(false);
			expect(uno.games['CFake'].started).toEqual(false);
		});
	});
	
	describe('when cards have been dealt', function(){
		beforeEach(function() {
			uno.games = {};
			uno.gameStart('CFake','UFake');
			uno.command('join', { channel: 'CFake', user: 'UAlsoFake' });
			uno.command('deal', { channel: 'CFake', user: 'UFake' });
		});
		it("should not be possible to join the game", function(){
			uno.command('join', { channel: 'CFake', user: 'UAnotherFake' });
			expect(uno.games['CFake'].players.length).toEqual(2);
			expect(uno.games['CFake'].players[2]).toBeUndefined();
		});
		it("should be possible to leave the game", function(){
			var result = uno.command('leave', { channel: 'CFake', user: 'UAlsoFake' });
			expect(uno.games['CFake'].players.length).toEqual(1);
			expect(uno.games['CFake'].players[0]).toEqual('UFake');
		});
		it("should be someone's turn", function(){
			expect(uno.games['CFake'].turn).toBeDefined();
			expect(uno.games['CFake'].players[uno.games['CFake'].turn]).toEqual(jasmine.any(String));
		});
		it("should be possible to get a list of your cards", function(){
			expect(uno.games['CFake'].hands).toBeDefined();
			expect(uno.games['CFake'].hands[uno.games['CFake'].players[uno.games['CFake'].turn]]).toEqual(jasmine.any(Array));
			var response = uno.command('cards', { channel: 'CFake', user: 'UAlsoFake' });
			expect(response.data).toBeDefined();
			expect(response.data).toEqual(jasmine.any(Object));
			expect(response.game_state).toBeDefined();
			expect(response.game_state).toEqual(jasmine.any(Object));
		});
	});
	
	describe("when it's your turn", function(){
		beforeEach(function(){
			uno.games = {};
			uno.gameStart('CFake','UFake');
			uno.command('join', { channel: 'CFake', user: 'UAlsoFake' });
			uno.command('deal', { channel: 'CFake', user: 'UFake' });
			uno.games['CFake'].turn = 1;
		});
		it('should be possible to fetch the player whose turn it is',function(){
			var player = uno.games['CFake'].players[uno.games['CFake'].turn];
			expect(player).toEqual(jasmine.any(String));
		});
		it('should be possible to get a list of your playable cards',function(){
			var game = uno.games['CFake']
			var player = game.players[game.turn];
			var playable = uno.playerPlayableCards(player,game);
			expect(playable).toEqual(jasmine.any(Array));
		});
		it('should be possible to draw a card',function(){
			var game = uno.games['CFake']
			var player = game.players[game.turn];
			var starting_count = parseInt(game.hands[player].length);
			expect(starting_count).toEqual(7);
			var response = uno.command('draw', { channel: 'CFake', user: player });
			expect(game.hands[player].length).not.toBeLessThan(7);
			expect(game.hands[player].length).not.toBeGreaterThan(8);
			expect(response.messages.length).not.toBeLessThan(1);
		});
	});
});

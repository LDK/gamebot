describe('Uno', function() {
	var uno = require('../../games/uno');

	it("should contain a games object", function() {
		expect(uno.games).toEqual(jasmine.any(Object));
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
			uno.gameStart('CFake','UFake');
		});

		it("should have only one player, the game creator", function(){
			expect(uno.games['CFake'].players.length).toEqual(1);
			expect(uno.games['CFake'].players[0]).toEqual('UFake');
		});

		it("should be able to add a player via join command", function(){
			var result = uno.command('join', { channel: 'CFake', user: 'UAlsoFake' });
			expect(uno.games['CFake'].players.length).toEqual(2);
			expect(uno.games['CFake'].players[1]).toEqual('UAlsoFake');
		});

		it("should be able to deal cards via command message", function(){
			var result = uno.command('deal', { channel: 'CFake', user: 'UFake' });
			for (var player in uno.games['CFake'].players) {
				var username = uno.games['CFake'].players[player];
				var hand = uno.games['CFake'].hands[username];
				expect(hand).toEqual(jasmine.any(Object));
				expect(hand.length).toEqual(7);
			}
		});
	});
});

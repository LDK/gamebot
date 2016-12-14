'use strict';

// Define the `gamebotApp` module
var app = angular.module('gamebotApp', [
	'ngRoute',
	'ngStorage',
	'notificationList',
	'channelSelector',
	'httpPostFix',
	'userLoginForm',
	'ngDragDrop',
	'angular.less'
]).controller('MainCtrl', function (gameState, user, bot, $scope, $localStorage, $http){
	var self = this;
	var api_server = '';
	self.closeDropdowns = function() {
		user.notifications.closeDropdown();
		user.menu.closeDropdown();
	}

	bot.pollGameState();
	
	if ($localStorage.user && $localStorage.user.id) {
		user.logged_in = $localStorage.user;
		if (user.logged_in.notifications && user.logged_in.notifications.length) {
			user.notifications.setItems(user.logged_in.notifications);
		}
	}
	$scope.bot = bot;

});

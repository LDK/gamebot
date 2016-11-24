'use strict';

angular.
  module('gamebotApp').
  config(['$locationProvider' ,'$routeProvider',
    function config($locationProvider, $routeProvider) {
      $locationProvider.hashPrefix('!');

      $routeProvider.
        when('/messages', {
          template: '<notification-list></notification-list>'
        }).
        when('/login', {
          template: '<user-login-form></user-login-form>'
        }).
        when('/', {
          template: '<game-room></game-room>'
        }).
		otherwise('/');
    }
  ]);

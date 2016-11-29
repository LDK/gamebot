'use strict';

angular.
  module('gamebotApp').
  config(['$locationProvider' ,'$routeProvider',
    function config($locationProvider, $routeProvider, user) {
      $locationProvider.hashPrefix('!');
      $routeProvider.
        when('/login', {
          template: '<user-login-form></user-login-form>'
        }).
        when('/', {
          template: '<game-room game="{{user.game}}"></game-room>'
        }).
		otherwise('/');
    }
  ]);

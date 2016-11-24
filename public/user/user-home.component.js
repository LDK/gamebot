'use strict';

// Register `userHome` component, along with its associated controller and template
angular.
  module('userHome').
  component('userHome', {
    templateUrl: 'user/user-home.template.html',
    controller: ['$http', 'user', function UserHomeController($http, user) {
		var self = this;
		self.user = user;
		user.getUserInfo().then(function(response){
			self.profile = response;
		});
		console.log('self profile',self.profile);
    }]
  });

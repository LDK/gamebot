'use strict';

// Register `userLoginForm` component, along with its associated controller and template
angular.
  module('userLoginForm').
  component('userLoginForm', {
    templateUrl: 'user/user-login-form.template.html',
    controller: ['$http', 'user', function UserLoginFormController($http, user) {
		var self = this;
		self.user = user;
		self.loginFormSubmit = function() {
			user.login().then(function(response){
				user.notifications.setItems(response.notifications || []);
			});
		}
    }]
  });

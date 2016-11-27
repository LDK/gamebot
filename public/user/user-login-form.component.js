'use strict';

// Register `userLoginForm` component, along with its associated controller and template
angular.
  module('userLoginForm').
  component('userLoginForm', {
    templateUrl: 'user/user-login-form.template.html',
    controller: ['$http', 'user', '$location', function UserLoginFormController($http, user, $location) {
		var self = this;
		self.user = user;
		self.userType = 'returning';
		self.submitDisabled = false;
		self.update = function() {
			if (!user.login_form.password) {
				self.submitDisabled = true;
			}
			else if (!user.login_form.username) {
				self.submitDisabled = true;
			}
			else if (self.userType == 'returning') {
				self.submitDisabled = false;
			}
			else if (self.userType == 'new' && (!user.login_form.password_confirm || user.login_form.password != user.login_form.password_confirm )) {
				self.submitDisabled = true;
			}
			else {
				self.submitDisabled = false;
			}
		}
		self.loginFormSubmit = function() {
			switch (self.userType) {
				case 'new':
					user.register().then(function(response){
						user.notifications.setItems(response.notifications || []);
					});
				break;
				case 'returning':
				default:
					user.login().then(function(response){
						user.notifications.setItems(response.notifications || []);
					});
				break;
			}
		}
    }]
  });

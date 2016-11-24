'use strict';

// Register `notificationList` component, along with its associated controller and template
angular.
  module('notificationList').
  component('notificationList', {
    templateUrl: 'notifications/notification-list.template.html',
    controller: ['$http', '$routeParams', 'user', function NotificationListController($http, $routeParams, user) {
      var self = this;
      self.sortCol = 'ts';
	  self.user = user;
	  if (user.logged_in) {
		  var dataUrl = 'http://npwsim.co:8888/user/'+user.logged_in.id+'/notifications/json';
	      $http.get(dataUrl, { params: { api_key: user.logged_in.api_key } }).then(function(response) {
	        self.user.notifications.notifications = response.data;
	      });
	  }
    }]
  });

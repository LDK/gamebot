app.factory('user', function($http,$timeout,$localStorage){
	var user = {
		login_form: {
			username: null,
			password: null
		},
		menu: {
			open: false
		},
		alerts: [],
		profile: null,
		logged_in: false
	};
	var api_server = ''; // empty string, same domain
	var login_url= '/login';
	var logout_url= '/logout';
	var mark_seen_url = '/mark_seen/';
	user.getUser = function(username) {
		var promise = $http.get(api_server + '/user/' + username).then(
			function (response) {
				return response.data;
			}
		);
		return promise;
	};
	user.getUsers = function(usernames) {
		var promise = $http.post(api_server + '/users', { usernames: usernames }).then(
			function (response) {
				return response.data;
			}
		);
		return promise;
	};
	user.getUserInfo = function() {
		if (!user.logged_in) {
			return false;
		}
		var post_data = { api_key: user.logged_in.api_key };
		// $http returns a promise, which has a then function, which also returns a promise
		var promise = $http.post(api_server+profile_url+user.logged_in.id+'/json', post_data).then(
			function(response) {
				// The then function here is an opportunity to modify the response
				return response.data;
			}
		);

		// Return the promise to the controller
		return promise;
	};
	user.menu.openDropdown = function() {
		user.menu.open = true;
	};
	user.menu.closeDropdown = function() {
		var alert_ids = [];
		if (user.menu.open) {
			for (var i = 0;i < user.alerts.length; i++) {
				alert_ids.push(user.alerts[i].id);
			}
			if (alert_ids.length) {
				user.alerts.markSeen(alert_ids).then(function(d){
					user.alerts.setItems(d);
				});
			}
		}
		user.menu.open = false;
	};
	user.menu.toggleDropdown = function() {
		if (user.menu.open) {
			user.menu.closeDropdown();
		}
		else {
			user.menu.openDropdown();
		}
	};
	user.login = function(username, password) {
		var post_data = { username: user.login_form.username, password: user.login_form.password };
		// $http returns a promise, which has a then function, which also returns a promise

		var promise = $http.post(api_server+login_url, post_data).then(function (response) {
			// The then function here is an opportunity to modify the response
			if (response.data.id) {
				$localStorage.user = user.logged_in = response.data;
				delete user.logged_in.password;
			}
			else {
				user.logout();
			}
			delete user.login_form.password;
			return response.data;
			
		});
		// Return the promise to the controller
		return promise;
	};
	user.logout = function() {
		if (!user.logged_in) {
			return false;
		}
		var msg = 'User '+user.logged_in.username+' has been logged out';
		user.logged_in = false;
		delete $localStorage.user;
		return msg;
	};	
	var notifications = user.notifications = {
		unseen: 0,
		open: false,
		notifications: [],
		setItems: function(ns) {
			var unseen = 0;
			for (var i = 0; i < ns.length; i++) {
				var mts = moment(ns[i].ts,'YYYY-MM-DD H:i:s');
				if (mts.isValid()) {
					ns[i].ts = mts.fromNow();
				}
				else {
					ns[i].ts = '--';
				}
				if (ns[i].seen > 0) {
					ns[i].seenness = 'seen';
				}
				else {
					ns[i].seenness = 'unseen';
					unseen++;
				}
			}
			notifications.unseen = unseen;
			notifications.notifications = ns;
		},
		openDropdown: function() {
			notifications.open = true;
		},
		closeDropdown: function() {
			var notification_ids = [];
			if (notifications.open) {
				for (var i = 0;i < notifications.notifications.length; i++) {
					notification_ids.push(notifications.notifications[i].id);
				}
				if (notification_ids.length) {
					notifications.markSeen(notification_ids).then(function(d){
						notifications.setItems(d);
					});
				}
			}
			notifications.open = false;
		},
		toggleDropdown: function() {
			if (notifications.open) {
				notifications.closeDropdown();
			}
			else {
				notifications.openDropdown();
			}
		},
		markSeen: function(notification_ids) {
			var post_data = { notifications: notification_ids, api_key: user.logged_in.api_key };
			// $http returns a promise, which has a then function, which also returns a promise

			var promise = $http.post(api_server+mark_seen_url+user.logged_in.id+'/json',post_data).then(function (response) {
				// The then function here is an opportunity to modify the response
				return response.data;
			});
			// Return the promise to the controller
			return promise;
		}	};
	return user;
});

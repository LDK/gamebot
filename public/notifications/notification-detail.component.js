'use strict';

// Register `championshipDetail` component, along with its associated controller and template
angular.
  module('championshipDetail').
  component('championshipDetail', {
    templateUrl: 'championship-detail/championship-detail.template.html',
    controller: ['$http', '$routeParams',
      function ChampionshipDetailController($http, $routeParams) {
        var self = this;
		var dataUrl = 'http://npwsim.co:8888/championship/' + $routeParams.championshipId + '/json'; 
        $http.get(dataUrl).then(function(response) {
			self.championship = response.data;
        });
      }
    ]
  });

angular.module('digger', ['digger.browse', 'ngRoute'])
	.config(['$locationProvider', '$routeProvider',
		function($locationProvider, $routeProvider) {
			$locationProvider.hashPrefix('!')
			$routeProvider.otherwise({redirectTo: '/'})
		}]);
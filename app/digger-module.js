angular.module('digger', ['digger.browse', 'digger.templates', 'ngRoute'])
	.config(['$locationProvider', '$routeProvider',
		function($locationProvider, $routeProvider) {
			$locationProvider.hashPrefix('!')
			$routeProvider.otherwise({redirectTo: '/'})
		}]);
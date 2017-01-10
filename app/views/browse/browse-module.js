angular.module('digger.browse', ['digger.core', 'digger.discogs', 'ngRoute'])
    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/', {
            templateUrl: 'browse.html',
            controller: 'BrowseController',
            controllerAs: 'ctrl'
        })
    }])
'use strict';

angular.module('myApp.view1', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/view1', {
    templateUrl: 'view1/view1.html',
    controller: 'View1Ctrl',
    controllerAs: 'ctrl'
  });
}])

.controller('View1Ctrl', ['$routeParams', 'DiscogsService', function ($routeParams, discogsService) {
  this.buyer = $routeParams.buyer || `onemanclap`
  this.seller = $routeParams.seller || `ezra11`
  this.cachedRecommendations = discogsService.getCachedRecommendations()
  this.orderedBy = 'artist'
  this.reverse = false
  this.orderBy = (field) => {
    if (this.orderedBy === field) {
      this.reverse = !this.reverse
    }
    this.orderedBy = field
  }
  this.getRecs = () => {
    this.message = `fetching results...`
    discogsService.getRecommendations(this.buyer, this.seller).then((r) => {
      this.message = ``
      this.data = r
    })
  }

  
}]);
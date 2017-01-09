'use strict';

angular.module('myApp.view1', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/view1', {
        templateUrl: 'view1/view1.html',
        controller: 'View1Ctrl',
        controllerAs: 'ctrl'
    });
}])

.controller('View1Ctrl', ['$rootScope', '$routeParams', 'DiscogsService', function ($rootScope, $routeParams, discogsService) {
    this.buyer = $routeParams.buyer || ``
    this.seller = $routeParams.seller || ``
    this.cachedRecommendations = discogsService.getCachedRecommendations()
    this.orderedBy = 'artist'
    this.reverse = false
    this.requestsDone = 0
    this.requestsTotal = 100

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
        }, angular.noop, (progress) => {
            this.requestsDone = progress.actualPage
            this.requestsTotal = progress.totalPages
        })
    }
    this.setSeller = (sellerName) => {
        this.seller = sellerName
        this.getRecs()
    }

    (() => {
        if ($routeParams.buyer && $routeParams.seller) {
            this.getRecs()
        }
    })()

    chrome.runtime.sendMessage('amjijkpahfilidhhioiikiilbkmohcpf', 'diggerReady', undefined, (scrapedInfo) => {
        this.buyer = scrapedInfo.scrapedPage.username
        this.itemTitle = scrapedInfo.scrapedPage.itemTitle
        this.potentialSellers = scrapedInfo.scrapedPage.items
        $rootScope.$apply()
        console.log(this.potentialSellers)
        console.error('info', scrapedInfo, chrome.runtime.lastError)
    })

  
}]);
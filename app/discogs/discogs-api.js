angular.module('digger.discogs').service('DiscogsAPI', ['$http', '$q', '$timeout',
    function ($http, $q, $timeout) {
        var baseURL = 'https://api.discogs.com';
        this.getCollectionItemsByFolder = function (username, folder_id) {
            
            var api = `/users/${username}/collection/folders/${folder_id}/releases?per_page=100`

            const deferred = $q.defer();
            const results = []

            function getPage(pageNumber) {
                $http.get(baseURL + api + `&page=${pageNumber}`).then((res) => {
                    deferred.notify({
                        totalPages: Math.min(res.data.pagination.pages, 100),
                        actualPage: pageNumber
                    })
                    results.push(res)

                    if (res.data.pagination.pages > pageNumber) {
                        $timeout(angular.noop, 1000).then(() => {
                            getPage(pageNumber + 1)
                        })
                    } else {
                        deferred.resolve(results)
                    }
                }, () => {
                    $timeout(angular.noop, 10000).then(() => {
                        getPage(pageNumber)
                    })
                });
            }

            getPage(1);

            return deferred.promise;
        }
        this.getInventory = (username) => {
            const api = `/users/${username}/inventory?per_page=100`

            const deferred = $q.defer();
            const results = []

            function getPage(pageNumber) {
                $http.get(baseURL + api + `&page=${pageNumber}`).then((res) => {
                    deferred.notify({
                        totalPages: Math.min(res.data.pagination.pages, 100),
                        actualPage: pageNumber
                    })
                    results.push(res)

                    if (res.data.pagination.pages > pageNumber && pageNumber < 100) {
                        $timeout(angular.noop, 1000).then(() => {
                            getPage(pageNumber + 1)
                        })
                    } else {
                        deferred.resolve(results)
                    }
                }, () => {
                    $timeout(angular.noop, 10000).then(() => {
                        getPage(pageNumber)
                    })
                });
            }

            getPage(1);

            return deferred.promise;
        }
        
    }])
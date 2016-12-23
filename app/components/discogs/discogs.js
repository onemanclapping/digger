angular.module('discogs', [])
    .service('DiscogsAPI', ['$http', '$q', '$timeout', function ($http, $q, $timeout) {
        var baseURL = 'https://api.discogs.com';
        this.getCollectionItemsByFolder = function (username, folder_id) {
            
            var api = `/users/${username}/collection/folders/${folder_id}/releases?per_page=100`

            const deferred = $q.defer();
            const results = []

            function getPage(pageNumber) {
                $http.get(baseURL + api + `&page=${pageNumber}`).then((res) => {
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
    .service('DiscogsCache', ['$window', function ($window) {
        let keys
        this.getItem = (key) => {
            if (keys.includes(key)) {
                return $window.localStorage.getItem(key)
            }
        }

        this.setItem = (key, value) => {
            if (!keys.includes(key)) {
                keys.push(key)
                $window.localStorage.setItem(`discogs-cache`, JSON.stringify(keys))
            }
            $window.localStorage.setItem(key, value)
        }

        this.getKeys = () => { return keys }

        (function init() {
            const localStorageValue = $window.localStorage.getItem(`discogs-cache`)

            if (localStorageValue) {
                keys = JSON.parse(localStorageValue)
            } else {
                keys = []
            }
        }())
    }])
    .service('DiscogsService', ['$q', 'DiscogsAPI', 'DiscogsCache', function ($q, discogsAPI, discogsCache) {
        this.getUserArtists = (username) => {
            const cacheKey = `getUserArtists-${username}`
            const cachedValue = discogsCache.getItem(cacheKey)
            if (cachedValue) {
                return $q.when(new Set(JSON.parse(cachedValue)))
            }

            return discogsAPI.getCollectionItemsByFolder(username, 0).then((res) => {
                const artists = new Set()

                res.forEach((page) => {
                    page.data.releases.forEach((rel) => {
                        rel.basic_information.artists.forEach((artist) => {
                            artists.add(artist.name)
                        })
                    })
                })

                artists.delete('Various')

                discogsCache.setItem(cacheKey, JSON.stringify([...artists]))
                return artists;
            })
        }
        this.getFilteredInventory = (username, artists) => {
            return discogsAPI.getInventory(username).then((res) => {
                let recommendations = []

                res.forEach((page) => {
                    page.data.listings.forEach((listing) => {
                        const limit = listing.release.description.indexOf(` - `)
                        const artist = listing.release.description.substring(0, limit);


                        if (artists.has(artist)) {
                            recommendations.push(listing)
                        }
                    })
                })

                return recommendations
            })
        }
        this.getRecommendations = (buyer, seller) => {
            const cacheKey = `getRecommendations-${buyer}-${seller}`
            const cachedValue = discogsCache.getItem(cacheKey)
            if (cachedValue) {
                return $q.when(JSON.parse(cachedValue))
            }

            return this.getUserArtists(buyer)
                .then((artists) => {
                    return this.getFilteredInventory(seller, artists)
                })
                .then((fullList) => {
                    return fullList.map(item => {
                        const limit = item.release.description.indexOf(` - `)
                        const artist = item.release.description.substring(0, limit)
                        const title = item.release.description.substring(limit + 3)

                        let media = []
                        if (title.includes('LP') || title.includes('12"') || title.includes('10"') || title.includes('7"')) {
                            media.push('vinyl')
                        }
                        if (title.includes('CD')) {
                            media.push('CD')
                        }
                        if (title.includes('DVD')) {
                            media.push('DVD')
                        }
                        
                        return {
                            condition: item.condition,
                            price: item.price.value,
                            currency: item.price.currency,
                            description: item.release.description,
                            releaseId: item.release.id,
                            uri: item.uri,
                            artist,
                            title,
                            media
                        }
                    })
                })
                .then((recommendations) => {
                    discogsCache.setItem(cacheKey, JSON.stringify(recommendations))
                    return recommendations
                })
        }
        this.getCachedRecommendations = () => discogsCache.getKeys().filter((key) => key.includes(`getRecommendations-`))
    }])
    
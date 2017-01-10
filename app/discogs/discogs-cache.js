angular.module('digger.discogs').service('DiscogsCache', ['$window',
	function ($window) {
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
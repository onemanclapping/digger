angular.module('digger.discogs').service('DiscogsService', ['$q', 'DiscogsAPI', 'DiscogsCache', function ($q, discogsAPI, discogsCache) {
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
        this.getCachedRecommendations = () => {
            const cachedKeys = discogsCache.getKeys()
            const getRecommendationsKey = `getRecommendations-`
            const keyLength = getRecommendationsKey.length
            const parsedReccomendations = []

            cachedKeys.forEach((ck) => {
                if (ck.includes(getRecommendationsKey)) {
                    const lastDash = ck.lastIndexOf(`-`)
                    const buyer = ck.substring(keyLength, lastDash)
                    const seller = ck.substring(lastDash + 1)

                    parsedReccomendations.push({
                        buyer,
                        seller
                    })
                }
            })

            return parsedReccomendations
        }
    }])
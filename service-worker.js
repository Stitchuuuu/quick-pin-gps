const CACHE_NAME = 'gps-app-cache-v1'
const FILES_TO_CACHE = [
	'/',
	'/index.html',
	'/manifest.json',
	'/version.txt',
	'/favicon.ico',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
	// ajoute ici d'autres fichiers si besoin (icônes, styles, scripts externes)
]

self.addEventListener('install', event => {
	event.waitUntil(
		caches.open(CACHE_NAME)
			.then(cache => cache.addAll(FILES_TO_CACHE))
			.then(() => self.skipWaiting())
	)
})

self.addEventListener('activate', event => {
	event.waitUntil(
		caches.keys()
			.then(keys =>
				Promise.all(
					keys.map(key => {
						if (key !== CACHE_NAME) {
							return caches.delete(key)
						}
					})
				)
			)
			.then(() => self.clients.claim())
	)
})

self.addEventListener('fetch', event => {
	if (event.request.method !== 'GET') {
		return
	}

	event.respondWith(
		caches.match(event.request)
			.then(cachedResponse => {
				if (cachedResponse) {
					return cachedResponse
				}

				return fetch(event.request)
					.then(response => {
						if (!response || response.status !== 200 || response.type !== 'basic') {
							return response
						}

						const responseToCache = response.clone()

						caches.open(CACHE_NAME)
							.then(cache => {
								cache.put(event.request, responseToCache)
							})

						return response
					})
			})
	)
})

// sw.js - Service Worker

const CACHE_NAME = 'pro-chat-cache-v1';
// This list should ideally include all your static assets.
// For this single-file app, we'll cache the root page.
const URLS_TO_CACHE = [
  '/',
  '/index.html',
];

// Install event: opens the cache and adds the core files to it.
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(URLS_TO_CACHE);
      })
  );
});

// Fetch event: serves requests from the cache or network.
// This is a "Network falling back to cache" strategy.
self.addEventListener('fetch', event => {
  // We only want to cache GET requests.
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // If we get a valid response from the network, clone it and cache it.
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => {
              // We only cache our own assets, not Firebase or other external resources.
              if(event.request.url.startsWith(self.location.origin)) {
                 cache.put(event.request, responseToCache);
              }
            });
        }
        return response;
      })
      .catch(() => {
        // If the network request fails, try to get it from the cache.
        return caches.match(event.request);
      })
  );
});

// Activate event: cleans up old caches.
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

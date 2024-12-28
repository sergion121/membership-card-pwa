const CACHE_NAME = 'video-pwa-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/apple-touch-icon.png'
  // Add any other assets you want to cache (e.g., fonts, images)
];

// Install Event - Caching Essential Assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Caching Assets');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .catch(err => console.error('Error Caching Assets:', err))
  );
});

// Activate Event - Cleaning Up Old Caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.filter(cacheName => cacheName !== CACHE_NAME)
            .map(cacheName => caches.delete(cacheName))
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch Event - Serving Cached Assets When Available
self.addEventListener('fetch', event => {
  const { request } = event;

  // Bypass caching for video files to save storage
  if (request.destination === 'video') {
    return;
  }

  event.respondWith(
    caches.match(request)
      .then(cachedResponse => {
        // Return cached response if found, else fetch from network
        return cachedResponse || fetch(request);
      })
      .catch(() => {
        // Optionally, return a fallback page if fetch fails
        if (request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      })
  );
});

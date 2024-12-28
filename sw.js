const CACHE_NAME = 'video-pwa-cache-v1';
const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './Part_01_edited_v3.mov',
  './STUK_Flipping__Sequence(Prolonged backside)_v5.mov',
  './STUK_Flipping_back__Sequence(Prolonged)_v2.mov',
  './manifest.json',
  // Add icon paths if needed:
  // './icons/icon-192.png',
  // './icons/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});

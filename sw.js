const CACHE_NAME = 'wedding-v1';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './manifest.json',
  './assets/hero-bg.png',
  './assets/story-1.png',
  './assets/story-2.png',
  './assets/story-3.png',
  './assets/gallery-1.png',
  './assets/gallery-2.png',
  './assets/gallery-3.png',
  './assets/gallery-4.png',
  './assets/gallery-5.png',
  './assets/gallery-6.png',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './assets/music.mp3'
];

// Install Event
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching app shell & assets');
      return cache.addAll(ASSETS).catch(err => {
        console.warn('[Service Worker] Some assets failed to cache, proceeding anyway.', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate Event
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[Service Worker] Removing old cache', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Fetch Event
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      return cachedResponse || fetch(e.request).catch(() => {
        // Fallback for offline if request fails and is not cached
        if (e.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});

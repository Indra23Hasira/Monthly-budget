const CACHE_NAME = 'budget-app-v1';
const ASSETS = ['./', './index.html', './manifest.json'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).catch(()=>{})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Network-first for Firebase/API calls, cache-first for app shell
  if (event.request.url.includes('firestore') || event.request.url.includes('googleapis') || event.request.url.includes('gstatic')) {
    return;
  }
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});

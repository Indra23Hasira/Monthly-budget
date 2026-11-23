const CACHE_NAME = 'budget-app-v3';
const CHART_URL = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js';
const ASSETS = ['./', './index.html', './manifest.json', './icon-192.png', CHART_URL];
const NETWORK_TIMEOUT_MS = 3000; // sinyal lambat: maksimal tunggu 3 detik, lalu pakai versi tersimpan

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      Promise.all(ASSETS.map((url) => cache.add(url).catch(() => {})))
    )
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

function saveToCache(request, response) {
  if (response && response.ok) {
    const clone = response.clone();
    caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
  }
}

// File app (index.html dll): coba internet dulu supaya update langsung terasa,
// tapi kalau lebih dari 3 detik atau offline, pakai versi tersimpan di HP.
function networkWithTimeout(request) {
  return new Promise((resolve) => {
    let settled = false;
    const finish = (response) => { if (!settled) { settled = true; resolve(response); } };
    const timer = setTimeout(() => {
      caches.match(request, { ignoreSearch: true }).then((cached) => { if (cached) finish(cached); });
    }, NETWORK_TIMEOUT_MS);
    fetch(request)
      .then((response) => {
        saveToCache(request, response);
        clearTimeout(timer);
        finish(response);
      })
      .catch(() => {
        clearTimeout(timer);
        caches.match(request, { ignoreSearch: true }).then((cached) => finish(cached || Response.error()));
      });
  });
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = request.url;
  // Jangan pernah cache Firebase / Google (data & login selalu langsung ke server)
  if (url.includes('firestore') || url.includes('googleapis') || url.includes('gstatic')) return;

  // Library dengan versi tetap (Chart.js): langsung dari cache, tidak perlu tunggu internet
  if (url.startsWith('https://cdn.jsdelivr.net/')) {
    event.respondWith(
      caches.match(request).then((cached) => cached || fetch(request).then((response) => {
        saveToCache(request, response);
        return response;
      }))
    );
    return;
  }

  event.respondWith(networkWithTimeout(request));
});

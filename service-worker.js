// Al Hadi Store — Service Worker
// Caches static shell files so the site loads instantly on repeat visits
// and can "Add to Home Screen" like a real app. Firebase/API calls are
// NEVER cached — those always go to the network so products/orders stay live.

const CACHE_NAME = 'al-hadi-store-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/app.js',
  '/js/firebase-config.js',
  '/manifest.json',
  '/assets/icons/icon-192.png',
  '/assets/icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
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
  const url = event.request.url;

  // Never intercept Firebase / Firestore / Auth / analytics / cross-origin API calls.
  if (
    event.request.method !== 'GET' ||
    url.includes('firestore.googleapis.com') ||
    url.includes('firebaseio.com') ||
    url.includes('identitytoolkit') ||
    url.includes('googleapis.com') ||
    url.includes('google-analytics') ||
    !url.startsWith(self.location.origin)
  ) {
    return;
  }

  // Static shell: cache-first, falls back to network, and refreshes cache in background.
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const network = fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});

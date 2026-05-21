// HAVN service worker
// Minimal "app shell" cache. Caches the core files so the app opens
// even if the user is offline. Firestore data still needs a network
// connection to sync, but the UI shell will load.

const CACHE_NAME = 'havn-v1';
const SHELL_FILES = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './HAVN-logo-mark-only.png',
  './HAVN-logo-app-icon.png',
  './HAVN-logo-wordmark.png',
  './manifest.json'
];

// On install, pre-cache the app shell.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_FILES))
      .catch(() => { /* Some files may 404 in dev — don't block install */ })
  );
  self.skipWaiting();
});

// On activate, clean up old caches.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// On fetch: network-first for app navigation, cache fallback when offline.
// External URLs (Firebase, OpenStreetMap, Open-Meteo, etc.) always go to network —
// we don't cache them because their data is dynamic.
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  // Only handle same-origin requests; everything else (CDNs, APIs) passes through.
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Update the cache with the latest copy in the background
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy)).catch(() => {});
        return response;
      })
      .catch(() => caches.match(event.request).then((cached) => cached || caches.match('./index.html')))
  );
});

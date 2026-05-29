'use strict';

// ─── WIZZARA Service Worker v7.0.0 ───────────────────────────────────────────
// Cache version — bump this whenever static assets change
const CACHE_NAME = 'wizzara-v7.0.0';
const FONT_CACHE = 'wizzara-fonts-v1';

// Same-origin static assets to precache at install time.
// IMPORTANT: Only list files that definitely exist.
// Cross-origin URLs (fonts) are handled separately in the fetch handler.
const STATIC_ASSETS = [
  './wizard_app.html',
  './manifest_app.json',
  './icons/icon-192x192.png',
  './icons/icon-512x512.png',
  './icons/icon-144x144.png',
];

// Hosts whose responses should be served from the font cache
const FONT_HOSTS = new Set(['fonts.googleapis.com', 'fonts.gstatic.com']);

// ─── INSTALL ─────────────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
      .catch((err) => {
        // Log but don't block install — the app is still usable online
        console.warn('[WIZZARA SW] Precache partial failure (non-fatal):', err.message);
        return self.skipWaiting();
      })
  );
});

// ─── ACTIVATE ────────────────────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((k) => k !== CACHE_NAME && k !== FONT_CACHE)
          .map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// ─── FETCH ───────────────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Only handle GET requests
  if (req.method !== 'GET') return;

  let url;
  try {
    url = new URL(req.url);
  } catch (_) {
    return;
  }

  // Skip WebSocket upgrade requests and socket.io polling
  if (url.pathname.includes('/socket.io')) return;
  if (req.headers.get('upgrade') === 'websocket') return;

  // ── Font resources: stale-while-revalidate ────────────────────────────────
  // Serve cached fonts instantly; refresh in background.
  // This is separate from STATIC_ASSETS — fonts are never in cache.addAll().
  if (FONT_HOSTS.has(url.hostname)) {
    event.respondWith(
      caches.open(FONT_CACHE).then((cache) =>
        cache.match(req).then((cached) => {
          const networkRequest = fetch(req).then((response) => {
            if (response && response.status === 200) {
              cache.put(req, response.clone());
            }
            return response;
          }).catch(() => cached || new Response('', { status: 503 }));
          // Return cached immediately if available; update in background
          return cached || networkRequest;
        })
      )
    );
    return;
  }

  // ── Same-origin resources: cache-first with network fallback ─────────────
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(req).then((cached) => {
        // Serve from cache instantly
        if (cached) return cached;

        // Not in cache → fetch from network, cache the result
        return fetch(req).then((response) => {
          if (response && response.status === 200) {
            const toCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, toCache));
          }
          return response;
        }).catch(() => {
          // Offline: return app shell for navigation requests
          if (req.mode === 'navigate') {
            return caches.match('./wizard_app.html');
          }
          return new Response('', { status: 503, statusText: 'Offline' });
        });
      })
    );
    return;
  }
});

// ─── MESSAGE HANDLER ─────────────────────────────────────────────────────────
self.addEventListener('message', (event) => {
  if (!event.data) return;

  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys()
        .then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
        .then(() => self.registration.unregister())
    );
  }
});

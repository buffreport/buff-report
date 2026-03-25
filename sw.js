/**
 * Buff Report — Service Worker
 * Strategy:
 *   - HTML (index.html, /): Network-First → always get latest site updates
 *   - Static assets (logo, images): Cache-First → fast repeat visits
 *   - Story/feed data (API calls to workers.dev): Network-First → always fresh
 *   - Fallback: serve cached shell if fully offline
 */

const CACHE_NAME   = 'buff-report-v6';
const STATIC_CACHE = 'buff-report-static-v6';

// Static assets to pre-cache on install (HTML excluded — fetched fresh each load)
const PRECACHE_ASSETS = [
  '/Gold.webp',
  '/Gold.PNG',
];

// ── INSTALL: pre-cache static shell ──────────────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// ── ACTIVATE: clean up old caches ────────────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== CACHE_NAME && k !== STATIC_CACHE)
          .map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// ── FETCH: route requests ─────────────────────────────────────────────────
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET, chrome-extension, and cross-origin non-worker requests
  if (request.method !== 'GET') return;
  if (url.protocol === 'chrome-extension:') return;

  // NETWORK-FIRST: HTML pages — always fetch latest from server
  if (url.origin === self.location.origin &&
      (url.pathname === '/' || url.pathname === '/index.html' || url.pathname.endsWith('.html'))) {
    event.respondWith(networkFirst(request));
    return;
  }

  // NETWORK-FIRST: API/feed calls (Cloudflare Workers, rss2json, fonts)
  const isNetworkFirst =
    url.hostname.includes('workers.dev') ||
    url.hostname.includes('rss2json.com') ||
    url.hostname.includes('beehiiv.com') ||
    url.hostname.includes('fonts.googleapis.com') ||
    url.hostname.includes('fonts.gstatic.com') ||
    url.hostname.includes('news.google.com');

  if (isNetworkFirst) {
    event.respondWith(networkFirst(request));
    return;
  }

  // CACHE-FIRST: static assets on same origin (images, etc.)
  if (url.origin === self.location.origin) {
    event.respondWith(cacheFirst(request));
    return;
  }
});

// ── STRATEGIES ───────────────────────────────────────────────────────────

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    // Offline fallback: return cached homepage shell
    return caches.match('/index.html');
  }
}

async function networkFirst(request) {
  try {
    const response = await fetch(request, { signal: AbortSignal.timeout(5000) });
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    // Network failed — return stale cache if available
    const cached = await caches.match(request);
    if (cached) return cached;
    // Last resort: return offline shell
    return caches.match('/index.html');
  }
}

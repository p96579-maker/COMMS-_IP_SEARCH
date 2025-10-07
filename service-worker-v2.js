const CACHE_NAME = 'comms-ip-search-v2';
const CDNS = [
  'https://cdn.tailwindcss.com'
];
const APP_SHELL = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './assets/data.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './manifest.webmanifest',
  ...CDNS
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => k !== CACHE_NAME && caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(req);
    if (cached) return cached;

    try {
      const res = await fetch(req, {mode: 'no-cors'});
      // Cache opaque or normal responses
      cache.put(req, res.clone());
      return res;
    } catch (e) {
      // Fallback to any cached match (useful when offline)
      const any = await caches.match(req);
      if (any) return any;
      // Last resort: return cached index for navigation requests
      if (req.mode === 'navigate') {
        const index = await caches.match('./index.html');
        if (index) return index;
      }
      throw e;
    }
  })());
});

const CACHE = 'comms-ip-search-v3';
const SHELL = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './assets/data.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './manifest.webmanifest',
  'https://cdn.tailwindcss.com'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.map(k => k !== CACHE && caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(req);
    if (cached) return cached;
    try {
      const res = await fetch(req);
      cache.put(req, res.clone());
      return res;
    } catch (err) {
      // data.json explicit fallback
      if (new URL(req.url).pathname.endsWith('/assets/data.json')) {
        const index = await caches.match('./index.html');
        if (index) return index;
      }
      // Navigation fallback
      if (req.mode === 'navigate') {
        const index = await caches.match('./index.html');
        if (index) return index;
      }
      throw err;
    }
  })());
});

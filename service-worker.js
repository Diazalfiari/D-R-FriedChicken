const CACHE_VERSION = '20251009';
const CACHE_NAME = `drfriedchicken-v4-${CACHE_VERSION}`;
const CORE_ASSETS = [
  '/',
  '/index.html',
  `/assets/css/style.css?v=${CACHE_VERSION}`,
  `/assets/js/main.js?v=${CACHE_VERSION}`,
  '/assets/icons/logo.svg',
  '/assets/icons/favicon.svg',
  '/assets/icons/logo.png'
];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(CORE_ASSETS)));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
      .then(() => self.clients.matchAll({ type: 'window' }))
      .then(clients => clients.forEach(client => client.postMessage({ type: 'SW_UPDATED', version: CACHE_VERSION })))
  );
});

self.addEventListener('fetch', e => {
  const { request } = e;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  const isHTML = request.destination === 'document' || url.pathname.endsWith('.html') || url.pathname === '/';
  const isImage = request.destination === 'image' || /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(url.pathname);

  if (isHTML || isImage) {
    // Network-first for HTML & images – show latest updates immediately
    e.respondWith(
      fetch(request)
        .then(resp => {
          const copy = resp.clone();
          if (resp.ok && url.origin === self.location.origin) {
            caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
          }
          return resp;
        })
        .catch(async () => (await caches.match(request)) || (isHTML ? caches.match('/index.html') : Response.error()))
    );
  } else {
    // Cache-first for static assets (CSS, JS, icons)
    e.respondWith(
      caches.match(request).then(cached => {
        if (cached) return cached;
        return fetch(request).then(resp => {
          const copy = resp.clone();
          if (resp.ok && url.origin === self.location.origin) {
            caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
          }
          return resp;
        });
      })
    );
  }
});

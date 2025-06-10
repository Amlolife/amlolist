// sw.js
const CACHE_NAME = 'amlo-task-manager-v1';
const URLS_TO_CACHE = [
  '/',
  'index.html',
  'app.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  'https://fonts.googleapis.com/css2?display=swap&family=Plus+Jakarta+Sans:wght@400;500;700;800',
  'https://cdn.tailwindcss.com?plugins=forms,container-queries'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(URLS_TO_CACHE))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(resp => resp || fetch(event.request).then(fetchResp => {
        if (!fetchResp || fetchResp.status !== 200 || fetchResp.type !== 'basic') return fetchResp;
        const cloned = fetchResp.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, cloned));
        return fetchResp;
      }))
  );
});

self.addEventListener('activate', event => {
  const whitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(key => (whitelist.includes(key) ? null : caches.delete(key))))
    )
  );
});

// Nama cache unik untuk aplikasi Anda
const CACHE_NAME = 'amlo-list-v1';

// Daftar file yang perlu disimpan untuk bisa diakses offline
const urlsToCache = [
  './',
  './index.html',
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/vue@3/dist/vue.global.js',
  'https://unpkg.com/idb-keyval@6/dist/umd.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// Event 'install': Saat service worker pertama kali diinstall
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Event 'fetch': Saat browser meminta file (misal: gambar, script)
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Jika file ada di cache, langsung berikan dari cache
        if (response) {
          return response;
        }
        // Jika tidak ada, ambil dari internet
        return fetch(event.request);
      }
    )
  );
});

const CACHE_NAME = 'cp-cache-v11';

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.add('./')).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', e => {
  if (e.data === 'skipWaiting') self.skipWaiting();
});

self.addEventListener('fetch', e => {
  const req = e.request;
  // Para la navegación (el HTML): network-first, así siempre se ve la última versión.
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then(res => { caches.open(CACHE_NAME).then(c => c.put('./', res.clone())); return res; })
        .catch(() => caches.match('./'))
    );
    return;
  }
  // Resto de recursos: cache-first con respaldo de red.
  e.respondWith(caches.match(req).then(cached => cached || fetch(req)));
});

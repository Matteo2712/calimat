// CaliMat Service Worker v1.3
const CACHE = 'calimat-v2';
const APP_SHELL = ['/', '/index.html', '/manifest.json'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(APP_SHELL))
      .catch(err => console.error('SW install cache error', err))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(names => Promise.all(names.filter(n => n !== CACHE).map(n => caches.delete(n))))
      .then(() => clients.claim())
  );
});

// Click sulla notifica → porta l'app in primo piano
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const c of list) {
        if (c.url.includes('calimat') && 'focus' in c) return c.focus();
      }
      return clients.openWindow('/');
    })
  );
});

// Fetch: network-first, con fallback alla cache quando offline.
// Ogni risposta valida viene salvata in cache per la prossima volta offline.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return; // lascia passare POST/PUT (es. chiamate Supabase) senza intercettarle

  e.respondWith(
    fetch(e.request)
      .then(res => {
        const resClone = res.clone();
        caches.open(CACHE).then(cache => cache.put(e.request, resClone)).catch(() => {});
        return res;
      })
      .catch(() =>
        caches.match(e.request).then(cached => {
          if (cached) return cached;
          if (e.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
          return new Response('Offline', { status: 503 });
        })
      )
  );
});

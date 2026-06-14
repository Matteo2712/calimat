// CaliMat Service Worker v1.2
const CACHE = 'calimat-v1';

// Installazione: non pre-cachi nulla, CaliMat usa Supabase
self.addEventListener('install', e => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(clients.claim());
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

// Fetch: passa tutto alla rete (nessuna cache offline per ora)
self.addEventListener('fetch', e => {
  e.respondWith(fetch(e.request).catch(() => new Response('Offline', { status: 503 })));
});

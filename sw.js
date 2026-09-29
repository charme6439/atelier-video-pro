const CACHE_NAME = 'atelier-video-pro-v2';
const ASSETS = ['./', './index.html', './manifest.json', './icône-192.png', './icône-512.png'];

self.addEventListener('install', (event) => {
    event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
        )
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    const req = event.request;

    // Ignorer tout ce qui n'est pas http/https (chrome-extension, data:, etc.)
    if (!req.url.startsWith('http://') && !req.url.startsWith('https://')) return;

    // Ignorer les appels API et les méthodes non GET
    if (req.url.includes('agnes-ai.com') || req.method !== 'GET') return;

    event.respondWith(
        caches.match(req).then((cached) => {
            return cached || fetch(req).then((res) => {
                if (!res || res.status !== 200 || res.type !== 'basic') return res;
                const copy = res.clone();
                caches.open(CACHE_NAME).then((cache) => cache.put(req, copy)).catch(() => {});
                return res;
            }).catch(() => cached);
        })
    );
});

// Keeps the app working offline: the app's own files are cached on first visit and served from the cache,
// refreshed in the background. Fonts from Google are cached the same way once seen.
const CACHE = 'pedo-edhellen-v1'

self.addEventListener('install', (e) => {
  // each file on its own, so one that fails to cache never stops the app from installing
  e.waitUntil(caches.open(CACHE).then((c) => Promise.all(['./', './index.html', './manifest.webmanifest', './icon-192.png'].map((u) => c.add(u).catch(() => {})))))
  self.skipWaiting()
})

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))))
  self.clients.claim()
})

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url)
  const ours = url.origin === location.origin
  const fonts = /fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)
  if (e.request.method !== 'GET' || (!ours && !fonts)) return
  e.respondWith(caches.open(CACHE).then(async (cache) => {
    const hit = await cache.match(e.request)
    const fresh = fetch(e.request).then((res) => { if (res.ok) cache.put(e.request, res.clone()); return res }).catch(() => hit)
    return hit || fresh
  }))
})

// a tap on a reminder opens (or focuses) the app
self.addEventListener('notificationclick', (e) => {
  e.notification.close()
  e.waitUntil(self.clients.matchAll({ type: 'window' }).then((list) => (list[0] ? list[0].focus() : self.clients.openWindow('./'))))
})

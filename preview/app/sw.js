// Keeps the app working offline: the app's own files are cached on first visit and served from the cache,
// the page itself is always fetched fresh when online. Fonts from Google are cached once seen.
const CACHE = 'pedo-edhellen-v2'

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
  // the page and its version file: the network first, so a reload online always gets the newest app;
  // the saved copy only when offline
  const page = e.request.mode === 'navigate' || url.pathname.endsWith('/index.html') || url.pathname.endsWith('/version.json')
  if (ours && page) {
    e.respondWith(fetch(e.request).then((res) => {
      if (res.ok && !url.pathname.endsWith('/version.json')) caches.open(CACHE).then((c) => c.put(e.request, res.clone()))
      return res
    }).catch(() => caches.match(e.request).then((hit) => hit || caches.match('./index.html'))))
    return
  }
  // everything else has a hashed name and never changes: the saved copy first, refreshed in the background
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

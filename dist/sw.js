/* ── Arête OS Service Worker ─────────────────────────────────── */
const CACHE_NAME = 'arete-os-v1'

const PRECACHE = [
  '/',
  '/manifest.json',
  '/arete-icon.svg',
  '/icon-192.svg',
  '/icon-512.svg',
]

/* Install: pre-cache the shell */
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  )
})

/* Activate: take control immediately, prune old caches */
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k !== CACHE_NAME)
            .map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  )
})

/* Fetch: cache-first for same-origin assets, network-first for navigation */
self.addEventListener('fetch', (e) => {
  const { request } = e
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return

  /* Navigation requests → network-first with cache fallback */
  if (request.mode === 'navigate') {
    e.respondWith(
      fetch(request)
        .then((res) => {
          const clone = res.clone()
          caches.open(CACHE_NAME).then((c) => c.put(request, clone))
          return res
        })
        .catch(() => caches.match('/').then((r) => r || new Response('Offline', { status: 503 })))
    )
    return
  }

  /* Static assets (JS, CSS, fonts, images) → cache-first, update in background */
  e.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cached = await cache.match(request)
      const networkPromise = fetch(request).then((res) => {
        if (res.ok) cache.put(request, res.clone())
        return res
      }).catch(() => null)

      return cached ?? networkPromise ?? new Response('Not found', { status: 404 })
    })
  )
})

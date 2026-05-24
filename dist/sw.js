/* ── Arête OS Service Worker v2 ──────────────────────────────── */
const CACHE_NAME = 'arete-os-v2'

/* Install: pre-cache the app shell only (no JS bundles) */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll([
        '/',
        '/manifest.json',
      ]).catch(() => { /* silently ignore missing icons */ })
    )
  )
  self.skipWaiting()
})

/* Activate: prune old caches and take control */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)

  /* ── Never intercept external requests (Supabase API, CDNs, etc.) ── */
  if (url.origin !== self.location.origin) return

  /* ── Never intercept JS/CSS module assets ──────────────────────────
   * Vite bundles land in /assets/ with hash-based filenames.
   * Intercepting them can cause "Failed to fetch dynamically imported module"
   * errors when the SW serves a stale or mismatched version.
   * Let the browser + HTTP cache handle JS/CSS entirely.
   */
  if (
    url.pathname.startsWith('/assets/') ||
    url.pathname.endsWith('.js')        ||
    url.pathname.endsWith('.jsx')       ||
    url.pathname.endsWith('.ts')        ||
    url.pathname.endsWith('.tsx')       ||
    url.pathname.endsWith('.css')       ||
    url.pathname.includes('/@')         ||   // Vite dev-server virtual modules
    url.pathname.includes('/src/')      ||   // Vite dev-server source files
    url.searchParams.has('v')                // Vite cache-busting queries
  ) return

  /* ── Cache-first: static assets that rarely change ── */
  if (url.pathname.match(/\.(png|jpg|jpeg|svg|ico|woff|woff2|ttf|gif|webp)$/) ||
      url.pathname === '/manifest.json') {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached
        return fetch(request).then((res) => {
          if (res && res.ok) {
            const clone = res.clone()
            caches.open(CACHE_NAME).then((c) => c.put(request, clone))
          }
          return res
        })
      })
    )
    return
  }

  /* ── Navigation requests: network-first, cached shell fallback ── */
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match('/').then((r) => r || new Response('Offline', { status: 503 }))
      )
    )
  }

  /* Everything else: let the browser handle it (network only) */
})

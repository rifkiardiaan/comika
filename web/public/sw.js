/* Service worker COMIKA — PWA offline caching + web push notification. */

const CACHE_NAME = 'comika-v3'
const SHELL_ASSETS = [
  '/',
  '/index.html',
  '/favicon.svg',
  '/icon-192.png',
  '/icon-512.png',
  '/manifest.json',
]

/**
 * Baca /index.html terbaru lalu pre-cache semua aset build (JS/CSS) yang
 * dirujuknya. Setiap deploy aset diberi hash baru, sehingga pengambilan ini
 * membuat bundel versi terbaru ikut tersimpan untuk akses offline.
 */
async function precacheLatestShell(cache) {
  try {
    const res = await fetch('/index.html')
    if (!res.ok) return
    const html = await res.text()
    const assetPaths = [...html.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g)].map((m) => m[1])
    await Promise.allSettled(assetPaths.map((p) => cache.add(p)))
  } catch {
    // Gagal ambil shell — abaikan, runtime caching tetap bekerja.
  }
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME)
      await cache.addAll(SHELL_ASSETS)
      // Amankan bundle aplikasi (JS/CSS hasil build) langsung saat install,
      // bukan menunggu runtime caching. Ini menjamin app shell lengkap
      // tersedia offline setelah kunjungan pertama (termasuk untuk APK/WebView).
      await precacheLatestShell(cache)
      await self.skipWaiting()
    })(),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys()
      await Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)),
      )
      await self.clients.claim()
    })(),
  )
})

/**
 * Strategi caching:
 * - Navigasi (rute SPA): coba network, bila gagal → sajikan index.html dari cache
 *   agar aplikasi tetap bisa dibuka offline (halaman Komik Offline).
 * - Aset statis: cache-first, lalu simpan hasil network untuk kunjungan berikutnya.
 * - API (/api) & gambar /storage TIDAK dicache di sini (gambar komik offline
 *   dikelola lewat IndexedDB di aplikasi).
 */
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  if (request.method !== 'GET') return

  // Navigasi antar halaman SPA
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.ok) {
            const clone = response.clone()
            caches
              .open(CACHE_NAME)
              .then((cache) => cache.put('/index.html', clone))
              .catch(() => {})
          }
          return response
        })
        .catch(() =>
          caches.match('/index.html').then(
            (cached) => cached || new Response('', { status: 503, statusText: 'Offline' }),
          ),
        ),
    )
    return
  }

  // API & gambar halaman komik tidak di-cache di sini
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/storage/')) return

  event.respondWith(
    caches.match(request).then((cached) => {
      const fetchPromise = fetch(request)
        .then((response) => {
          if (response && response.status === 200 && response.type === 'basic') {
            const clone = response.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
          }
          return response
        })
        .catch(() => cached || new Response('', { status: 503, statusText: 'Offline' }))

      return cached || fetchPromise
    }),
  )
})

/** Tampilkan notifikasi dari payload push (JSON) atau fallback. */
self.addEventListener('push', (event) => {
  let payload = {}
  let title = 'COMIKA'
  let body = ''
  let url = '/'

  try {
    if (event.data) {
      payload = event.data.json()
      title = payload.title || title
      body = payload.body || ''
      url = payload.data?.url || url
    }
  } catch {
    body = event.data ? event.data.text() : ''
  }

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      data: { url: new URL(url, self.registration.scope).href, payload },
      tag: payload.data?.type || 'comika-notification',
      renotify: false,
    }),
  )
})

/** Klik notifikasi → buka tab tujuan. */
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const targetUrl = event.notification.data?.url || self.registration.scope
  const url = new URL(targetUrl)

  event.waitUntil(
    (async () => {
      const windowClients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })

      for (const client of windowClients) {
        if (new URL(client.url).origin === url.origin) {
          await client.navigate(url.href)
          await client.focus()
          return
        }
      }

      await self.clients.openWindow(url.href)
    })(),
  )
})

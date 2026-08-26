/* Service worker COMIKA — PWA offline caching + web push notification. */

const CACHE_NAME = 'comika-v1'
const SHELL_ASSETS = [
  '/',
  '/index.html',
  '/favicon.svg',
  '/icon-192.png',
  '/icon-512.png',
  '/manifest.json',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_ASSETS)).then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // Hapus cache lama
      const keys = await caches.keys()
      await Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)),
      )
      await self.clients.claim()
    })(),
  )
})

// Network-first strategy for API, cache-first for static assets
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET and API requests
  if (request.method !== 'GET' || url.pathname.startsWith('/api/')) return

  event.respondWith(
    caches.match(request).then((cached) => {
      const fetchPromise = fetch(request)
        .then((response) => {
          // Cache valid responses
          if (response && response.status === 200 && response.type === 'basic') {
            const clone = response.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
          }
          return response
        })
        .catch(() => cached)

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
    // Payload bukan JSON — tampilkan body mentah bila ada
    body = event.data ? event.data.text() : ''
  }

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      // Resolve URL relatif terhadap scope service worker
      data: { url: new URL(url, self.registration.scope).href, payload },
      tag: payload.data?.type || 'comika-notification',
      renotify: false,
    }),
  )
})

/** Klik notifikasi → buka tab tujuan (atau fokus tab yang sudah ada). */
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

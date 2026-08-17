/* Service worker COMIKA — menangani web push notification & klik notifikasi. */

self.addEventListener('install', () => {
  // Langsung aktif — jangan menunggu tab lama ditutup
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // Ambil alih semua tab agar push diterima meski tab dibuka sebelum SW terpasang
      await self.clients.claim()
      // Bersihkan cache lama (jika pernah ada)
      const keys = await caches.keys()
      await Promise.all(keys.map((key) => caches.delete(key)))
    })(),
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

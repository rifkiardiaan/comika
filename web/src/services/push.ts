import api from './api'

/**
 * Web push notification (Web Push API + VAPID) untuk web COMIKA.
 * Subscription disimpan di backend per user; notifikasi in-app otomatis
 * ikut dikirim sebagai push ke browser yang sudah subscribe.
 */
export const push = {
  /** Dukungan browser: service worker + Push API + Notification API. */
  isSupported(): boolean {
    return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
  },

  /** Public key VAPID dari backend (base64url). `null` bila belum dikonfigurasi. */
  async getVapidPublicKey(): Promise<string | null> {
    try {
      const { data } = await api.get<{ success: boolean; data: { public_key: string } }>(
        '/push/vapid-public-key',
      )
      return data.success ? data.data.public_key : null
    } catch {
      return null
    }
  },

  /** Daftarkan service worker /sw.js (idempotent). */
  async getRegistration(): Promise<ServiceWorkerRegistration | null> {
    if (!('serviceWorker' in navigator)) return null
    try {
      return await navigator.serviceWorker.register('/sw.js')
    } catch {
      return null
    }
  },

  /** Subscription push aktif di browser ini (null bila belum subscribe). */
  async getSubscription(): Promise<PushSubscription | null> {
    const registration = await this.getRegistration()
    if (!registration) return null
    try {
      return await registration.pushManager.getSubscription()
    } catch {
      return null
    }
  },

  /**
   * Aktifkan notifikasi: minta izin, subscribe push, simpan ke backend.
   * Hanya dipanggil lewat interaksi eksplisit user (tombol di halaman profil).
   */
  async enable(): Promise<boolean> {
    if (!this.isSupported()) return false

    const publicKey = await this.getVapidPublicKey()
    if (!publicKey) return false

    const registration = await this.getRegistration()
    if (!registration) return false

    const permission = await Notification.requestPermission()
    if (permission !== 'granted') return false

    let subscription = await registration.pushManager.getSubscription()
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: publicKey,
      })
    }

    return save(subscription)
  },

  /** Nonaktifkan: hapus dari backend + unsubscribe di browser. */
  async disable(): Promise<boolean> {
    try {
      const subscription = await this.getSubscription()
      if (subscription) {
        await api.delete('/me/push/subscribe', { data: { endpoint: subscription.endpoint } })
        await subscription.unsubscribe()
      }
      return true
    } catch {
      return false
    }
  },

  /**
   * Sinkronkan subscription yang sudah ada ke backend (upsert).
   * Dipanggil saat aplikasi dimuat bila user sudah login & izin sudah diberikan,
   * agar push tetap jalan walau subscription hilang dari DB (mis. restore).
   */
  async syncExisting(): Promise<void> {
    if (!this.isSupported()) return
    if (Notification.permission !== 'granted') return
    if (!(await this.getVapidPublicKey())) return

    const subscription = await this.getSubscription()
    if (subscription) await save(subscription)
  },
}

/** Kirim subscription ke backend (upsert per endpoint). */
async function save(subscription: PushSubscription): Promise<boolean> {
  try {
    await api.post('/me/push/subscribe', {
      endpoint: subscription.endpoint,
      keys: subscription.toJSON().keys,
      user_agent: navigator.userAgent.slice(0, 255),
    })
    return true
  } catch {
    return false
  }
}

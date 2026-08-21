/**
 * Notifikasi lokal (localStorage) untuk pengajuan creator.
 * Sistem ini berjalan di sisi client karena alur creator application
 * menggunakan localStorage, bukan backend API.
 */

export interface LocalNotification {
  id: string
  type: 'creator_application_approved' | 'creator_application_rejected' | 'creator_application_submitted'
  title: string
  message: string
  read: boolean
  created_at: string
  /** ID pengajuan creator terkait */
  application_id: number
}

const STORAGE_KEY = 'comika_local_notifications'

function getAll(): LocalNotification[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

function saveAll(items: LocalNotification[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

/** Buat notifikasi baru. */
export function createNotification(
  n: Omit<LocalNotification, 'id' | 'read' | 'created_at'>,
): LocalNotification {
  const notification: LocalNotification = {
    ...n,
    id: `local_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    read: false,
    created_at: new Date().toISOString(),
  }
  const all = getAll()
  all.unshift(notification)
  saveAll(all)
  window.dispatchEvent(new Event('comika:notification'))
  return notification
}

/** Tandai satu notifikasi sudah dibaca. */
export function markRead(id: string): void {
  const all = getAll().map((n) => (n.id === id ? { ...n, read: true } : n))
  saveAll(all)
  window.dispatchEvent(new Event('comika:notification'))
}

/** Tandai semua notifikasi sudah dibaca. */
export function markAllRead(): void {
  const all = getAll().map((n) => ({ ...n, read: true }))
  saveAll(all)
  window.dispatchEvent(new Event('comika:notification'))
}

/** Jumlah notifikasi belum dibaca. */
export function unreadCount(): number {
  return getAll().filter((n) => !n.read).length
}

/** Ambil semua notifikasi. */
export function getNotifications(): LocalNotification[] {
  return getAll()
}

/** Hapus notifikasi berdasarkan ID. */
export function removeNotification(id: string): void {
  const all = getAll().filter((n) => n.id !== id)
  saveAll(all)
  window.dispatchEvent(new Event('comika:notification'))
}

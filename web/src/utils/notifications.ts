import type { AppNotification } from '../types'

/** Notifikasi lokal creator application. */
interface CreatorAppNotification {
  type: string
  application_id: number
  title?: string
  message?: string
  created_at?: string
}

/** Cek apakah ini notifikasi creator application. */
function isCreatorApp(n: AppNotification | CreatorAppNotification): n is CreatorAppNotification {
  return 'application_id' in n
}

/** Target navigasi saat sebuah notifikasi diklik. */
export function notificationTarget(n: AppNotification | CreatorAppNotification): string {
  if (isCreatorApp(n)) return '/become-creator'
  const notif = n as AppNotification
  switch (notif.type) {
    case 'new_episode':
      return `/comic/${notif.data.comic_id}/episode/${notif.data.episode_id}`
    case 'comic_update':
    case 'comment_reply':
      return `/comic/${notif.data.comic_id}`
    case 'transaction':
      return '/wallet'
    default:
      return '/notifications'
  }
}

/** Judul singkat notifikasi. */
export function notificationTitle(n: AppNotification | CreatorAppNotification): string {
  if (isCreatorApp(n)) return n.title ?? 'Pengajuan Creator'
  const notif = n as AppNotification
  switch (notif.type) {
    case 'new_episode':
      return `Episode ${notif.data.episode_number ?? ''} — ${notif.data.episode_title ?? 'Baru'}`
    case 'comic_update':
      return `Status "${notif.data.comic_title ?? 'Komik'}" diperbarui`
    case 'comment_reply':
      return 'Komentarmu dibalas'
    case 'transaction':
      return notif.data.coins != null ? 'Pembelian koin berhasil' : 'Penarikan dana diperbarui'
    default:
      return 'Notifikasi'
  }
}

/** Deskripsi pelengkap notifikasi. */
export function notificationDescription(n: AppNotification | CreatorAppNotification): string {
  if (isCreatorApp(n)) return n.message ?? ''
  const notif = n as AppNotification
  switch (notif.type) {
    case 'new_episode':
      return `Episode baru dari ${notif.data.comic_title ?? 'komik yang kamu ikuti'}`
    case 'comic_update':
      return `Status komik kini: ${statusLabel(String(notif.data.status ?? ''))}`
    case 'comment_reply':
      return notif.data.reply_snippet ?? 'Seseorang membalas komentarmu'
    case 'transaction':
      if (notif.data.coins != null) return `${notif.data.coins} koin ditambahkan ke dompetmu`
      return `Status penarikan: ${statusLabel(String(notif.data.status ?? ''))}`
    default:
      return ''
  }
}

/** Label bahasa Indonesia untuk kode status (komik & withdrawal). */
export function statusLabel(status: string): string {
  const map: Record<string, string> = {
    ongoing: 'Ongoing',
    completed: 'Completed',
    hiatus: 'Hiatus',
    pending: 'Menunggu',
    approved: 'Disetujui',
    rejected: 'Ditolak',
    paid: 'Dibayar',
  }
  return map[status] ?? status
}

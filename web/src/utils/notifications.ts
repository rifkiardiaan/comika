import type { AppNotification } from '../types'

/** Target navigasi saat sebuah notifikasi diklik. */
export function notificationTarget(n: AppNotification): string {
  switch (n.type) {
    case 'new_episode':
      return `/comic/${n.data.comic_id}/episode/${n.data.episode_id}`
    case 'comic_update':
    case 'comment_reply':
      return `/comic/${n.data.comic_id}`
    case 'transaction':
      return '/wallet'
    default:
      return '/notifications'
  }
}

/** Judul singkat notifikasi. */
export function notificationTitle(n: AppNotification): string {
  switch (n.type) {
    case 'new_episode':
      return `Episode ${n.data.episode_number ?? ''} — ${n.data.episode_title ?? 'Baru'}`
    case 'comic_update':
      return `Status "${n.data.comic_title ?? 'Komik'}" diperbarui`
    case 'comment_reply':
      return 'Komentarmu dibalas'
    case 'transaction':
      return n.data.coins != null ? 'Pembelian koin berhasil' : 'Penarikan dana diperbarui'
    default:
      return 'Notifikasi'
  }
}

/** Deskripsi pelengkap notifikasi. */
export function notificationDescription(n: AppNotification): string {
  switch (n.type) {
    case 'new_episode':
      return `Episode baru dari ${n.data.comic_title ?? 'komik yang kamu ikuti'}`
    case 'comic_update':
      return `Status komik kini: ${statusLabel(String(n.data.status ?? ''))}`
    case 'comment_reply':
      return n.data.reply_snippet ?? 'Seseorang membalas komentarmu'
    case 'transaction':
      if (n.data.coins != null) return `${n.data.coins} koin ditambahkan ke dompetmu`
      return `Status penarikan: ${statusLabel(String(n.data.status ?? ''))}`
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

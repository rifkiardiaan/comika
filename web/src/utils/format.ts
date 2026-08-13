export const formatNumber = (n: number): string => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}jt`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}rb`
  return String(n)
}

export const formatRupiah = (n: number): string => `Rp${n.toLocaleString('id-ID')}`

export const formatDate = (date: string | null | undefined): string => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export const timeAgo = (date: string): string => {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  const intervals: Array<[number, string]> = [
    [31536000, 'tahun'],
    [2592000, 'bulan'],
    [604800, 'minggu'],
    [86400, 'hari'],
    [3600, 'jam'],
    [60, 'menit'],
  ]
  for (const [secs, label] of intervals) {
    const count = Math.floor(seconds / secs)
    if (count >= 1) return `${count} ${label} lalu`
  }
  return 'baru saja'
}

export const readingTime = (pages: number): string => {
  const minutes = Math.max(1, Math.round(pages / 6))
  return `${minutes} mnt baca`
}

/**
 * Ubah path storage relatif (mis. "avatars/x.png") menjadi URL absolut
 * yang bisa dirender. Backend menyimpan path di kolom *_url; file diakses
 * via /storage/ di host API.
 */
export const assetUrl = (path: string | null | undefined): string | null => {
  if (!path) return null
  if (/^https?:\/\//.test(path)) return path
  const base = import.meta.env.VITE_API_URL ?? '/api/v1'
  // VITE_API_URL bisa berupa path relatif ("/api/v1") atau URL absolut
  const apiBase = /^https?:\/\//.test(base) ? new URL(base).origin : window.location.origin
  return `${apiBase}/storage/${path.replace(/^\//, '')}`
}

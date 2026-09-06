import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AlertCircle,
  Bookmark,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  FileImage,
  Loader2,
  LogIn,
  Trash2,
  WifiOff,
} from 'lucide-react'
import { auth } from '../services/auth'
import { dbListComics, dbDeleteComic, type OfflineComic, type StoredEpisode } from '../services/offlineDb'
import { coverEmoji, coverKeyOf, coverStyle } from '../data/mock'
import AdBanner from '../components/AdBanner'

interface ReaderState {
  comic: OfflineComic
  episode: StoredEpisode
}

export default function KomikOfflinePage() {
  const [user] = useState(() => auth.getStoredUser())
  const [entries, setEntries] = useState<OfflineComic[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [coverUrls, setCoverUrls] = useState<Record<number, string>>({})
  const [isOffline, setIsOffline] = useState(!navigator.onLine)
  const navigate = useNavigate()

  // Iklan di komik offline hanya untuk akun non-premium & non-vvip
  const showAds = !(user?.is_premium ?? false) && !(user?.is_vvip ?? false)
  const handleUpgrade = () => {
    if (navigator.onLine) navigate('/premium')
  }

  // Alur tampilan: daftar → detail komik → reader episode
  const [selected, setSelected] = useState<OfflineComic | null>(null)
  const [reader, setReader] = useState<ReaderState | null>(null)
  const [pageIndex, setPageIndex] = useState(0)
  const [readerUrls, setReaderUrls] = useState<string[]>([])
  const [confirmRemove, setConfirmRemove] = useState<OfflineComic | null>(null)

  useEffect(() => {
    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError('')
    try {
      const items = await dbListComics(user.id)
      setEntries(items)
    } catch {
      setError('Gagal membaca penyimpanan offline browser.')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    load()
  }, [load])

  // Buat object URL untuk cover
  useEffect(() => {
    const urls: Record<number, string> = {}
    for (const entry of entries) {
      if (entry.coverBlob && !urls[entry.comicId]) {
        urls[entry.comicId] = URL.createObjectURL(entry.coverBlob)
      }
    }
    setCoverUrls(urls)
    return () => {
      for (const url of Object.values(urls)) URL.revokeObjectURL(url)
    }
  }, [entries])

  // Buat object URL halaman saat membuka reader
  useEffect(() => {
    if (!reader) {
      setReaderUrls([])
      return
    }
    const urls = reader.episode.pages.map((p) => URL.createObjectURL(p.blob))
    setReaderUrls(urls)
    setPageIndex(0)
    return () => {
      for (const url of urls) URL.revokeObjectURL(url)
    }
  }, [reader])

  const removeComic = async () => {
    if (!confirmRemove || !user) return
    try {
      await dbDeleteComic(user.id, confirmRemove.comicId)
      setEntries((prev) => prev.filter((e) => e.comicId !== confirmRemove.comicId))
      setConfirmRemove(null)
    } catch {
      setError('Gagal menghapus komik offline.')
    }
  }

  if (!user) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-500/15 text-brand-300">
          <Download size={30} />
        </span>
        <h1 className="mt-5 font-display text-2xl font-bold text-surface-50">Masuk untuk Komik Offline</h1>
        <p className="mt-2 text-sm text-surface-400">
          Simpan komik favoritmu untuk dibaca secara offline.
        </p>
        <a
          href="/login"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-pink-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-600/25 transition-all hover:brightness-110"
        >
          <LogIn size={16} /> Masuk Sekarang
        </a>
      </div>
    )
  }

  // ===== Reader episode offline (full screen) =====
  if (reader) {
    const totalPages = readerUrls.length
    const hasPrevPage = pageIndex > 0
    const hasNextPage = pageIndex < totalPages - 1
    const episodeIndex = selected?.episodes.findIndex((e) => e.id === reader.episode.id) ?? -1
    const nextEpisode = selected && episodeIndex >= 0 ? selected.episodes[episodeIndex + 1] : undefined

    return (
      <div className="flex min-h-screen flex-col bg-surface-950">
        {/* Header reader */}
        <div className="sticky top-0 z-30 border-b border-surface-800 bg-surface-950/95 px-4 py-3 backdrop-blur-sm">
          <div className="mx-auto flex max-w-3xl items-center gap-3">
            <button
              onClick={() => setReader(null)}
              className="rounded-lg p-2 text-surface-400 transition-colors hover:bg-surface-800 hover:text-surface-50"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-surface-100">
                {reader.comic.comic.title} — Ep. {reader.episode.number}
              </p>
              <p className="text-xs text-surface-500">
                {totalPages > 0 ? `Halaman ${pageIndex + 1} dari ${totalPages}` : 'Episode tidak punya halaman offline'}
              </p>
            </div>
            <span className="rounded-full bg-emerald-500/15 px-2 py-1 text-[10px] font-bold text-emerald-300">
              <WifiOff size={10} className="mr-1 inline" />Offline
            </span>
          </div>
        </div>

        {/* Halaman gambar */}
        <div className="mx-auto w-full max-w-3xl flex-1 px-2 py-4">
          {totalPages === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center text-surface-500">
              <FileImage size={28} className="mb-3 text-surface-600" />
              <p className="text-sm">Episode ini tidak memiliki halaman yang tersimpan offline.</p>
              <p className="mt-1 max-w-sm text-xs leading-relaxed text-surface-600">
                {reader.episode.locked === true || (reader.episode.is_premium && reader.episode.pages.length === 0)
                  ? 'Episode premium ini masih terkunci sehingga halamannya tidak ikut diunduh. Saat online: buka episode dengan koin atau lewat akun VVIP, lalu tekan "Download Offline" lagi di halaman komik agar halamannya tersimpan.'
                  : 'Komik ini kemungkinan diunduh sebelum episode-nya terbit / unduhan tidak lengkap. Saat online: buka halaman komik lalu tekan "Download Offline" untuk mengunduh ulang.'}
              </p>
              <button
                onClick={() => setReader(null)}
                className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-surface-700 px-4 py-2 text-xs font-semibold text-surface-300 transition-colors hover:bg-surface-800"
              >
                <ChevronLeft size={14} /> Kembali
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {readerUrls.map((url, i) => {
                // Iklan setiap 3 halaman (sama seperti reader online) —
                // hanya untuk akun non-premium/non-vvip. AdBanner 100% lokal,
                // tetap tampil walau tidak ada koneksi internet.
                const showAd = showAds && (i + 1) % 3 === 0 && i < totalPages - 1
                return (
                  <div key={i}>
                    <img
                      src={url}
                      alt={`Halaman ${i + 1}`}
                      className="w-full rounded-lg bg-surface-900"
                      loading="lazy"
                    />
                    {showAd && <AdBanner onUpgrade={handleUpgrade} variant="full" />}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Navigasi bawah */}
        {totalPages > 1 && (
          <div className="sticky bottom-0 z-30 border-t border-surface-800 bg-surface-950/95 px-4 py-3 backdrop-blur-sm">
            <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
              <button
                onClick={() => setPageIndex((p) => Math.max(0, p - 1))}
                disabled={!hasPrevPage}
                className="inline-flex items-center gap-1 rounded-lg border border-surface-700 px-3 py-2 text-xs font-semibold text-surface-200 transition-colors hover:bg-surface-800 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={14} /> Sebelumnya
              </button>
              <span className="text-xs text-surface-400">{pageIndex + 1} / {totalPages}</span>
              {nextEpisode && pageIndex === totalPages - 1 ? (
                <button
                  onClick={() => setReader({ comic: reader.comic, episode: nextEpisode })}
                  className="inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-brand-600 to-pink-600 px-3 py-2 text-xs font-semibold text-white transition-all hover:brightness-110"
                >
                  Ep. {nextEpisode.number} <ChevronRight size={14} />
                </button>
              ) : (
                <button
                  onClick={() => setPageIndex((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={!hasNextPage}
                  className="inline-flex items-center gap-1 rounded-lg border border-surface-700 px-3 py-2 text-xs font-semibold text-surface-200 transition-colors hover:bg-surface-800 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Berikutnya <ChevronRight size={14} />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  // ===== Detail komik offline (daftar episode) =====
  if (selected) {
    const coverUrl = coverUrls[selected.comicId]
    return (
      <div className="mx-auto max-w-4xl animate-fade-in px-4 py-8 sm:px-6">
        <button
          onClick={() => setSelected(null)}
          className="inline-flex items-center gap-1.5 text-sm text-surface-400 transition-colors hover:text-surface-200"
        >
          <ChevronLeft size={16} /> Kembali ke Komik Offline
        </button>

        <div className="mt-4 flex items-center gap-5 rounded-2xl border border-surface-800 bg-surface-900 p-5">
          {coverUrl ? (
            <img src={coverUrl} alt={selected.comic.title} className="h-28 w-20 rounded-xl object-cover" />
          ) : (
            <span
              className="flex h-28 w-20 shrink-0 items-center justify-center rounded-xl text-3xl"
              style={{ background: coverStyle(coverKeyOf(selected.comicId)) }}
            >
              {coverEmoji(coverKeyOf(selected.comicId))}
            </span>
          )}
          <div className="min-w-0">
            <h1 className="font-display text-xl font-bold text-surface-50">{selected.comic.title}</h1>
            <p className="mt-1 text-xs text-surface-400">
              {selected.totalEpisodes} episode tersimpan · {selected.totalPages} halaman gambar
            </p>
            {selected.totalPages === 0 && (
              <p className="mt-1 text-[11px] leading-snug text-amber-300/90">
                ⚠ Unduhan belum menyimpan halaman (komik diunduh sebelum episode terbit / terkunci).
                Saat online, hapus lalu unduh ulang dari halaman komik.
              </p>
            )}
            <button
              onClick={() => setConfirmRemove(selected)}
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-400 transition-colors hover:bg-red-500/20"
            >
              <Trash2 size={13} /> Hapus dari Offline
            </button>
          </div>
        </div>

        {showAds && <AdBanner onUpgrade={handleUpgrade} variant="banner" />}

        <h2 className="mt-8 font-display text-lg font-bold text-surface-50">Episode ({selected.episodes.length})</h2>
        <div className="mt-3 space-y-2">
          {selected.episodes.map((ep) => {
            const pageCount = ep.pages.length
            const isLockedPremium = ep.locked === true || (ep.is_premium && pageCount === 0)
            return (
              <button
                key={ep.id}
                onClick={() => setReader({ comic: selected, episode: ep })}
                className={`flex w-full items-center gap-3 rounded-xl border border-surface-800 bg-surface-900 p-3 text-left transition-colors hover:border-brand-500/50 ${
                  isLockedPremium ? 'opacity-80' : ''
                }`}
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-800 font-display text-sm font-bold text-surface-300">
                  {ep.number}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-surface-100">{ep.title}</span>
                {ep.is_premium && (
                  <span className="shrink-0 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-300">Premium</span>
                )}
                <span className="shrink-0 text-xs text-surface-500">
                  {pageCount > 0 ? `${pageCount} halaman` : isLockedPremium ? '🔒 Terkunci premium' : '0 halaman tersimpan'}
                </span>
                <ChevronRight size={16} className="shrink-0 text-surface-500" />
              </button>
            )
          })}
          {(selected.totalPages === 0 || selected.skippedLocked) && (
            <p className="mt-4 rounded-xl border border-amber-500/20 bg-amber-950/30 px-4 py-3 text-[11px] leading-relaxed text-amber-300/90">
              {selected.skippedLocked && selected.skippedLocked > 0
                ? `${selected.skippedLocked} episode premium terkunci tidak ikut diunduh. Buka episode dengan koin atau aktifkan VVIP saat online, lalu tekan "Download Offline" lagi di halaman komik agar halamannya ikut tersimpan.`
                : 'Unduhan ini tidak memiliki halaman (komik diunduh sebelum episode terbit / data lama). Saat online: hapus lalu unduh ulang dari halaman komik.'}
            </p>
          )}
        </div>
      </div>
    )
  }

  // ===== Daftar komik offline =====
  return (
    <div className="mx-auto max-w-7xl animate-fade-in px-4 py-10 sm:px-6">
      {isOffline && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-amber-500/30 bg-amber-950/50 px-5 py-4">
          <WifiOff size={20} className="shrink-0 text-amber-400" />
          <div>
            <p className="text-sm font-semibold text-amber-200">Mode Offline</p>
            <p className="text-xs text-amber-400/80">
              Kamu sedang offline. Komik di bawah ini sudah tersimpan dan bisa dibaca tanpa internet.
            </p>
          </div>
        </div>
      )}

      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/15">
          <Download size={20} className="text-brand-300" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold text-surface-50">Komik Offline</h1>
          <p className="mt-0.5 text-sm text-surface-400">
            {entries.length} komik tersimpan untuk offline · {entries.reduce((sum, e) => sum + e.totalPages, 0)} halaman
          </p>
        </div>
      </div>

      {showAds && (
        <AdBanner onUpgrade={handleUpgrade} variant="banner" />
      )}

      {error && (
        <div className="mt-6 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-300">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <div className="mt-8">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-surface-500">
            <Loader2 size={20} className="mr-2 animate-spin" /> Memuat komik offline…
          </div>
        ) : entries.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-surface-800 bg-surface-900/40 p-12 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-800">
              <Bookmark size={28} className="text-surface-500" />
            </div>
            <h3 className="mt-4 font-display text-lg font-bold text-surface-100">Belum ada komik offline</h3>
            <p className="mx-auto mt-2 max-w-sm text-sm text-surface-400">
              Buka halaman komik lalu tekan tombol <strong>"Download Offline"</strong> — seluruh episode akan diunduh
              sebagai gambar untuk dibaca tanpa internet.
            </p>
            <a
              href="/discover"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-pink-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-600/25 transition-all hover:brightness-110"
            >
              Jelajahi Komik
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {entries.map((entry) => {
              const coverUrl = coverUrls[entry.comicId]
              const savedPages = entry.totalPages
              return (
                <div key={entry.key} className="group relative">
                  <button
                    onClick={() => setSelected(entry)}
                    className="block w-full text-left"
                    title={`Baca "${entry.comic.title}" offline`}
                  >
                    <div className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-surface-800 bg-surface-900">
                      {coverUrl ? (
                        <img src={coverUrl} alt={entry.comic.title} className="h-full w-full object-cover" />
                      ) : (
                        <span
                          className="flex h-full w-full items-center justify-center text-4xl"
                          style={{ background: coverStyle(coverKeyOf(entry.comicId)) }}
                        >
                          {coverEmoji(coverKeyOf(entry.comicId))}
                        </span>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      <div className="absolute bottom-2 left-2 right-2">
                        <p className="truncate text-sm font-bold text-white drop-shadow">{entry.comic.title}</p>
                        <p className="text-[10px] text-emerald-300">
                          <CheckCircle2 size={9} className="mr-0.5 inline" />
                          {entry.totalEpisodes} ep · {savedPages} hlm
                        </p>
                      </div>
                      {savedPages === 0 && (
                        <span className="absolute left-2 top-2 rounded-full bg-red-500/90 px-2 py-0.5 text-[9px] font-bold text-white">
                          Belum ada halaman
                        </span>
                      )}
                    </div>
                  </button>
                  <button
                    onClick={() => setConfirmRemove(entry)}
                    className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-red-500/90 text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100"
                    title="Hapus dari offline"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Konfirmasi hapus */}
      {confirmRemove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setConfirmRemove(null)}>
          <div className="w-full max-w-sm rounded-2xl border border-surface-700 bg-surface-900 p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/15">
                <Trash2 size={18} className="text-red-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-surface-50">Hapus dari Offline?</h3>
                <p className="mt-0.5 text-xs text-surface-400">
                  "{confirmRemove.comic.title}" beserta seluruh halamannya akan dihapus dari penyimpanan offline.
                </p>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setConfirmRemove(null)}
                className="rounded-lg border border-surface-700 px-4 py-2 text-xs font-semibold text-surface-300 transition-colors hover:bg-surface-800"
              >
                Batal
              </button>
              <button
                onClick={() => void removeComic()}
                className="rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-red-500"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

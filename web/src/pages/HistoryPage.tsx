import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertCircle, Clock, Loader2, LogIn, Play } from 'lucide-react'
import PageHeader from '../components/admin/PageHeader'
import EmptyState from '../components/admin/EmptyState'
import Pagination from '../components/admin/Pagination'
import { auth } from '../services/auth'
import { community } from '../services/community'
import { getApiErrorMessage } from '../utils/errors'
import { coverEmoji, coverKeyOf, coverStyle } from '../data/mock'
import { formatDate } from '../utils/format'
import type { ReadingHistory } from '../types'

export default function HistoryPage() {
  const [user] = useState(() => auth.getStoredUser())
  const [items, setItems] = useState<ReadingHistory[]>([])
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 })
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchHistory = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await community.history(page)
      setItems(res.data)
      setMeta(res.meta)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Gagal memuat riwayat baca.'))
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => {
    if (user) fetchHistory()
  }, [user, fetchHistory])

  if (!user) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-500/15 text-brand-300">
          <Clock size={30} />
        </span>
        <h1 className="mt-5 font-display text-2xl font-bold text-surface-50">Masuk untuk Melihat Riwayat</h1>
        <p className="mt-2 text-sm text-surface-400">
          Riwayat baca tersinkron dengan akun kamu di semua perangkat.
        </p>
        <Link
          to="/login"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-pink-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-600/25 transition-all hover:brightness-110"
        >
          <LogIn size={16} /> Masuk Sekarang
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl animate-fade-in px-4 py-10 sm:px-6">
      <PageHeader
        title="Riwayat Baca"
        subtitle="Lanjutkan membaca komik dari posisi terakhir kamu"
      />

      {error && (
        <div className="mb-6 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-300">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-surface-800 bg-surface-900">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-surface-500">
            <Loader2 size={20} className="mr-2 animate-spin" /> Memuat riwayat…
          </div>
        ) : items.length === 0 ? (
          <div className="p-6">
            <EmptyState message="Belum ada riwayat baca. Mulai membaca komik favoritmu!" />
          </div>
        ) : (
          <ul className="divide-y divide-surface-800/60">
            {items.map((item) => {
              const comic = item.comic
              const episode = item.episode
              if (!comic) return null
              return (
                <li key={item.id} className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-surface-800/30">
                  <Link to={`/comic/${comic.id}`} className="shrink-0">
                    <span
                      className="flex h-20 w-14 items-center justify-center rounded-xl text-xl shadow-lg shadow-black/30"
                      style={{ background: coverStyle(coverKeyOf(comic.id)) }}
                    >
                      {coverEmoji(coverKeyOf(comic.id))}
                    </span>
                  </Link>

                  <div className="min-w-0 flex-1">
                    <Link to={`/comic/${comic.id}`} className="truncate text-sm font-semibold text-surface-100 transition-colors hover:text-brand-300">
                      {comic.title}
                    </Link>
                    <p className="mt-0.5 truncate text-xs text-surface-400">
                      {episode ? `Episode ${episode.number}: ${episode.title}` : 'Belum ada episode'}
                    </p>
                    <p className="mt-0.5 text-[11px] text-surface-500">
                      Terakhir dibaca {formatDate(item.updated_at)}
                    </p>

                    {/* Progress bar */}
                    <div className="mt-2 flex items-center gap-3">
                      <div className="h-1.5 w-full max-w-64 overflow-hidden rounded-full bg-surface-800">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-brand-500 to-pink-500 transition-all"
                          style={{ width: `${Math.min(100, item.progress)}%` }}
                        />
                      </div>
                      <span className="shrink-0 text-[11px] text-surface-500">
                        {item.is_completed ? 'Selesai' : `${Math.min(100, Math.round(item.progress))}%`}
                      </span>
                    </div>
                  </div>

                  {episode && (
                    <Link
                      to={`/comic/${comic.id}/episode/${episode.id}`}
                      className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-pink-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-600/25 transition-all hover:brightness-110"
                    >
                      <Play size={14} fill="currentColor" />
                      {item.is_completed ? 'Baca Lagi' : 'Lanjutkan'}
                    </Link>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {!loading && items.length > 0 && <Pagination meta={meta} onPageChange={setPage} />}
    </div>
  )
}

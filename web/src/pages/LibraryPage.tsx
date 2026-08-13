import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertCircle, Bookmark, Clock, Heart, Loader2, LogIn, Play } from 'lucide-react'
import ComicCard from '../components/ComicCard'
import Pagination from '../components/admin/Pagination'
import { auth } from '../services/auth'
import { community } from '../services/community'
import { getApiErrorMessage } from '../utils/errors'
import { coverEmoji, coverKeyOf, coverStyle } from '../data/mock'
import { formatDate } from '../utils/format'
import type { BookmarkItem, FollowItem, ReadingHistory } from '../types'

const tabs = [
  { key: 'follows', label: 'Mengikuti', icon: Heart },
  { key: 'bookmarks', label: 'Bookmark', icon: Bookmark },
  { key: 'history', label: 'Riwayat', icon: Clock },
] as const

type TabKey = (typeof tabs)[number]['key']

export default function LibraryPage() {
  const [user] = useState(() => auth.getStoredUser())
  const [tab, setTab] = useState<TabKey>('follows')
  const [follows, setFollows] = useState<FollowItem[]>([])
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([])
  const [history, setHistory] = useState<ReadingHistory[]>([])
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 })
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchAll = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError('')
    try {
      const [f, b, h] = await Promise.all([community.follows(page), community.bookmarks(page), community.history(page)])
      setFollows(f.data)
      setBookmarks(b.data)
      setHistory(h.data)
      setMeta(
        tab === 'follows' ? f.meta : tab === 'bookmarks' ? b.meta : h.meta,
      )
    } catch (err) {
      setError(getApiErrorMessage(err, 'Gagal memuat perpustakaan.'))
    } finally {
      setLoading(false)
    }
  }, [user, page, tab])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  if (!user) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-500/15 text-brand-300">
          <Bookmark size={30} />
        </span>
        <h1 className="mt-5 font-display text-2xl font-bold text-surface-50">Masuk untuk Menggunakan Perpustakaan</h1>
        <p className="mt-2 text-sm text-surface-400">
          Simpan, ikuti, dan lacak komik favoritmu dengan satu akun COMIKA.
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
      <h1 className="font-display text-3xl font-bold text-surface-50">Perpustakaan</h1>
      <p className="mt-1 text-sm text-surface-400">Komik yang kamu ikuti, simpan, dan baca</p>

      <div className="mt-6 flex flex-wrap gap-2">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => {
              setTab(key)
              setPage(1)
            }}
            className={`flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium transition-all ${
              tab === key
                ? 'bg-gradient-to-r from-brand-600 to-pink-600 text-white shadow-lg shadow-brand-600/25'
                : 'border border-surface-800 bg-surface-900 text-surface-300 hover:border-brand-500/50 hover:text-surface-50'
            }`}
          >
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {error && (
        <div className="mt-6 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-300">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <div className="mt-8">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-surface-500">
            <Loader2 size={20} className="mr-2 animate-spin" /> Memuat perpustakaan…
          </div>
        ) : (tab === 'follows' ? follows : tab === 'bookmarks' ? bookmarks : history).length === 0 ? (
          <div className="rounded-2xl border border-dashed border-surface-800 bg-surface-900/40 p-12 text-center text-sm text-surface-400">
            {tab === 'follows' && 'Belum ada komik yang kamu ikuti. Jelajahi komik dan klik "Ikuti"!'}
            {tab === 'bookmarks' && 'Belum ada bookmark. Simpan komik favoritmu untuk dibaca lagi!'}
            {tab === 'history' && 'Belum ada riwayat baca. Mulai membaca komik favoritmu!'}
          </div>
        ) : tab === 'history' ? (
          /* Riwayat — list dengan progress */
          <ul className="space-y-3">
            {history.map((item) => {
              const comic = item.comic
              if (!comic) return null
              return (
                <li key={item.id} className="flex items-center gap-4 rounded-2xl border border-surface-800 bg-surface-900 p-4 transition-colors hover:border-surface-700">
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
                      {item.episode ? `Episode ${item.episode.number}: ${item.episode.title}` : '—'}
                    </p>
                    <div className="mt-2 flex items-center gap-3">
                      <div className="h-1.5 w-full max-w-56 overflow-hidden rounded-full bg-surface-800">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-brand-500 to-pink-500"
                          style={{ width: `${Math.min(100, item.progress)}%` }}
                        />
                      </div>
                      <span className="shrink-0 text-[11px] text-surface-500">{formatDate(item.updated_at)}</span>
                    </div>
                  </div>
                  {item.episode && (
                    <Link
                      to={`/comic/${comic.id}/episode/${item.episode.id}`}
                      className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-pink-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-600/25 transition-all hover:brightness-110"
                    >
                      <Play size={14} fill="currentColor" /> {item.is_completed ? 'Baca Lagi' : 'Lanjutkan'}
                    </Link>
                  )}
                </li>
              )
            })}
          </ul>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {(tab === 'follows' ? follows : bookmarks).map((item) => (
              <ComicCard key={item.id} comic={item.comic} compact />
            ))}
          </div>
        )}
      </div>

      {!loading && ((tab === 'follows' ? follows : tab === 'bookmarks' ? bookmarks : history)).length > 0 && (
        <Pagination meta={meta} onPageChange={setPage} />
      )}
    </div>
  )
}

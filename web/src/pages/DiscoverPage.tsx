import { useCallback, useEffect, useState } from 'react'
import { AlertCircle, Loader2, SlidersHorizontal } from 'lucide-react'
import ComicCard from '../components/ComicCard'
import Pagination from '../components/admin/Pagination'
import { content } from '../services/content'
import { mockComics } from '../data/mock'
import { getApiErrorMessage } from '../utils/errors'
import type { Comic, Genre } from '../types'

type Sort = 'popular' | 'rating' | 'newest'

export default function DiscoverPage() {
  const [genres, setGenres] = useState<Genre[]>([])
  const [activeGenre, setActiveGenre] = useState<string | null>(null)
  const [sort, setSort] = useState<Sort>('popular')
  const [comics, setComics] = useState<Comic[]>([])
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 })
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    content.genres().then(setGenres).catch(() => {})
  }, [])

  const fetchComics = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await content.comics({
        genre: activeGenre ?? undefined,
        sort,
        page,
      })
      // Fallback ke mock data jika API kosong
      if (res.data.length === 0 && !activeGenre) {
        setComics(mockComics)
        setMeta({ current_page: 1, last_page: 1, total: mockComics.length })
      } else {
        setComics(res.data)
        setMeta(res.meta)
      }
    } catch (err) {
      setError(getApiErrorMessage(err, 'Gagal memuat daftar komik.'))
    } finally {
      setLoading(false)
    }
  }, [activeGenre, sort, page])

  useEffect(() => {
    fetchComics()
  }, [fetchComics])

  return (
    <div className="mx-auto max-w-7xl animate-fade-in px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl font-bold text-surface-50">Jelajahi Komik</h1>
      <p className="mt-1 text-sm text-surface-400">Temukan komik baru dan favorit dari seluruh creator</p>

      {/* Genre filter */}
      <div className="no-scrollbar mt-6 flex gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => {
            setActiveGenre(null)
            setPage(1)
          }}
          className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
            activeGenre === null
              ? 'bg-gradient-to-r from-brand-600 to-pink-600 text-white shadow-lg shadow-brand-600/25'
              : 'border border-surface-800 bg-surface-900 text-surface-300 hover:border-brand-500/50 hover:text-surface-50'
          }`}
        >
          Semua
        </button>
        {genres.map((gen) => (
          <button
            key={gen.id}
            onClick={() => {
              setActiveGenre(activeGenre === gen.slug ? null : gen.slug)
              setPage(1)
            }}
            className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
              activeGenre === gen.slug
                ? 'bg-gradient-to-r from-brand-600 to-pink-600 text-white shadow-lg shadow-brand-600/25'
                : 'border border-surface-800 bg-surface-900 text-surface-300 hover:border-brand-500/50 hover:text-surface-50'
            }`}
          >
            {gen.name}
          </button>
        ))}
      </div>

      {/* Sort */}
      <div className="mt-5 flex items-center gap-3">
        <SlidersHorizontal size={15} className="text-surface-400" />
        {(
          [
            ['popular', 'Terpopuler'],
            ['rating', 'Rating Tertinggi'],
            ['newest', 'Terbaru'],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            onClick={() => {
              setSort(value as Sort)
              setPage(1)
            }}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              sort === value
                ? 'bg-brand-500/15 text-brand-300'
                : 'text-surface-400 hover:bg-surface-800/60 hover:text-surface-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {error && (
        <div className="mt-5 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-300">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-24 text-surface-500">
          <Loader2 size={20} className="mr-2 animate-spin" /> Memuat komik…
        </div>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {comics.map((comic) => (
              <ComicCard key={comic.id} comic={comic} />
            ))}
          </div>
          {comics.length === 0 && (
            <div className="mt-16 text-center text-surface-400">Tidak ada komik di kategori ini.</div>
          )}
          {comics.length > 0 && <Pagination meta={meta} onPageChange={setPage} />}
        </>
      )}
    </div>
  )
}

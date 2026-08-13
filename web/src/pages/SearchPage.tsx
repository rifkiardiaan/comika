import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AlertCircle, Loader2, SearchX } from 'lucide-react'
import ComicCard from '../components/ComicCard'
import Pagination from '../components/admin/Pagination'
import { content } from '../services/content'
import { getApiErrorMessage } from '../utils/errors'
import type { Comic } from '../types'

export default function SearchPage() {
  const [params] = useSearchParams()
  const query = (params.get('q') ?? '').trim()

  const [comics, setComics] = useState<Comic[]>([])
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 })
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchResults = useCallback(async (targetPage = page) => {
    if (!query) {
      setComics([])
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await content.comics({ q: query, page: targetPage })
      setComics(res.data)
      setMeta(res.meta)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Gagal melakukan pencarian.'))
    } finally {
      setLoading(false)
    }
  }, [query, page])

  useEffect(() => {
    setPage(1)
    // Reset halaman saat query berubah; fetch mengikuti render berikutnya
  }, [query])

  useEffect(() => {
    fetchResults()
  }, [fetchResults])

  return (
    <div className="mx-auto max-w-7xl animate-fade-in px-4 py-10 sm:px-6">
      <h1 className="font-display text-2xl font-bold text-surface-50">
        Hasil pencarian: <span className="text-brand-300">“{query || '-'}”</span>
      </h1>
      <p className="mt-1 text-sm text-surface-400">{loading ? 'Mencari…' : `${meta.total} komik ditemukan`}</p>

      {error && (
        <div className="mt-5 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-300">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {loading ? (
        <div className="mt-10 flex items-center justify-center py-16 text-surface-500">
          <Loader2 size={20} className="mr-2 animate-spin" /> Mencari…
        </div>
      ) : comics.length > 0 ? (
        <>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {comics.map((comic) => (
              <ComicCard key={comic.id} comic={comic} />
            ))}
          </div>
          {comics.length > 0 && <Pagination meta={meta} onPageChange={setPage} />}
        </>
      ) : (
        query && (
          <div className="mt-20 flex flex-col items-center gap-3 text-surface-400">
            <SearchX size={40} className="text-surface-600" />
            <p>Tidak ada hasil untuk pencarian ini.</p>
          </div>
        )
      )}
    </div>
  )
}

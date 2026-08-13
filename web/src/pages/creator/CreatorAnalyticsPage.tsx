import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  AlertCircle,
  ArrowLeft,
  Bookmark,
  Eye,
  FileImage,
  Heart,
  Loader2,
  MessageSquare,
  Star,
  TrendingUp,
  Users,
} from 'lucide-react'
import PageHeader from '../../components/admin/PageHeader'
import { StatusBadge } from '../../components/admin/Badge'
import { auth } from '../../services/auth'
import { creator } from '../../services/creator'
import { getApiErrorMessage } from '../../utils/errors'
import { formatNumber } from '../../utils/format'
import type { ComicAnalytics } from '../../types'

export default function CreatorAnalyticsPage() {
  const { id } = useParams()
  const [user] = useState(() => auth.getStoredUser())
  const [data, setData] = useState<ComicAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setData(await creator.analytics(id!))
    } catch (err) {
      setError(getApiErrorMessage(err, 'Gagal memuat analitik.'))
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    if (id && user?.role === 'creator') fetchData()
  }, [id, user, fetchData])

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-surface-500">
        <Loader2 size={22} className="mr-2 animate-spin" /> Memuat analitik…
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 text-center">
        <AlertCircle size={36} className="text-red-400" />
        <h1 className="mt-4 font-display text-2xl font-bold text-surface-50">Analitik Tidak Tersedia</h1>
        <p className="mt-2 text-sm text-surface-400">{error}</p>
        <Link
          to="/creator/comics"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-pink-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-600/25 transition-all hover:brightness-110"
        >
          <ArrowLeft size={16} /> Kembali ke Komik
        </Link>
      </div>
    )
  }

  const s = data.summary

  return (
    <div className="mx-auto max-w-7xl animate-fade-in px-4 py-10 sm:px-6">
      <Link
        to={`/creator/comics/${data.comic.id}`}
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-surface-400 transition-colors hover:text-surface-50"
      >
        <ArrowLeft size={15} /> {data.comic.title}
      </Link>
      <PageHeader
        title="Analitik Komik"
        subtitle={`Ringkasan performa "${data.comic.title}"`}
      />

      {error && (
        <div className="mb-6 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-300">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* ====== Summary ====== */}
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <SummaryCard icon={<Eye size={18} className="text-emerald-300" />} label="Total Dibaca" value={formatNumber(s.views)} />
        <SummaryCard icon={<Heart size={18} className="text-pink-300" />} label="Suka" value={formatNumber(s.likes)} />
        <SummaryCard icon={<Star size={18} className="text-amber-300" />} label="Rating" value={`${s.rating_avg.toFixed(1)} (${formatNumber(s.rating_count)})`} />
        <SummaryCard icon={<Users size={18} className="text-brand-300" />} label="Pengikut" value={formatNumber(s.followers)} />
        <SummaryCard icon={<Bookmark size={18} className="text-amber-300" />} label="Bookmark" value={formatNumber(s.bookmarks)} />
        <SummaryCard icon={<MessageSquare size={18} className="text-teal-300" />} label="Komentar" value={formatNumber(s.comments)} />
        <SummaryCard icon={<FileImage size={18} className="text-sky-300" />} label="Episode Terbit" value={`${s.published_episodes}/${s.episodes}`} />
        <SummaryCard icon={<TrendingUp size={18} className="text-emerald-300" />} label="Draft" value={String(s.draft_episodes)} />
      </section>

      {/* ====== Per-episode ====== */}
      <section className="mt-10">
        <h2 className="font-display text-lg font-bold text-surface-50">Performa per Episode</h2>
        <div className="mt-4 overflow-hidden rounded-2xl border border-surface-800 bg-surface-900">
          {data.episodes.length === 0 ? (
            <p className="px-5 py-14 text-center text-sm text-surface-500">Belum ada episode pada komik ini.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead>
                  <tr className="border-b border-surface-800 text-xs uppercase tracking-wide text-surface-500">
                    <th className="px-5 py-3 font-medium">Episode</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 text-center font-medium">Halaman</th>
                    <th className="px-5 py-3 text-right font-medium">Views</th>
                    <th className="px-5 py-3 text-right font-medium">Suka</th>
                    <th className="px-5 py-3 text-right font-medium">Komentar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-800/60">
                  {data.episodes.map((ep) => (
                    <tr key={ep.id} className="transition-colors hover:bg-surface-800/30">
                      <td className="px-5 py-3.5">
                        <p className="flex items-center gap-2 font-medium text-surface-100">
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-surface-800 text-xs font-bold text-surface-300">
                            {ep.number}
                          </span>
                          <span className="max-w-64 truncate">{ep.title}</span>
                          {ep.is_premium && (
                            <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold text-amber-300">
                              {ep.price_coin} koin
                            </span>
                          )}
                        </p>
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={ep.status} />
                      </td>
                      <td className="px-5 py-3.5 text-center text-surface-300">{ep.page_count}</td>
                      <td className="px-5 py-3.5 text-right text-surface-300">{formatNumber(ep.view_count)}</td>
                      <td className="px-5 py-3.5 text-right text-surface-300">{formatNumber(ep.like_count)}</td>
                      <td className="px-5 py-3.5 text-right text-surface-300">{formatNumber(ep.comments_count)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

function SummaryCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-surface-800 bg-surface-900 p-5">
      <p className="flex items-center gap-1.5 text-xs font-medium text-surface-400">
        {icon} {label}
      </p>
      <p className="mt-2 font-display text-2xl font-bold text-surface-50">{value}</p>
    </div>
  )
}

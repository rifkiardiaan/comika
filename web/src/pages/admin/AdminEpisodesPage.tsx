import { useCallback, useEffect, useState } from 'react'
import { AlertCircle, ArrowLeft, Eye, FileText, Loader2, Upload, XCircle } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import PageHeader from '../../components/admin/PageHeader'
import { StatusBadge } from '../../components/admin/Badge'
import EmptyState from '../../components/admin/EmptyState'
import { admin, getApiErrorMessage } from '../../services/admin'
import { formatNumber } from '../../utils/format'

interface Episode {
  id: number
  number: number
  title: string
  status: 'draft' | 'pending' | 'published'
  is_premium: boolean
  price_coin: number
  view_count: number
  like_count: number
  page_count: number
  comments_count: number
  published_at: string | null
}

interface ComicInfo {
  id: number
  title: string
  verification_status: 'draft' | 'pending' | 'approved' | 'rejected' | string
  published_at: string | null
}

export default function AdminEpisodesPage() {
  const { comicId } = useParams<{ comicId: string }>()
  const [episodes, setEpisodes] = useState<Episode[]>([])
  const [comic, setComic] = useState<ComicInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [publishBusyId, setPublishBusyId] = useState<number | null>(null)

  const fetchEpisodes = useCallback(async () => {
    if (!comicId) return
    setLoading(true)
    setError('')
    try {
      // Fetch comic details to get episodes
      const res = await admin.comicEpisodes(parseInt(comicId))
      setEpisodes(res.episodes)
      setComic(res.comic)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Gagal memuat daftar episode.'))
    } finally {
      setLoading(false)
    }
  }, [comicId])

  useEffect(() => {
    fetchEpisodes()
  }, [fetchEpisodes])

  const publishEpisode = async (episode: Episode) => {
    setPublishBusyId(episode.id)
    setNotice('')
    try {
      await admin.publishEpisode(episode.id)
      setNotice(`Episode "${episode.title}" berhasil dipublikasikan.`)
      await fetchEpisodes()
    } catch (err) {
      setError(getApiErrorMessage(err, 'Gagal mempublikasikan episode.'))
    } finally {
      setPublishBusyId(null)
    }
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-4">
        <Link
          to="/admin/comics"
          className="inline-flex items-center gap-2 text-sm text-surface-400 transition-colors hover:text-surface-200"
        >
          <ArrowLeft size={16} /> Kembali ke Daftar Komik
        </Link>
      </div>

      <PageHeader
        title={`Episode — ${comic?.title ?? 'Memuat...'}`}
        subtitle={`Kelola dan publish episode untuk komik #${comicId}`}
      />

      {/* Komik harus disetujui & diterbitkan dulu sebelum episode boleh dipublish */}
      {comic && !(comic.verification_status === 'approved' && comic.published_at) && (
        <div className="mb-4 flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 px-5 py-4">
          <XCircle size={18} className="mt-0.5 shrink-0 text-amber-400" />
          <div>
            <p className="text-sm font-semibold text-amber-300">Komik Belum Disetujui</p>
            <p className="mt-0.5 text-xs leading-relaxed text-amber-200/80">
              Episode komik ini belum bisa diterbitkan. Setujui & terbitkan komik terlebih dahulu di{' '}
              <Link to="/admin/comics" className="font-semibold text-amber-200 underline underline-offset-2">
                Laporan Komik
              </Link>{' '}
              (klik <b>Publish</b> pada kartu komik), baru kembali ke halaman ini untuk menyetujui setiap episode.
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-300">
          <AlertCircle size={16} /> {error}
        </div>
      )}
      {notice && (
        <div className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-300">
          {notice}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-surface-800 bg-surface-900">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-surface-500">
            <Loader2 size={20} className="mr-2 animate-spin" /> Memuat data…
          </div>
        ) : episodes.length === 0 ? (
          <div className="p-6">
            <EmptyState message="Tidak ada episode untuk komik ini." />
          </div>
        ) : (
          <table className="w-full min-w-[600px] text-left text-sm">
            <thead>
              <tr className="border-b border-surface-800 text-xs uppercase tracking-wide text-surface-500">
                <th className="px-5 py-3 font-medium">Episode</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Tipe</th>
                <th className="px-5 py-3 text-center font-medium">Halaman</th>
                <th className="px-5 py-3 text-center font-medium">Komentar</th>
                <th className="px-5 py-3 text-right font-medium">Views</th>
                <th className="px-5 py-3 text-right font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-800/60">
              {episodes.map((ep) => (
                <tr key={ep.id} className="transition-colors hover:bg-surface-800/30">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-800 font-display text-sm font-bold text-surface-300">
                        {ep.number}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-surface-100">{ep.title}</p>
                        <p className="truncate text-xs text-surface-500">
                          {ep.published_at ? `Terbit ${new Date(ep.published_at).toLocaleDateString('id-ID')}` : 'Belum terbit'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={ep.status} />
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      ep.is_premium
                        ? 'bg-amber-500/15 text-amber-300'
                        : 'bg-emerald-500/15 text-emerald-300'
                    }`}>
                      {ep.is_premium ? `💎 ${ep.price_coin} koin` : '🆓 Gratis'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-center text-surface-300">
                    <span className="flex items-center justify-center gap-1">
                      <FileText size={13} className="text-surface-500" /> {ep.page_count}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-center text-surface-300">{ep.comments_count}</td>
                  <td className="px-5 py-3.5 text-right text-surface-300">
                    <span className="flex items-center justify-end gap-1.5">
                      <Eye size={13} className="text-emerald-400" /> {formatNumber(ep.view_count)}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {(ep.status === 'draft' || ep.status === 'pending') &&
                        (comic && comic.verification_status === 'approved' && comic.published_at ? (
                          <button
                            onClick={() => publishEpisode(ep)}
                            disabled={publishBusyId === ep.id}
                            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-emerald-400 transition-colors hover:bg-emerald-500/10 disabled:opacity-50"
                            title={ep.status === 'pending' ? 'Setujui episode yang diajukan creator' : 'Publish episode'}
                          >
                            {publishBusyId === ep.id ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <Upload size={14} />
                            )} {ep.status === 'pending' ? 'Setujui' : 'Publish'}
                          </button>
                        ) : (
                          <span
                            className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1.5 text-xs font-medium text-amber-300/80"
                            title="Setujui komik terlebih dahulu (Laporan Komik) sebelum menerbitkan episode"
                          >
                            <XCircle size={14} /> Setujui Komik Dulu
                          </span>
                        ))}
                      {ep.status === 'published' && (
                        <span className="text-xs text-emerald-400">✓ Terbit</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

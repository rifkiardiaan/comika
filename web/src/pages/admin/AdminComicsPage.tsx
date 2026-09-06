import { useCallback, useEffect, useState } from 'react'
import {
  AlertCircle,
  Ban,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Eye,
  FileText,
  Loader2,
  Search,
  ShieldAlert,
  Star,
  Trash2,
  Upload,
  XCircle,
} from 'lucide-react'
import PageHeader from '../../components/admin/PageHeader'
import Pagination from '../../components/admin/Pagination'
import ConfirmDialog from '../../components/admin/ConfirmDialog'
import EmptyState from '../../components/admin/EmptyState'
import { admin, getApiErrorMessage } from '../../services/admin'
import type { AdminComic } from '../../types'
import { coverEmoji, coverKeyOf, coverStyle } from '../../data/mock'
import { formatDate, formatNumber } from '../../utils/format'

type TabFilter = 'all' | 'pending' | 'approved' | 'rejected' | 'blocked'

const tabs: Array<{ value: TabFilter; label: string; color: string }> = [
  { value: 'all', label: 'Semua', color: 'text-surface-300' },
  { value: 'pending', label: '⏳ Pending', color: 'text-amber-300' },
  { value: 'approved', label: '✓ Disetujui', color: 'text-emerald-300' },
  { value: 'rejected', label: '✗ Ditolak', color: 'text-red-300' },
  { value: 'blocked', label: '🚫 Diblokir', color: 'text-orange-300' },
]

interface AdminEpisode {
  id: number
  number: number
  title: string
  status: 'draft' | 'pending' | 'published' | string
  is_premium: boolean
  price_coin: number
  view_count: number
  like_count: number
  page_count: number
  comments_count: number
  published_at: string | null
  rejection_reason?: string | null
}

/**
 * Normalisasi status episode utk tampilan admin.
 * Hanya 'published' asli yang hijau/Terbit; status lain (termasuk nilai
 * tak dikenal dari DB lama) dianggap belum terbit agar episode yang baru
 * dikirim creator tidak tampak langsung hijau.
 */
function adminEpisodeStatus(status: string): 'draft' | 'pending' | 'published' {
  if (status === 'published') return 'published'
  if (status === 'draft') return 'draft'
  return 'pending'
}

export default function AdminComicsPage() {
  const [comics, setComics] = useState<AdminComic[]>([])
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 })
  const [q, setQ] = useState('')
  const [tab, setTab] = useState<TabFilter>('pending')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const [deleteTarget, setDeleteTarget] = useState<AdminComic | null>(null)
  const [coverErrors, setCoverErrors] = useState<Set<number>>(new Set())
  const [deleting, setDeleting] = useState(false)

  // Action states
  const [publishBusyId, setPublishBusyId] = useState<number | null>(null)
  const [blockBusyId, setBlockBusyId] = useState<number | null>(null)
  const [banBusyId, setBanBusyId] = useState<number | null>(null)


  // Blokir komik dialog
  const [blockTarget, setBlockTarget] = useState<AdminComic | null>(null)
  const [blockReason, setBlockReason] = useState('')
  const [blockDialogOpen, setBlockDialogOpen] = useState(false)

  // Ban permanen dialog
  const [banTarget, setBanTarget] = useState<AdminComic | null>(null)
  const [banReason, setBanReason] = useState('')
  const [banDialogOpen, setBanDialogOpen] = useState(false)

  // Tolak komik dialog
  const [rejectTarget, setRejectTarget] = useState<AdminComic | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [rejectBusyId, setRejectBusyId] = useState<number | null>(null)

  // Inline episodes
  const [expandedComicId, setExpandedComicId] = useState<number | null>(null)
  const [comicEpisodes, setComicEpisodes] = useState<Record<number, AdminEpisode[]>>({})
  const [episodesLoading, setEpisodesLoading] = useState<number | null>(null)
  const [episodePublishBusyId, setEpisodePublishBusyId] = useState<number | null>(null)

  // Episode pages viewer
  const [viewingEpisodeId, setViewingEpisodeId] = useState<number | null>(null)
  const [episodePages, setEpisodePages] = useState<Array<{ id: number; page_number: number; image_url: string }>>([])
  const [pagesLoading, setPagesLoading] = useState(false)

  // Tolak episode dialog
  const [rejectEpTarget, setRejectEpTarget] = useState<{ ep: AdminEpisode; comicId: number } | null>(null)
  const [rejectEpReason, setRejectEpReason] = useState('')
  const [rejectEpBusyId, setRejectEpBusyId] = useState<number | null>(null)

  // Hapus episode dialog
  const [deleteEpTarget, setDeleteEpTarget] = useState<{ ep: AdminEpisode; comicId: number } | null>(null)
  const [deleteEpBusy, setDeleteEpBusy] = useState(false)

  const fetchComics = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params: Record<string, unknown> = { page }
      if (q) params.q = q
      if (tab === 'pending') params.verification = 'pending'
      else if (tab === 'approved') params.verification = 'approved'
      else if (tab === 'rejected') params.verification = 'rejected'
      else if (tab === 'blocked') params.verification = 'blocked'

      const res = await admin.comics(params)
      setComics(res.data)
      setMeta(res.meta)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Gagal memuat data.'))
    } finally {
      setLoading(false)
    }
  }, [q, tab, page])

  useEffect(() => {
    fetchComics()
  }, [fetchComics])

  // Publish comic
  const publishComic = async (comic: AdminComic) => {
    setPublishBusyId(comic.id)
    setNotice('')
    try {
      await admin.publishComic(comic.id)
      setNotice(`Komik "${comic.title}" disetujui & diterbitkan. Setujui tiap episode yang ingin ditayangkan pada daftar di bawah.`)
      await fetchComics()
    } catch (err) {
      setError(getApiErrorMessage(err, 'Gagal mempublikasikan.'))
    } finally {
      setPublishBusyId(null)
    }
  }

  // Reject comic — tolak dengan alasan (creator bisa perbaiki & ajukan ulang)
  const rejectComic = async () => {
    if (!rejectTarget) return
    setRejectBusyId(rejectTarget.id)
    setNotice('')
    try {
      await admin.verifyComic(rejectTarget.id, {
        verification_status: 'rejected',
        rejection_reason: rejectReason.trim() || undefined,
      })
      setNotice(`Komik "${rejectTarget.title}" ditolak.`)
      setRejectTarget(null)
      setRejectReason('')
      await fetchComics()
    } catch (err) {
      setError(getApiErrorMessage(err, 'Gagal menolak komik.'))
    } finally {
      setRejectBusyId(null)
    }
  }

  // Open block-comic dialog
  const openBlockDialog = (comic: AdminComic) => {
    setBlockTarget(comic)
    setBlockReason('')
    setBlockDialogOpen(true)
  }

  // Block comic — komik tidak disetujui & masuk page Diblokir.
  // Creator tetap bisa login tapi izin upload komiknya dinonaktifkan.
  const confirmBlock = async () => {
    if (!blockTarget) return
    setBlockBusyId(blockTarget.id)
    setNotice('')
    try {
      await admin.blockComic(blockTarget.id, blockReason.trim() || undefined)
      setNotice(`Komik "${blockTarget.title}" diblokir & masuk page Diblokir. Izin upload creator dinonaktifkan.`)
      setBlockDialogOpen(false)
      await fetchComics()
    } catch (err) {
      setError(getApiErrorMessage(err, 'Gagal memblokir komik.'))
    } finally {
      setBlockBusyId(null)
    }
  }

  // Open permanent-ban dialog
  const openBanDialog = (comic: AdminComic) => {
    setBanTarget(comic)
    setBanReason('')
    setBanDialogOpen(true)
  }

  // Execute permanent ban
  const executeBan = async () => {
    if (!banTarget) return
    setBanBusyId(banTarget.id)
    setNotice('')
    try {
      await admin.permanentBanUser(banTarget.creator.id, banReason || 'Diblokir permanen oleh admin')
      setNotice(`Akun "${banTarget.creator.name}" diblokir permanen — tidak bisa login.`)
      setBanDialogOpen(false)
      await fetchComics()
    } catch (err) {
      setError(getApiErrorMessage(err, 'Gagal memblokir permanen akun.'))
    } finally {
      setBanBusyId(null)
    }
  }


  // Delete comic
  const confirmDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await admin.deleteComic(deleteTarget.id)
      setNotice(`Komik "${deleteTarget.title}" telah dihapus.`)
      setDeleteTarget(null)
      await fetchComics()
    } catch (err) {
      setError(getApiErrorMessage(err, 'Gagal menghapus.'))
      setDeleteTarget(null)
    } finally {
      setDeleting(false)
    }
  }

  // Toggle episodes
  const toggleEpisodes = async (comicId: number) => {
    if (expandedComicId === comicId) {
      setExpandedComicId(null)
      return
    }
    setExpandedComicId(comicId)
    if (!comicEpisodes[comicId]) {
      setEpisodesLoading(comicId)
      try {
        const res = await admin.comicEpisodes(comicId)
        setComicEpisodes((prev) => ({ ...prev, [comicId]: res.episodes }))
      } catch (err) {
        setError(getApiErrorMessage(err, 'Gagal memuat episode.'))
      } finally {
        setEpisodesLoading(null)
      }
    }
  }

  // Publish episode
  const publishEpisode = async (episodeId: number, comicId: number) => {
    setEpisodePublishBusyId(episodeId)
    setNotice('')
    try {
      await admin.publishEpisode(episodeId)
      setComicEpisodes((prev) => ({
        ...prev,
        [comicId]: (prev[comicId] || []).map((ep) =>
          ep.id === episodeId ? { ...ep, status: 'published' as const, published_at: new Date().toISOString() } : ep
        ),
      }))
      setNotice('Episode berhasil dipublikasikan.')
    } catch (err) {
      setError(getApiErrorMessage(err, 'Gagal mempublish episode.'))
    } finally {
      setEpisodePublishBusyId(null)
    }
  }

  // Tolak episode — episode otomatis dihapus (creator dapat notifikasi alasan)
  const rejectEpisode = async () => {
    if (!rejectEpTarget) return
    const { ep, comicId } = rejectEpTarget
    setRejectEpBusyId(ep.id)
    setNotice('')
    try {
      await admin.rejectEpisode(ep.id, rejectEpReason.trim() || undefined)
      setComicEpisodes((prev) => ({
        ...prev,
        [comicId]: (prev[comicId] || []).filter((row) => row.id !== ep.id),
      }))
      setComics((prev) =>
        prev.map((c) =>
          c.id === comicId ? { ...c, episode_count: Math.max(0, c.episode_count - 1) } : c
        )
      )
      setNotice(`Episode "${ep.title}" ditolak & dihapus. Creator mendapat notifikasi berisi alasan.`)
      setRejectEpTarget(null)
      setRejectEpReason('')
    } catch (err) {
      setError(getApiErrorMessage(err, 'Gagal menolak episode.'))
    } finally {
      setRejectEpBusyId(null)
    }
  }

  // Hapus episode dari dashboard admin
  const confirmDeleteEpisode = async () => {
    if (!deleteEpTarget) return
    const { ep, comicId } = deleteEpTarget
    setDeleteEpBusy(true)
    setNotice('')
    try {
      await admin.deleteEpisode(ep.id)
      setComicEpisodes((prev) => ({
        ...prev,
        [comicId]: (prev[comicId] || []).filter((row) => row.id !== ep.id),
      }))
      setComics((prev) =>
        prev.map((c) =>
          c.id === comicId ? { ...c, episode_count: Math.max(0, c.episode_count - 1) } : c
        )
      )
      setNotice(`Episode "${ep.title}" berhasil dihapus.`)
      setDeleteEpTarget(null)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Gagal menghapus episode.'))
    } finally {
      setDeleteEpBusy(false)
    }
  }

  // View episode pages
  const viewEpisodePages = async (episodeId: number) => {
    setViewingEpisodeId(episodeId)
    setEpisodePages([])
    setPagesLoading(true)
    try {
      const res = await admin.episodePages(episodeId)
      setEpisodePages(res.pages)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Gagal memuat halaman episode.'))
    } finally {
      setPagesLoading(false)
    }
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Laporan Komik"
        subtitle="Kelola upload komik dari creator — setujui, blokir, atau ban akun"
      />

      {/* Tabs */}
      <div className="mb-4 flex gap-1 overflow-x-auto rounded-xl border border-surface-800 bg-surface-900 p-1">
        {tabs.map((t) => (
          <button
            key={t.value}
            onClick={() => { setTab(t.value); setPage(1) }}
            className={`shrink-0 rounded-lg px-4 py-2 text-xs font-semibold transition-colors ${
              tab === t.value
                ? 'bg-brand-500/20 text-brand-300 shadow-sm'
                : `${t.color} hover:bg-surface-800/60`
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="mb-4">
        <form
          onSubmit={(e) => { e.preventDefault(); setPage(1) }}
          className="relative"
        >
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-surface-500" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari judul komik atau nama creator…"
            className="w-full rounded-xl border border-surface-800 bg-surface-900 py-2.5 pl-9 pr-4 text-sm text-surface-100 placeholder:text-surface-500 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
          />
        </form>
      </div>

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

      {/* Comic cards */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-surface-500">
          <Loader2 size={20} className="mr-2 animate-spin" /> Memuat data…
        </div>
      ) : comics.length === 0 ? (
        <div className="rounded-2xl border border-surface-800 bg-surface-900 p-6">
          <EmptyState message={tab === 'pending' ? 'Tidak ada komik yang menunggu persetujuan.' : 'Tidak ada data.'} />
        </div>
      ) : (
        <div className="space-y-3">
          {comics.map((c) => {
            const isExpanded = expandedComicId === c.id
            const episodes = comicEpisodes[c.id] || []
            const isLoadingEps = episodesLoading === c.id
            const isPending = c.verification_status === 'pending'
            const isApproved = c.verification_status === 'approved'
            const isRejected = c.verification_status === 'rejected'
            const isBlocked = c.verification_status === 'blocked'

            return (
              <div key={c.id} className="overflow-hidden rounded-2xl border border-surface-800 bg-surface-900">
                {/* Main card */}
                <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start">
                  {/* Cover */}
                  <div className="shrink-0">
                    {c.cover_url && !coverErrors.has(c.id) ? (
                      <img
                        src={c.cover_url}
                        alt={c.title}
                        className="h-24 w-18 rounded-xl object-cover"
                        onError={() => setCoverErrors((prev) => new Set(prev).add(c.id))}
                      />
                    ) : (
                      <span
                        className="flex h-24 w-18 items-center justify-center rounded-xl text-2xl"
                        style={{ background: coverStyle(coverKeyOf(c.id)) }}
                      >
                        {coverEmoji(coverKeyOf(c.id))}
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start gap-2">
                      <h3 className="font-display text-base font-bold text-surface-50">{c.title}</h3>
                      {isPending && (
                        <span className="shrink-0 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                          ⏳ Menunggu
                        </span>
                      )}
                      {isApproved && (
                        <span className="shrink-0 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                          ✓ Disetujui
                        </span>
                      )}
                      {isRejected && (
                        <span className="shrink-0 rounded-full bg-red-500/15 px-2 py-0.5 text-[10px] font-bold text-red-300">
                          ✗ Ditolak
                        </span>
                      )}
                      {isBlocked && (
                        <span className="shrink-0 rounded-full bg-orange-500/15 px-2 py-0.5 text-[10px] font-bold text-orange-300">
                          🚫 Diblokir
                        </span>
                      )}
                    </div>

                    {/* Creator info */}
                    <div className="mt-1 flex items-center gap-2 text-xs text-surface-400">
                      <span className="font-medium text-surface-300">{c.creator.name}</span>
                      <span>·</span>
                      <span>{c.episode_count} episode</span>
                      <span>·</span>
                      <span className="flex items-center gap-1"><Eye size={11} /> {formatNumber(c.view_count)}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1"><Star size={11} className="text-amber-300" fill="currentColor" /> {c.rating_avg.toFixed(1)}</span>
                    </div>

                    {c.rejection_reason && (
                      <p className="mt-1 text-xs text-red-400">Alasan: {c.rejection_reason}</p>
                    )}

                    <p className="mt-1 text-[11px] text-surface-500">
                      Diupload {formatDate(c.created_at)} · {c.published_at ? `Terbit ${formatDate(c.published_at)}` : 'Belum terbit'}
                    </p>
                  </div>

                  {/* Actions — desktop */}
                  <div className="hidden shrink-0 flex-col gap-2 sm:flex">
                    {isPending && (
                      <>
                        <button
                          onClick={() => publishComic(c)}
                          disabled={publishBusyId === c.id}
                          title="Setujui & terbitkan komik — setiap episode tetap disetujui satu per satu"
                          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/15 px-3 py-2 text-xs font-semibold text-emerald-300 transition-colors hover:bg-emerald-500/25 disabled:opacity-50"
                        >
                          {publishBusyId === c.id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />} Publish
                        </button>
                        <button
                          onClick={() => { setRejectTarget(c); setRejectReason('') }}
                          disabled={rejectBusyId === c.id}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-red-500/15 px-3 py-2 text-xs font-semibold text-red-300 transition-colors hover:bg-red-500/25 disabled:opacity-50"
                          title="Tolak komik dengan alasan — creator bisa perbaiki & ajukan ulang"
                        >
                          <XCircle size={14} /> Tolak
                        </button>
                        <button
                          onClick={() => openBlockDialog(c)}
                          disabled={blockBusyId === c.id}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-orange-500/15 px-3 py-2 text-xs font-semibold text-orange-300 transition-colors hover:bg-orange-500/25 disabled:opacity-50"
                          title="Blokir komik & nonaktifkan izin upload creator (creator tetap bisa login)"
                        >
                          {blockBusyId === c.id ? <Loader2 size={14} className="animate-spin" /> : <Ban size={14} />} Diblokir
                        </button>
                        <button
                          onClick={() => openBanDialog(c)}
                          disabled={banBusyId === c.id}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-red-500/15 px-3 py-2 text-xs font-semibold text-red-300 transition-colors hover:bg-red-500/25 disabled:opacity-50"
                        >
                          <ShieldAlert size={14} /> Ban Permanen
                        </button>
                      </>
                    )}
                    {isApproved && (
                      <button
                        onClick={() => openBlockDialog(c)}
                        disabled={blockBusyId === c.id}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-orange-500/15 px-3 py-2 text-xs font-semibold text-orange-300 transition-colors hover:bg-orange-500/25 disabled:opacity-50"
                        title="Blokir komik & nonaktifkan izin upload creator (creator tetap bisa login)"
                      >
                        {blockBusyId === c.id ? <Loader2 size={14} className="animate-spin" /> : <Ban size={14} />} Diblokir
                      </button>
                    )}
                    {isBlocked && (
                      <button
                        onClick={() => publishComic(c)}
                        disabled={publishBusyId === c.id}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/15 px-3 py-2 text-xs font-semibold text-emerald-300 transition-colors hover:bg-emerald-500/25 disabled:opacity-50"
                        title="Buka blokir, setujui kembali & terbitkan komik"
                      >
                        {publishBusyId === c.id ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />} Publish
                      </button>
                    )}
                    <button
                      onClick={() => setDeleteTarget(c)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-surface-800 px-3 py-2 text-xs font-semibold text-surface-400 transition-colors hover:bg-surface-700 hover:text-surface-200"
                    >
                      <Trash2 size={14} /> Hapus
                    </button>
                  </div>
                </div>

                {/* Actions — mobile */}
                <div className="flex flex-wrap gap-2 border-t border-surface-800 px-4 py-3 sm:hidden">
                  {isPending && (
                    <>
                      <button onClick={() => publishComic(c)} disabled={publishBusyId === c.id} className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-500/15 px-3 py-2 text-xs font-semibold text-emerald-300">
                        {publishBusyId === c.id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />} Publish
                      </button>
                      <button onClick={() => { setRejectTarget(c); setRejectReason('') }} disabled={rejectBusyId === c.id} className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-red-500/15 px-3 py-2 text-xs font-semibold text-red-300">
                        <XCircle size={14} /> Tolak
                      </button>
                      <button onClick={() => openBlockDialog(c)} disabled={blockBusyId === c.id} className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-orange-500/15 px-3 py-2 text-xs font-semibold text-orange-300">
                        <Ban size={14} /> Diblokir
                      </button>
                      <button onClick={() => openBanDialog(c)} disabled={banBusyId === c.id} className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-red-500/15 px-3 py-2 text-xs font-semibold text-red-300">
                        <ShieldAlert size={14} /> Ban Permanen
                      </button>
                    </>
                  )}
                  {isBlocked && (
                    <button onClick={() => publishComic(c)} disabled={publishBusyId === c.id} className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-500/15 px-3 py-2 text-xs font-semibold text-emerald-300">
                      <Upload size={14} /> Publish
                    </button>
                  )}
                </div>

                {/* Expandable episodes */}
                <div className="border-t border-surface-800">
                  <button
                    onClick={() => toggleEpisodes(c.id)}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-xs font-medium text-surface-400 transition-colors hover:bg-surface-800/40 hover:text-surface-200"
                  >
                    {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    <FileText size={14} /> Episode ({c.episode_count})
                    {isPending && (
                      <span className="ml-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-[9px] font-bold text-amber-300">
                        Setujui per episode
                      </span>
                    )}
                  </button>
                  {isExpanded && (
                    <div className="border-t border-surface-800 bg-surface-950/50 px-4 py-3">
                      {isLoadingEps ? (
                        <div className="flex items-center gap-2 py-4 text-surface-500">
                          <Loader2 size={16} className="animate-spin" /> Memuat…
                        </div>
                      ) : episodes.length === 0 ? (
                        <p className="py-4 text-center text-sm text-surface-500">Belum ada episode.</p>
                      ) : (
                        <div className="space-y-1.5">            {/* Komik belum disetujui — episode belum bisa diterbitkan satu per satu */}
            {!isApproved && episodes.length > 0 && (
              <p className="mb-2 flex items-start gap-2 rounded-lg border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-[11px] leading-snug text-amber-200/90">
                <ShieldAlert size={14} className="mt-0.5 shrink-0 text-amber-300" />
                <span>
                  Komik ini <b className="font-semibold">belum disetujui</b>. Setujui komik terlebih dahulu dengan tombol{' '}
                  <b className="font-semibold">Publish</b> pada kartu komik di atas, baru episode-nya bisa diterbitkan satu per satu di bawah ini.
                </span>
              </p>
            )}
            {episodes.map((ep) => (
              <div
                key={ep.id}
                className={`flex flex-wrap items-center gap-3 rounded-lg border-l-4 bg-surface-900 px-3 py-2 ${
                  adminEpisodeStatus(ep.status) === 'pending'
                    ? 'border-l-amber-400'
                    : adminEpisodeStatus(ep.status) === 'published'
                      ? 'border-l-emerald-400'
                      : 'border-l-white/30'
                }`}
              >
                              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-surface-800 font-mono text-[10px] font-bold text-surface-400">
                                {ep.number}
                              </span>
                              <span className="min-w-0 flex-1 truncate text-sm text-surface-200">{ep.title}</span>
                              {/* Status per episode: Draft / Menunggu Review / Terbit */}
                              {adminEpisodeStatus(ep.status) === 'draft' ? (
                                <span
                                  className="inline-flex items-center gap-1 rounded-full border border-white/30 bg-white/10 px-2 py-0.5 text-[10px] font-bold text-white"
                                  title="Draft — belum dikirim creator untuk direview"
                                >
                                  <span className="h-1.5 w-1.5 rounded-full bg-white" /> Draft
                                </span>
                              ) : adminEpisodeStatus(ep.status) === 'pending' ? (
                                <span
                                  className="inline-flex items-center gap-1 rounded-full border border-amber-500/40 bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-300"
                                  title="Menunggu review — creator sudah mengirim episode ini"
                                >
                                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400" /> Menunggu Review
                                </span>
                              ) : (
                                <span
                                  className="inline-flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-300"
                                  title="Terbit — sudah disetujui admin dan tampil publik"
                                >
                                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Terbit
                                </span>
                              )}
                              <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${ep.is_premium ? 'bg-amber-500/15 text-amber-300' : 'bg-emerald-500/15 text-emerald-300'}`}>
                                {ep.is_premium ? `${ep.price_coin}k` : 'Free'}
                              </span>
                              <button
                                onClick={() => viewEpisodePages(ep.id)}
                                className="shrink-0 rounded-md bg-sky-500/15 px-2.5 py-1 text-[10px] font-bold text-sky-300 transition-colors hover:bg-sky-500/25"
                                title="Lihat isi episode"
                              >
                                <Eye size={12} className="inline" /> Lihat
                              </button>
                              {adminEpisodeStatus(ep.status) === 'published' ? (
                                <span className="shrink-0 text-[10px] font-semibold text-emerald-400">✓ Terbit</span>
                              ) : !isApproved ? (
                                <span
                                  className="inline-flex shrink-0 items-center gap-1 rounded-md border border-surface-700 bg-surface-800/60 px-2.5 py-1 text-[10px] font-bold text-surface-500"
                                  title="Setujui komik terlebih dahulu (tombol Publish pada kartu komik) sebelum menerbitkan episode"
                                >
                                  <ShieldAlert size={12} /> Setujui Komik Dulu
                                </span>
                              ) : (
                                <button
                                  onClick={() => publishEpisode(ep.id, c.id)}
                                  disabled={episodePublishBusyId === ep.id || ep.page_count === 0}
                                  title={
                                    ep.page_count === 0
                                      ? 'Episode belum punya halaman — creator harus unggah halaman dulu'
                                      : 'Setujui & terbitkan episode ini'
                                  }
                                  className="inline-flex shrink-0 items-center gap-1 rounded-md bg-emerald-500/15 px-2.5 py-1 text-[10px] font-bold text-emerald-300 transition-colors hover:bg-emerald-500/25 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                  {episodePublishBusyId === ep.id ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={12} />}
                                  {adminEpisodeStatus(ep.status) === 'pending' ? 'Setujui' : 'Publish'}
                                </button>
                              )}
                              {adminEpisodeStatus(ep.status) !== 'draft' && (
                                <button
                                  onClick={() => { setRejectEpTarget({ ep, comicId: c.id }); setRejectEpReason('') }}
                                  disabled={rejectEpBusyId === ep.id}
                                  title={
                                    ep.status === 'published'
                                      ? 'Tarik & hapus episode ini — tidak lagi tampil publik'
                                      : 'Tolak episode — episode otomatis dihapus, creator mendapat alasan via notifikasi'
                                  }
                                  className="inline-flex shrink-0 items-center gap-1 rounded-md bg-red-500/10 px-2.5 py-1 text-[10px] font-bold text-red-400 transition-colors hover:bg-red-500/20 disabled:opacity-50"
                                >
                                  {rejectEpBusyId === ep.id ? <Loader2 size={12} className="animate-spin" /> : <XCircle size={12} />}
                                  Tolak
                                </button>
                              )}
                              <button
                                onClick={() => setDeleteEpTarget({ ep, comicId: c.id })}
                                className="inline-flex shrink-0 items-center gap-1 rounded-md bg-surface-800 px-2.5 py-1 text-[10px] font-bold text-surface-400 transition-colors hover:bg-red-500/15 hover:text-red-300"
                                title="Hapus episode permanen — beserta seluruh halaman & data terkait"
                              >
                                <Trash2 size={12} /> Hapus
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {!loading && comics.length > 0 && <Pagination meta={meta} onPageChange={setPage} />}

      {/* Delete dialog */}
      <ConfirmDialog
        open={deleteTarget !== null}
        title="Hapus Komik"
        description={deleteTarget ? `Hapus "${deleteTarget.title}" beserta semua episode?` : ''}
        confirmLabel="Hapus"
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Tolak episode dialog — menolak otomatis menghapus episode */}
      <ConfirmDialog
        open={rejectEpTarget !== null}
        title="Tolak & Hapus Episode"
        description={
          rejectEpTarget
            ? `Tolak episode ${rejectEpTarget.ep.number} "${rejectEpTarget.ep.title}"? Episode beserta seluruh halamannya akan otomatis dihapus dan tidak tampil publik. Creator menerima notifikasi berisi alasan penolakan.`
            : ''
        }
        confirmLabel="Tolak & Hapus"
        loading={rejectEpBusyId !== null}
        onConfirm={rejectEpisode}
        onCancel={() => { setRejectEpTarget(null); setRejectEpReason('') }}
      >
        <div className="mt-3">
          <label className="mb-1 block text-xs font-medium text-surface-400">Alasan penolakan (opsional)</label>
          <textarea
            value={rejectEpReason}
            onChange={(e) => setRejectEpReason(e.target.value)}
            rows={3}
            maxLength={500}
            placeholder="Contoh: perbaiki kualitas gambar, judul, atau isi halaman…"
            className="w-full resize-none rounded-lg border border-surface-800 bg-surface-950 px-3 py-2 text-sm text-surface-100 placeholder:text-surface-600 focus:border-red-500 focus:outline-none"
          />
        </div>
        <p className="mt-2 flex items-start gap-1.5 rounded-lg border border-red-500/25 bg-red-500/10 px-2.5 py-1.5 text-[11px] leading-snug text-red-300">
          <AlertCircle size={13} className="mt-0.5 shrink-0" />
          Episode yang ditolak otomatis terhapus permanen. Creator tetap mendapat notifikasi berisi alasan Anda dan dapat mengunggah ulang episode yang diperbaiki.
        </p>
      </ConfirmDialog>

      {/* Hapus episode dialog */}
      <ConfirmDialog
        open={deleteEpTarget !== null}
        title="Hapus Episode"
        description={
          deleteEpTarget
            ? `Hapus episode ${deleteEpTarget.ep.number} "${deleteEpTarget.ep.title}"? Episode beserta seluruh halaman, komentar, dan riwayat pembacaannya akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.`
            : ''
        }
        confirmLabel="Hapus Episode"
        loading={deleteEpBusy}
        onConfirm={confirmDeleteEpisode}
        onCancel={() => setDeleteEpTarget(null)}
      />

      {/* Tolak komik dialog */}
      <ConfirmDialog
        open={rejectTarget !== null}
        title="Tolak Komik"
        description={
          rejectTarget
            ? `Tolak komik "${rejectTarget.title}"? Creator akan menerima notifikasi beserta alasan penolakan dan bisa memperbaiki lalu mengajukan ulang.`
            : ''
        }
        confirmLabel="Tolak Komik"
        loading={rejectBusyId !== null}
        onConfirm={rejectComic}
        onCancel={() => { setRejectTarget(null); setRejectReason('') }}
      >
        <div className="mt-3">
          <label className="mb-1 block text-xs font-medium text-surface-400">Alasan penolakan (opsional)</label>
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={3}
            maxLength={500}
            placeholder="Contoh: judul/sinopsis melanggar pedoman komunitas…"
            className="w-full resize-none rounded-lg border border-surface-800 bg-surface-950 px-3 py-2 text-sm text-surface-100 placeholder:text-surface-600 focus:border-red-500 focus:outline-none"
          />
        </div>
      </ConfirmDialog>

      {/* Blokir komik dialog — komik masuk page Diblokir & izin upload creator dinonaktifkan */}
      <ConfirmDialog
        open={blockDialogOpen}
        title="Blokir Komik"
        description={
          blockTarget
            ? `Komik "${blockTarget.title}" tidak disetujui & masuk halaman Diblokir. Creator "${blockTarget.creator.name}" tetap bisa login, tapi izin upload komiknya dinonaktifkan (bisa diaktifkan kembali lewat Manajemen Pengguna).`
            : ''
        }
        confirmLabel="Blokir Komik"
        loading={blockBusyId === blockTarget?.id}
        onConfirm={confirmBlock}
        onCancel={() => setBlockDialogOpen(false)}
      >
        <div className="mt-3">
          <label className="mb-1 block text-xs font-medium text-surface-400">Alasan pemblokiran (opsional)</label>
          <textarea
            value={blockReason}
            onChange={(e) => setBlockReason(e.target.value)}
            rows={3}
            maxLength={500}
            placeholder="Contoh: melanggar hak cipta, konten tidak pantas…"
            className="w-full resize-none rounded-lg border border-surface-800 bg-surface-950 px-3 py-2 text-sm text-surface-100 placeholder:text-surface-600 focus:border-orange-500 focus:outline-none"
          />
        </div>
      </ConfirmDialog>

      {/* Ban permanen dialog */}
      <ConfirmDialog
        open={banDialogOpen}
        title="Ban Permanen Akun"
        description={
          banTarget
            ? `Akun "${banTarget.creator.name}" akan diblokir permanen. Tidak bisa login lagi. Admin dapat membuka kembali login kapan saja melalui Manajemen Pengguna.`
            : ''
        }
        confirmLabel="Ban Permanen"
        loading={banBusyId === banTarget?.id}
        onConfirm={executeBan}
        onCancel={() => setBanDialogOpen(false)}
      >
        <div className="mt-3">
          <label className="mb-1 block text-xs font-medium text-surface-400">Alasan (opsional)</label>
          <input
            value={banReason}
            onChange={(e) => setBanReason(e.target.value)}
            placeholder="Diblokir permanen oleh admin"
            className="w-full rounded-lg border border-surface-800 bg-surface-950 px-3 py-2 text-sm text-surface-100 placeholder:text-surface-600 focus:border-red-500 focus:outline-none"
          />
        </div>
      </ConfirmDialog>

      {/* Episode Pages Viewer */}
      {viewingEpisodeId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setViewingEpisodeId(null)} />
          <div className="relative max-h-[90vh] w-full max-w-3xl animate-slide-up overflow-y-auto rounded-2xl border border-surface-800 bg-surface-900 p-5 shadow-2xl">
            <div className="sticky top-0 z-10 mb-4 flex items-center justify-between border-b border-surface-800 pb-3">
              <h3 className="font-display text-lg font-bold text-surface-50">Isi Episode</h3>
              <button
                onClick={() => setViewingEpisodeId(null)}
                className="rounded-lg p-2 text-surface-400 hover:bg-surface-800 hover:text-surface-50"
              >
                <XCircle size={20} />
              </button>
            </div>
            {pagesLoading ? (
              <div className="flex items-center justify-center py-12 text-surface-500">
                <Loader2 size={20} className="mr-2 animate-spin" /> Memuat halaman…
              </div>
            ) : episodePages.length === 0 ? (
              <p className="py-12 text-center text-sm text-surface-500">Episode ini belum memiliki halaman.</p>
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-surface-400">Total {episodePages.length} halaman</p>
                {episodePages.map((pg) => (
                  <div key={pg.id} className="rounded-xl border border-surface-800 bg-surface-950 p-2">
                    <p className="mb-2 text-[10px] text-surface-500">Halaman {pg.page_number}</p>
                    <img
                      src={pg.image_url}
                      alt={`Halaman ${pg.page_number}`}
                      className="w-full rounded-lg"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

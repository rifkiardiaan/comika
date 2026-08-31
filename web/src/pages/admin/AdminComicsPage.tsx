import { useCallback, useEffect, useState } from 'react'
import {
  AlertCircle,
  Ban,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Eye,
  FileText,
  Heart,
  ImageOff,
  Loader2,
  Search,
  ShieldAlert,
  ShieldCheck,
  Star,
  Trash2,
  Unlock,
  Upload,
  XCircle,
} from 'lucide-react'
import PageHeader from '../../components/admin/PageHeader'
import { StatusBadge } from '../../components/admin/Badge'
import Pagination from '../../components/admin/Pagination'
import ConfirmDialog from '../../components/admin/ConfirmDialog'
import EmptyState from '../../components/admin/EmptyState'
import { admin, getApiErrorMessage } from '../../services/admin'
import type { AdminComic, ComicStatus, VerificationStatus } from '../../types'
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
  status: 'draft' | 'published'
  is_premium: boolean
  price_coin: number
  view_count: number
  like_count: number
  page_count: number
  comments_count: number
  published_at: string | null
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
  const [busyId, setBusyId] = useState<number | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<AdminComic | null>(null)
  const [coverErrors, setCoverErrors] = useState<Set<number>>(new Set())
  const [deleting, setDeleting] = useState(false)

  // Action states
  const [publishBusyId, setPublishBusyId] = useState<number | null>(null)
  const [blockBusyId, setBlockBusyId] = useState<number | null>(null)
  const [banBusyId, setBanBusyId] = useState<number | null>(null)
  const [unbanBusyId, setUnbanBusyId] = useState<number | null>(null)

  // Ban dialog
  const [banTarget, setBanTarget] = useState<AdminComic | null>(null)
  const [banType, setBanType] = useState<'ban' | 'permanent_ban'>('ban')
  const [banReason, setBanReason] = useState('')
  const [banDialogOpen, setBanDialogOpen] = useState(false)

  // Inline episodes
  const [expandedComicId, setExpandedComicId] = useState<number | null>(null)
  const [comicEpisodes, setComicEpisodes] = useState<Record<number, AdminEpisode[]>>({})
  const [episodesLoading, setEpisodesLoading] = useState<number | null>(null)
  const [episodePublishBusyId, setEpisodePublishBusyId] = useState<number | null>(null)

  // Episode pages viewer
  const [viewingEpisodeId, setViewingEpisodeId] = useState<number | null>(null)
  const [episodePages, setEpisodePages] = useState<Array<{ id: number; page_number: number; image_url: string }>>([])
  const [pagesLoading, setPagesLoading] = useState(false)

  const fetchComics = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params: Record<string, unknown> = { page }
      if (q) params.q = q
      if (tab === 'pending') params.verification = 'pending'
      else if (tab === 'approved') params.verification = 'approved'
      else if (tab === 'rejected') params.verification = 'rejected'
      else if (tab === 'blocked') params.status = 'hiatus'

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
      setNotice(`Komik "${comic.title}" berhasil dipublikasikan.`)
      await fetchComics()
    } catch (err) {
      setError(getApiErrorMessage(err, 'Gagal mempublikasikan.'))
    } finally {
      setPublishBusyId(null)
    }
  }

  // Block comic
  const blockComic = async (comic: AdminComic) => {
    setBlockBusyId(comic.id)
    setNotice('')
    try {
      await admin.blockComic(comic.id)
      setNotice(`Komik "${comic.title}" berhasil diblokir.`)
      await fetchComics()
    } catch (err) {
      setError(getApiErrorMessage(err, 'Gagal memblokir.'))
    } finally {
      setBlockBusyId(null)
    }
  }

  // Open ban dialog
  const openBanDialog = (comic: AdminComic, type: 'ban' | 'permanent_ban') => {
    setBanTarget(comic)
    setBanType(type)
    setBanReason('')
    setBanDialogOpen(true)
  }

  // Execute ban
  const executeBan = async () => {
    if (!banTarget) return
    setBanBusyId(banTarget.id)
    setNotice('')
    try {
      if (banType === 'permanent_ban') {
        await admin.permanentBanUser(banTarget.creator.id, banReason || 'Diblokir permanen oleh admin')
        setNotice(`Akun "${banTarget.creator.name}" diblokir permanen.`)
      } else {
        await admin.banUser(banTarget.creator.id, banReason || 'Diblokir oleh admin')
        setNotice(`Akun "${banTarget.creator.name}" berhasil diblokir.`)
      }
      setBanDialogOpen(false)
      await fetchComics()
    } catch (err) {
      setError(getApiErrorMessage(err, 'Gagal memblokir akun.'))
    } finally {
      setBanBusyId(null)
    }
  }

  // Unban creator
  const unbanCreator = async (comic: AdminComic) => {
    setUnbanBusyId(comic.id)
    setNotice('')
    try {
      await admin.unbanUser(comic.creator.id)
      setNotice(`Akun "${comic.creator.name}" berhasil di-unban.`)
      await fetchComics()
    } catch (err) {
      setError(getApiErrorMessage(err, 'Gagal membuka blokir.'))
    } finally {
      setUnbanBusyId(null)
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
            const isBlocked = !c.published_at && c.status === 'hiatus'

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
                          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/15 px-3 py-2 text-xs font-semibold text-emerald-300 transition-colors hover:bg-emerald-500/25 disabled:opacity-50"
                        >
                          {publishBusyId === c.id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />} Publish
                        </button>
                        <button
                          onClick={() => openBanDialog(c, 'ban')}
                          disabled={banBusyId === c.id}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500/15 px-3 py-2 text-xs font-semibold text-amber-300 transition-colors hover:bg-amber-500/25 disabled:opacity-50"
                        >
                          <Ban size={14} /> Blokir
                        </button>
                        <button
                          onClick={() => openBanDialog(c, 'permanent_ban')}
                          disabled={banBusyId === c.id}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-red-500/15 px-3 py-2 text-xs font-semibold text-red-300 transition-colors hover:bg-red-500/25 disabled:opacity-50"
                        >
                          <ShieldAlert size={14} /> Ban Permanen
                        </button>
                      </>
                    )}
                    {isApproved && (
                      <button
                        onClick={() => openBanDialog(c, 'ban')}
                        disabled={banBusyId === c.id}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500/15 px-3 py-2 text-xs font-semibold text-amber-300 transition-colors hover:bg-amber-500/25 disabled:opacity-50"
                      >
                        <Ban size={14} /> Blokir
                      </button>
                    )}
                    {isBlocked && (
                      <button
                        onClick={() => blockComic(c)}
                        disabled={blockBusyId === c.id}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/15 px-3 py-2 text-xs font-semibold text-emerald-300 transition-colors hover:bg-emerald-500/25 disabled:opacity-50"
                      >
                        <Upload size={14} /> Publish
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
                      <button onClick={() => openBanDialog(c, 'ban')} disabled={banBusyId === c.id} className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-amber-500/15 px-3 py-2 text-xs font-semibold text-amber-300">
                        <Ban size={14} /> Blokir
                      </button>
                      <button onClick={() => openBanDialog(c, 'permanent_ban')} disabled={banBusyId === c.id} className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-red-500/15 px-3 py-2 text-xs font-semibold text-red-300">
                        <ShieldAlert size={14} /> Ban
                      </button>
                    </>
                  )}
                  {isBlocked && (
                    <button onClick={() => blockComic(c)} disabled={blockBusyId === c.id} className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-500/15 px-3 py-2 text-xs font-semibold text-emerald-300">
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
                        <div className="space-y-1.5">
                          {episodes.map((ep) => (
                            <div key={ep.id} className="flex items-center gap-3 rounded-lg bg-surface-900 px-3 py-2">
                              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-surface-800 font-mono text-[10px] font-bold text-surface-400">
                                {ep.number}
                              </span>
                              <span className="min-w-0 flex-1 truncate text-sm text-surface-200">{ep.title}</span>
                              <StatusBadge status={ep.status} />
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
                              {ep.status === 'draft' ? (
                                <button
                                  onClick={() => publishEpisode(ep.id, c.id)}
                                  disabled={episodePublishBusyId === ep.id}
                                  className="shrink-0 rounded-md bg-emerald-500/15 px-2.5 py-1 text-[10px] font-bold text-emerald-300 transition-colors hover:bg-emerald-500/25 disabled:opacity-50"
                                >
                                  {episodePublishBusyId === ep.id ? <Loader2 size={12} className="animate-spin" /> : 'Publish'}
                                </button>
                              ) : (
                                <span className="shrink-0 text-[10px] text-emerald-400">✓</span>
                              )}
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

      {/* Ban dialog */}
      <ConfirmDialog
        open={banDialogOpen}
        title={banType === 'permanent_ban' ? 'Ban Permanen Akun' : 'Blokir Akun'}
        description={
          banTarget
            ? banType === 'permanent_ban'
              ? `Akun "${banTarget.creator.name}" akan diblokir permanen. Tidak bisa login lagi.`
              : `Akun "${banTarget.creator.name}" akan diblokir. Masih bisa baca komik tapi tidak bisa upload lagi.`
            : ''
        }
        confirmLabel={banType === 'permanent_ban' ? 'Ban Permanen' : 'Blokir'}
        loading={banBusyId === banTarget?.id}
        onConfirm={executeBan}
        onCancel={() => setBanDialogOpen(false)}
      >
        <div className="mt-3">
          <label className="mb-1 block text-xs font-medium text-surface-400">Alasan (opsional)</label>
          <input
            value={banReason}
            onChange={(e) => setBanReason(e.target.value)}
            placeholder={banType === 'permanent_ban' ? 'Diblokir permanen oleh admin' : 'Diblokir oleh admin'}
            className="w-full rounded-lg border border-surface-800 bg-surface-950 px-3 py-2 text-sm text-surface-100 placeholder:text-surface-600 focus:border-brand-500 focus:outline-none"
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

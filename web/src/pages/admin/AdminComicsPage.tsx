import { useCallback, useEffect, useState } from 'react'
import { AlertCircle, Eye, Heart, ImageOff, Loader2, Search, Star, Trash2 } from 'lucide-react'
import PageHeader from '../../components/admin/PageHeader'
import { StatusBadge } from '../../components/admin/Badge'
import Pagination from '../../components/admin/Pagination'
import ConfirmDialog from '../../components/admin/ConfirmDialog'
import EmptyState from '../../components/admin/EmptyState'
import { admin, getApiErrorMessage } from '../../services/admin'
import type { AdminComic, ComicStatus } from '../../types'
import { coverEmoji, coverKeyOf, coverStyle } from '../../data/mock'
import { formatDate, formatNumber } from '../../utils/format'

const statusOptions: Array<{ value: ComicStatus; label: string }> = [
  { value: 'ongoing', label: 'Ongoing' },
  { value: 'completed', label: 'Selesai' },
  { value: 'hiatus', label: 'Hiatus' },
]

export default function AdminComicsPage() {
  const [comics, setComics] = useState<AdminComic[]>([])
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 })
  const [q, setQ] = useState('')
  const [status, setStatus] = useState<'' | ComicStatus>('')
  const [visibility, setVisibility] = useState<'all' | 'published' | 'draft'>('all')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busyId, setBusyId] = useState<number | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<AdminComic | null>(null)
  const [coverErrors, setCoverErrors] = useState<Set<number>>(new Set())
  const [deleting, setDeleting] = useState(false)
  const [coverBusyId, setCoverBusyId] = useState<number | null>(null)

  const fetchComics = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await admin.comics({
        q: q || undefined,
        status: status || undefined,
        visibility,
        page,
      })
      setComics(res.data)
      setMeta(res.meta)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Gagal memuat daftar komik.'))
    } finally {
      setLoading(false)
    }
  }, [q, status, visibility, page])

  useEffect(() => {
    fetchComics()
  }, [fetchComics])

  const changeStatus = async (comic: AdminComic, newStatus: ComicStatus) => {
    if (newStatus === comic.status) return
    setBusyId(comic.id)
    setNotice('')
    try {
      const updated = await admin.updateComicStatus(comic.id, newStatus)
      setComics((list) => list.map((c) => (c.id === updated.id ? updated : c)))
      setNotice(`Status "${updated.title}" diubah menjadi ${updated.status}.`)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Gagal mengubah status komik.'))
    } finally {
      setBusyId(null)
    }
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await admin.deleteComic(deleteTarget.id)
      setNotice(`Komik "${deleteTarget.title}" telah dihapus.`)
      setDeleteTarget(null)
      await fetchComics()
    } catch (err) {
      setError(getApiErrorMessage(err, 'Gagal menghapus komik.'))
      setDeleteTarget(null)
    } finally {
      setDeleting(false)
    }
  }

  const deleteCover = async (comic: AdminComic) => {
    setCoverBusyId(comic.id)
    setNotice('')
    try {
      const updated = await admin.deleteComicCover(comic.id)
      setComics((list) => list.map((c) => (c.id === updated.id ? updated : c)))
      setNotice(`Cover "${updated.title}" berhasil dihapus.`)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Gagal menghapus cover.'))
    } finally {
      setCoverBusyId(null)
    }
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Moderasi Komik"
        subtitle="Pantau seluruh komik, ubah status, dan hapus konten yang melanggar"
      />

      {/* Filters */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            setPage(1)
          }}
          className="relative"
        >
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-surface-500" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari judul atau sinopsis…"
            className="w-full rounded-xl border border-surface-800 bg-surface-900 py-2 pl-9 pr-4 text-sm text-surface-100 placeholder:text-surface-500 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 sm:w-72"
          />
        </form>
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as '' | ComicStatus)
            setPage(1)
          }}
          className="rounded-xl border border-surface-800 bg-surface-900 px-3 py-2 text-sm text-surface-200 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
        >
          <option value="">Semua Status</option>
          {statusOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <div className="flex items-center gap-1 rounded-xl border border-surface-800 bg-surface-900 p-1">
          {(
            [
              ['all', 'Semua'],
              ['published', 'Terbit'],
              ['draft', 'Draft'],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              onClick={() => {
                setVisibility(value)
                setPage(1)
              }}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                visibility === value
                  ? 'bg-brand-500/15 text-brand-300'
                  : 'text-surface-400 hover:text-surface-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
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

      <div className="overflow-hidden rounded-2xl border border-surface-800 bg-surface-900">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-surface-500">
            <Loader2 size={20} className="mr-2 animate-spin" /> Memuat data…
          </div>
        ) : comics.length === 0 ? (
          <div className="p-6">
            <EmptyState message="Tidak ada komik yang cocok dengan filter." />
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[700px] text-left text-sm">
                <thead>
                  <tr className="border-b border-surface-800 text-xs uppercase tracking-wide text-surface-500">
                    <th className="px-5 py-3 font-medium">Komik</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 text-center font-medium">Eps</th>
                    <th className="px-5 py-3 text-center font-medium">Rating</th>
                    <th className="px-5 py-3 text-right font-medium">Views</th>
                    <th className="px-5 py-3 text-right font-medium">Likes</th>
                    <th className="px-5 py-3 font-medium">Terbit</th>
                    <th className="px-5 py-3 text-right font-medium">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-800/60">
                  {comics.map((c) => (
                    <tr key={c.id} className="transition-colors hover:bg-surface-800/30">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          {c.cover_url && !coverErrors.has(c.id) ? (
                            <div className="group/cover relative">
                              <img
                                src={c.cover_url}
                                alt={c.title}
                                className="h-12 w-9 shrink-0 rounded-lg object-cover"
                                onError={() => setCoverErrors((prev) => new Set(prev).add(c.id))}
                              />
                              <button
                                onClick={() => deleteCover(c)}
                                disabled={coverBusyId === c.id}
                                className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white opacity-0 shadow-lg transition-opacity group-hover/cover:opacity-100 disabled:opacity-50"
                                title="Hapus cover"
                              >
                                {coverBusyId === c.id ? (
                                  <Loader2 size={10} className="animate-spin" />
                                ) : (
                                  <ImageOff size={10} />
                                )}
                              </button>
                            </div>
                          ) : (
                            <span
                              className="flex h-12 w-9 shrink-0 items-center justify-center rounded-lg text-base"
                              style={{ background: coverStyle(coverKeyOf(c.id)) }}
                            >
                              {coverEmoji(coverKeyOf(c.id))}
                            </span>
                          )}
                          <div className="min-w-0">
                            <p className="max-w-56 truncate font-medium text-surface-100">{c.title}</p>
                            <p className="truncate text-xs text-surface-500">
                              {c.creator.name ?? '—'} · {c.published_at ? formatDate(c.published_at) : 'belum terbit'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex flex-col items-start gap-1.5">
                          <StatusBadge status={c.status} />
                          <select
                            value={c.status}
                            disabled={busyId === c.id}
                            onChange={(e) => changeStatus(c, e.target.value as ComicStatus)}
                            className="rounded-lg border border-surface-800 bg-surface-950 px-2 py-1 text-xs text-surface-300 focus:border-brand-500 focus:outline-none disabled:opacity-50"
                            title="Ubah status"
                          >
                            {statusOptions.map((o) => (
                              <option key={o.value} value={o.value}>
                                {o.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-center text-surface-300">{c.episode_count}</td>
                      <td className="px-5 py-3.5 text-center">
                        <span className="flex items-center justify-center gap-1 text-amber-300">
                          <Star size={13} fill="currentColor" /> {c.rating_avg.toFixed(1)}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right text-surface-300">
                        <span className="flex items-center justify-end gap-1.5">
                          <Eye size={13} className="text-emerald-400" /> {formatNumber(c.view_count)}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right text-surface-300">
                        <span className="flex items-center justify-end gap-1.5">
                          <Heart size={13} className="text-rose-400" /> {formatNumber(c.like_count)}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-surface-400">{formatDate(c.published_at)}</td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {c.cover_url && (
                            <button
                              onClick={() => deleteCover(c)}
                              disabled={coverBusyId === c.id}
                              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-amber-400 transition-colors hover:bg-amber-500/10 disabled:opacity-50"
                              title="Hapus cover komik"
                            >
                              {coverBusyId === c.id ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : (
                                <ImageOff size={14} />
                              )} Hapus Cover
                            </button>
                          )}
                          <button
                            onClick={() => setDeleteTarget(c)}
                            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/10"
                            title="Hapus komik"
                          >
                            <Trash2 size={14} /> Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Mobile Card Layout */}
            <div className="divide-y divide-surface-800/60 md:hidden">
              {comics.map((c) => (
                <div key={c.id} className="p-4">
                  <div className="mb-3 flex items-center gap-3">
                    {c.cover_url && !coverErrors.has(c.id) ? (
                      <div className="group/cover relative">
                        <img
                          src={c.cover_url}
                          alt={c.title}
                          className="h-14 w-10 shrink-0 rounded-lg object-cover"
                          onError={() => setCoverErrors((prev) => new Set(prev).add(c.id))}
                        />
                      </div>
                    ) : (
                      <span
                        className="flex h-14 w-10 shrink-0 items-center justify-center rounded-lg text-lg"
                        style={{ background: coverStyle(coverKeyOf(c.id)) }}
                      >
                        {coverEmoji(coverKeyOf(c.id))}
                      </span>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-surface-100">{c.title}</p>
                      <p className="mt-0.5 text-xs text-surface-500">
                        {c.creator.name ?? '—'} · {c.published_at ? formatDate(c.published_at) : 'belum terbit'}
                      </p>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="mb-1 block text-xs text-surface-500">Status</label>
                    <select
                      value={c.status}
                      disabled={busyId === c.id}
                      onChange={(e) => changeStatus(c, e.target.value as ComicStatus)}
                      className="w-full rounded-lg border border-surface-800 bg-surface-950 px-3 py-2 text-sm text-surface-300 focus:border-brand-500 focus:outline-none disabled:opacity-50"
                    >
                      {statusOptions.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center justify-between text-xs text-surface-400">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1"><Star size={12} className="text-amber-300" fill="currentColor" /> {c.rating_avg.toFixed(1)}</span>
                      <span className="flex items-center gap-1"><Eye size={12} className="text-emerald-400" /> {formatNumber(c.view_count)}</span>
                      <span className="flex items-center gap-1"><Heart size={12} className="text-rose-400" /> {formatNumber(c.like_count)}</span>
                      <span>{c.episode_count} eps</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {c.cover_url && (
                        <button
                          onClick={() => deleteCover(c)}
                          disabled={coverBusyId === c.id}
                          className="rounded-lg p-2 text-amber-400 transition-colors hover:bg-amber-500/10"
                          title="Hapus cover"
                        >
                          {coverBusyId === c.id ? <Loader2 size={16} className="animate-spin" /> : <ImageOff size={16} />}
                        </button>
                      )}
                      <button
                        onClick={() => setDeleteTarget(c)}
                        className="rounded-lg p-2 text-red-400 transition-colors hover:bg-red-500/10"
                        title="Hapus komik"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {!loading && comics.length > 0 && <Pagination meta={meta} onPageChange={setPage} />}

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Hapus Komik"
        description={
          deleteTarget
            ? `Komik "${deleteTarget.title}" beserta seluruh episode dan halamannya akan dihapus. Tindakan ini tidak dapat dibatalkan.`
            : ''
        }
        confirmLabel="Hapus Komik"
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}

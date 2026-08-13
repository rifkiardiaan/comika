import { useCallback, useEffect, useState } from 'react'
import { AlertCircle, Eye, EyeOff, Heart, Loader2, MessageSquare, Search, Trash2 } from 'lucide-react'
import PageHeader from '../../components/admin/PageHeader'
import { Badge, StatusBadge } from '../../components/admin/Badge'
import Pagination from '../../components/admin/Pagination'
import ConfirmDialog from '../../components/admin/ConfirmDialog'
import EmptyState from '../../components/admin/EmptyState'
import { admin, getApiErrorMessage } from '../../services/admin'
import type { AdminComment, CommentModerationStatus } from '../../types'
import { timeAgo } from '../../utils/format'

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<AdminComment[]>([])
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 })
  const [q, setQ] = useState('')
  const [status, setStatus] = useState<'' | CommentModerationStatus | 'deleted'>('')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busyId, setBusyId] = useState<number | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<AdminComment | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchComments = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await admin.comments({ q: q || undefined, status: status || undefined, page })
      setComments(res.data)
      setMeta(res.meta)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Gagal memuat daftar komentar.'))
    } finally {
      setLoading(false)
    }
  }, [q, status, page])

  useEffect(() => {
    fetchComments()
  }, [fetchComments])

  const moderate = async (comment: AdminComment, newStatus: CommentModerationStatus) => {
    setBusyId(comment.id)
    setNotice('')
    try {
      const updated = await admin.moderateComment(comment.id, newStatus)
      setComments((list) => list.map((c) => (c.id === updated.id ? updated : c)))
      setNotice(
        newStatus === 'hidden' ? 'Komentar disembunyikan dari publik.' : 'Komentar ditampilkan kembali.',
      )
    } catch (err) {
      setError(getApiErrorMessage(err, 'Gagal memoderasi komentar.'))
    } finally {
      setBusyId(null)
    }
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await admin.deleteComment(deleteTarget.id)
      setNotice('Komentar telah dihapus permanen.')
      setDeleteTarget(null)
      await fetchComments()
    } catch (err) {
      setError(getApiErrorMessage(err, 'Gagal menghapus komentar.'))
      setDeleteTarget(null)
    } finally {
      setDeleting(false)
    }
  }

  const location = (c: AdminComment) =>
    c.episode ? `${c.comic?.title ?? 'Komik'} · Eps ${c.episode.number}` : (c.comic?.title ?? 'Komik')

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Moderasi Komentar"
        subtitle="Sembunyikan atau hapus komentar yang melanggar aturan komunitas"
      />

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
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
            placeholder="Cari isi komentar…"
            className="w-72 max-w-full rounded-xl border border-surface-800 bg-surface-900 py-2 pl-9 pr-4 text-sm text-surface-100 placeholder:text-surface-500 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
          />
        </form>
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as '' | CommentModerationStatus | 'deleted')
            setPage(1)
          }}
          className="rounded-xl border border-surface-800 bg-surface-900 px-3 py-2 text-sm text-surface-200 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
        >
          <option value="">Semua Status</option>
          <option value="active">Aktif</option>
          <option value="hidden">Disembunyikan</option>
          <option value="deleted">Dihapus</option>
        </select>
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
        ) : comments.length === 0 ? (
          <div className="p-6">
            <EmptyState message="Tidak ada komentar yang cocok dengan filter." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead>
                <tr className="border-b border-surface-800 text-xs uppercase tracking-wide text-surface-500">
                  <th className="px-5 py-3 font-medium">Komentar</th>
                  <th className="px-5 py-3 font-medium">Pengguna</th>
                  <th className="px-5 py-3 font-medium">Lokasi</th>
                  <th className="px-5 py-3 text-center font-medium">Likes</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 text-right font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-800/60">
                {comments.map((c) => (
                  <tr key={c.id} className="transition-colors hover:bg-surface-800/30">
                    <td className="max-w-80 px-5 py-3.5">
                      <p className="line-clamp-2 leading-relaxed text-surface-200">{c.content}</p>
                      <p className="mt-1 text-xs text-surface-500">{timeAgo(c.created_at)}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-pink-500 text-[10px] font-bold text-white">
                          {c.user.name[0]?.toUpperCase()}
                        </span>
                        <span className="truncate text-surface-300">{c.user.name}</span>
                      </div>
                    </td>
                    <td className="max-w-48 truncate px-5 py-3.5 text-xs text-surface-400">{location(c)}</td>
                    <td className="px-5 py-3.5 text-center">
                      <span className="flex items-center justify-center gap-1 text-surface-300">
                        <Heart size={13} className="text-rose-400" /> {c.like_count}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      {status === 'deleted' ? (
                        <Badge tone="red">Terhapus</Badge>
                      ) : (
                        <StatusBadge status={c.status} />
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1.5">
                        {status === 'deleted' ? (
                          <span className="flex items-center gap-1.5 text-xs text-surface-600">
                            <MessageSquare size={13} /> Terhapus permanen
                          </span>
                        ) : (
                          <>
                            <button
                              onClick={() => moderate(c, c.status === 'hidden' ? 'active' : 'hidden')}
                              disabled={busyId === c.id}
                              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-surface-300 transition-colors hover:bg-surface-800 disabled:opacity-50"
                              title={c.status === 'hidden' ? 'Tampilkan kembali' : 'Sembunyikan'}
                            >
                              {busyId === c.id ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : c.status === 'hidden' ? (
                                <Eye size={14} />
                              ) : (
                                <EyeOff size={14} />
                              )}
                              {c.status === 'hidden' ? 'Tampilkan' : 'Sembunyikan'}
                            </button>
                            <button
                              onClick={() => setDeleteTarget(c)}
                              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/10"
                              title="Hapus komentar"
                            >
                              <Trash2 size={14} /> Hapus
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {!loading && comments.length > 0 && <Pagination meta={meta} onPageChange={setPage} />}

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Hapus Komentar"
        description="Komentar ini akan dihapus permanen dan tidak dapat dipulihkan. Lanjutkan?"
        confirmLabel="Hapus Komentar"
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}

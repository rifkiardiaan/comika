import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  Clock,
  Eye,
  FilePlus2,
  Loader2,
  Pencil,
  Plus,
  Send,
  Shield,
  ShieldOff,
  Star,
  Trash2,
  X,
} from 'lucide-react'
import PageHeader from '../../components/admin/PageHeader'
import { StatusBadge } from '../../components/admin/Badge'
import Pagination from '../../components/admin/Pagination'
import ConfirmDialog from '../../components/admin/ConfirmDialog'
import EmptyState from '../../components/admin/EmptyState'
import { auth } from '../../services/auth'
import { content } from '../../services/content'
import { creator } from '../../services/creator'
import { getApiErrorMessage } from '../../utils/errors'
import { coverEmoji, coverKeyOf, coverStyle } from '../../data/mock'
import { formatNumber } from '../../utils/format'
import type { ComicAgeRating, ComicStatus, CreatorComic, Genre, VerificationStatus } from '../../types'

const statusOptions: Array<{ value: ComicStatus; label: string }> = [
  { value: 'ongoing', label: 'Ongoing' },
  { value: 'completed', label: 'Selesai' },
  { value: 'hiatus', label: 'Hiatus' },
]

const ageOptions: Array<{ value: ComicAgeRating; label: string }> = [
  { value: 'semua_umur', label: 'Semua Umur' },
  { value: 'remaja', label: 'Remaja (13+)' },
  { value: 'dewasa', label: 'Dewasa (18+)' },
]

interface ComicForm {
  title: string
  synopsis: string
  status: ComicStatus
  age_rating: ComicAgeRating
  genres: number[]
  cover: File | null
}

const emptyForm: ComicForm = { title: '', synopsis: '', status: 'ongoing', age_rating: 'remaja', genres: [], cover: null }

function VerificationBadge({ status, reason }: { status: VerificationStatus; reason?: string | null }) {
  switch (status) {
    case 'approved':
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-1 text-[10px] font-bold text-emerald-300">
          <CheckCircle2 size={10} /> Disetujui
        </span>
      )
    case 'rejected':
      return (
        <span
          className="inline-flex items-center gap-1 rounded-full bg-red-500/15 px-2.5 py-1 text-[10px] font-bold text-red-300"
          title={reason || 'Ditolak admin'}
        >
          <X size={10} /> Ditolak
        </span>
      )
    case 'pending':
    default:
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-1 text-[10px] font-bold text-amber-300">
          <Clock size={10} /> Menunggu Review
        </span>
      )
  }
}

export default function CreatorComicsPage() {
  const [user] = useState(() => auth.getStoredUser())
  const [comics, setComics] = useState<CreatorComic[]>([])
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 })
  const [page, setPage] = useState(1)
  const [genres, setGenres] = useState<Genre[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  // Modal buat/edit
  const [modal, setModal] = useState<'create' | 'edit' | null>(null)
  const [editing, setEditing] = useState<CreatorComic | null>(null)
  const [form, setForm] = useState<ComicForm>(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  // Hapus
  const [deleteTarget, setDeleteTarget] = useState<CreatorComic | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Cek apakah creator diblokir
  const isBlocked = (user as any)?.is_banned || (user as any)?.is_permanently_banned

  const fetchComics = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await creator.comics(page)
      setComics(res.data)
      setMeta(res.meta)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Gagal memuat daftar komik.'))
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => {
    if (user?.role === 'creator') fetchComics()
  }, [user, fetchComics])

  useEffect(() => {
    if (modal && genres.length === 0) {
      content.genres().then(setGenres).catch(() => {})
    }
  }, [modal, genres.length])

  const openCreate = () => {
    if (isBlocked) {
      setNotice('Akun Anda sedang diblokir. Anda tidak dapat mengunggah komik baru.')
      return
    }
    setEditing(null)
    setForm(emptyForm)
    setFormError('')
    setModal('create')
  }

  const openEdit = (comic: CreatorComic) => {
    if (isBlocked) {
      setNotice('Akun Anda sedang diblokir. Anda tidak dapat mengedit komik.')
      return
    }
    setEditing(comic)
    setForm({
      title: comic.title,
      synopsis: comic.synopsis,
      status: comic.status,
      age_rating: comic.age_rating,
      genres: comic.genres.map((g) => g.id),
      cover: null,
    })
    setFormError('')
    setModal('edit')
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    if (!form.title.trim()) return setFormError('Judul wajib diisi.')
    if (!form.synopsis.trim()) return setFormError('Sinopsis wajib diisi.')
    if (form.genres.length === 0) return setFormError('Pilih minimal 1 genre.')

    const payload = new FormData()
    payload.append('title', form.title.trim())
    payload.append('synopsis', form.synopsis.trim())
    payload.append('status', form.status)
    payload.append('age_rating', form.age_rating)
    form.genres.forEach((id) => payload.append('genres[]', String(id)))
    if (form.cover) payload.append('cover', form.cover)

    setSubmitting(true)
    try {
      if (modal === 'edit' && editing) {
        await content.updateComic(editing.id, payload)
        setNotice(`Komik "${form.title.trim()}" berhasil diperbarui.`)
      } else {
        await content.createComic(payload)
        setNotice(`Komik "${form.title.trim()}" berhasil diunggah! Komik akan ditinjau oleh admin sebelum diterbitkan.`)
      }
      setModal(null)
      await fetchComics()
    } catch (err) {
      setFormError(getApiErrorMessage(err, 'Gagal menyimpan komik.'))
    } finally {
      setSubmitting(false)
    }
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await content.deleteComic(deleteTarget.id)
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

  return (
    <div className="mx-auto max-w-7xl animate-fade-in px-4 py-10 sm:px-6">
      <PageHeader
        title="Kelola Komik"
        subtitle="Unggah, edit, dan pantau seluruh komik Anda"
        actions={
          <button
            onClick={openCreate}
            disabled={!!isBlocked}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-pink-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-600/25 transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send size={16} /> Upload Komik
          </button>
        }
      />

      {/* Blocked notice */}
      {isBlocked && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/5 px-5 py-4">
          <ShieldOff size={20} className="shrink-0 text-red-400" />
          <div>
            <p className="text-sm font-semibold text-red-300">Akun Anda Diblokir</p>
            <p className="mt-0.5 text-xs text-red-400/80">
              Anda tidak dapat mengunggah atau mengedit komik. Hubungi admin untuk informasi lebih lanjut.
            </p>
          </div>
        </div>
      )}

      {/* Info banner */}
      <div className="mb-6 flex items-center gap-3 rounded-xl border border-brand-500/30 bg-brand-500/5 px-5 py-4">
        <Shield size={18} className="shrink-0 text-brand-300" />
        <p className="text-xs text-brand-200/80">
          Komik yang Anda unggah akan masuk ke review admin. Admin akan menyetujui, menolak, atau memblokir komik Anda sebelum diterbitkan.
        </p>
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-300">
          <AlertCircle size={16} /> {error}
        </div>
      )}
      {notice && (
        <div className="mb-6 rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-300">
          {notice}
        </div>
      )}

      {/* Stats summary */}
      {!loading && comics.length > 0 && (
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-surface-800 bg-surface-900 p-3 text-center">
            <p className="text-lg font-bold text-surface-50">{comics.length}</p>
            <p className="text-[10px] text-surface-400">Total Komik</p>
          </div>
          <div className="rounded-xl border border-surface-800 bg-surface-900 p-3 text-center">
            <p className="text-lg font-bold text-amber-300">
              {comics.filter((c) => c.verification_status === 'pending').length}
            </p>
            <p className="text-[10px] text-surface-400">⏳ Pending Review</p>
          </div>
          <div className="rounded-xl border border-surface-800 bg-surface-900 p-3 text-center">
            <p className="text-lg font-bold text-emerald-300">
              {comics.filter((c) => c.verification_status === 'approved').length}
            </p>
            <p className="text-[10px] text-surface-400">✓ Disetujui</p>
          </div>
          <div className="rounded-xl border border-surface-800 bg-surface-900 p-3 text-center">
            <p className="text-lg font-bold text-red-300">
              {comics.filter((c) => c.verification_status === 'rejected').length}
            </p>
            <p className="text-[10px] text-surface-400">✗ Ditolak</p>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-surface-800 bg-surface-900">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-surface-500">
            <Loader2 size={20} className="mr-2 animate-spin" /> Memuat komik…
          </div>
        ) : comics.length === 0 ? (
          <div className="p-6">
            <EmptyState message="Belum ada komik. Klik Upload Komik untuk mulai mengunggah karya Anda." />
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[800px] text-left text-sm">
                <thead>
                  <tr className="border-b border-surface-800 text-xs uppercase tracking-wide text-surface-500">
                    <th className="px-5 py-3 font-medium">Komik</th>
                    <th className="px-5 py-3 font-medium">Verifikasi</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 text-center font-medium">Eps</th>
                    <th className="px-5 py-3 text-center font-medium">Rating</th>
                    <th className="px-5 py-3 text-right font-medium">Views</th>
                    <th className="px-5 py-3 text-right font-medium">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-800/60">
                  {comics.map((c) => (
                    <tr key={c.id} className="transition-colors hover:bg-surface-800/30">
                      <td className="px-5 py-3.5">
                        <Link to={`/creator/comics/${c.id}`} className="flex items-center gap-3">
                          <span
                            className="flex h-14 w-10 shrink-0 items-center justify-center rounded-lg text-lg"
                            style={{ background: coverStyle(coverKeyOf(c.id)) }}
                          >
                            {coverEmoji(coverKeyOf(c.id))}
                          </span>
                          <div className="min-w-0">
                            <p className="max-w-56 truncate font-medium text-surface-100 transition-colors hover:text-brand-300">
                              {c.title}
                            </p>
                            <p className="text-xs text-surface-500">
                              {c.published_episodes_count} terbit · {c.draft_episodes_count} draft · {c.comments_count} komentar
                            </p>
                            {c.rejection_reason && c.verification_status === 'rejected' && (
                              <p className="mt-0.5 max-w-48 truncate text-[10px] text-red-400" title={c.rejection_reason}>
                                Alasan: {c.rejection_reason}
                              </p>
                            )}
                          </div>
                        </Link>
                      </td>
                      <td className="px-5 py-3.5">
                        <VerificationBadge status={c.verification_status} reason={c.rejection_reason} />
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={c.status} />
                      </td>
                      <td className="px-5 py-3.5 text-center text-surface-300">{c.episode_count}</td>
                      <td className="px-5 py-3.5 text-center">
                        <span className="flex items-center justify-center gap-1 text-amber-300">
                          <Star size={13} fill="currentColor" /> {c.rating_avg.toFixed(1)}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <span className="flex items-center justify-end gap-1.5 text-surface-300">
                          <Eye size={13} className="text-emerald-400" /> {formatNumber(c.view_count)}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            to={`/creator/comics/${c.id}/analytics`}
                            className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-brand-300 transition-colors hover:bg-brand-500/10"
                            title="Analitik"
                          >
                            <Star size={14} />
                          </Link>
                          <button
                            onClick={() => openEdit(c)}
                            disabled={!!isBlocked}
                            className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-sky-300 transition-colors hover:bg-sky-500/10 disabled:opacity-40"
                            title="Edit"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(c)}
                            className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/10"
                            title="Hapus"
                          >
                            <Trash2 size={14} />
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
                  <Link to={`/creator/comics/${c.id}`} className="mb-3 flex items-center gap-3">
                    <span
                      className="flex h-14 w-10 shrink-0 items-center justify-center rounded-lg text-lg"
                      style={{ background: coverStyle(coverKeyOf(c.id)) }}
                    >
                      {coverEmoji(coverKeyOf(c.id))}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-surface-100 transition-colors hover:text-brand-300">
                        {c.title}
                      </p>
                      <div className="mt-1 flex items-center gap-2 flex-wrap">
                        <VerificationBadge status={c.verification_status} reason={c.rejection_reason} />
                        <StatusBadge status={c.status} />
                        <span className="text-xs text-surface-500">{c.episode_count} eps</span>
                      </div>
                    </div>
                  </Link>
                  {c.rejection_reason && c.verification_status === 'rejected' && (
                    <p className="mb-2 ml-16 text-[10px] text-red-400">
                      Alasan penolakan: {c.rejection_reason}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-xs text-surface-400">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1"><Star size={12} className="text-amber-300" fill="currentColor" /> {c.rating_avg.toFixed(1)}</span>
                      <span className="flex items-center gap-1"><Eye size={12} className="text-emerald-400" /> {formatNumber(c.view_count)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Link
                        to={`/creator/comics/${c.id}/analytics`}
                        className="rounded-lg p-2 text-brand-300 transition-colors hover:bg-brand-500/10"
                      >
                        <Star size={16} />
                      </Link>
                      <button
                        onClick={() => openEdit(c)}
                        disabled={!!isBlocked}
                        className="rounded-lg p-2 text-sky-300 transition-colors hover:bg-sky-500/10 disabled:opacity-40"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(c)}
                        className="rounded-lg p-2 text-red-400 transition-colors hover:bg-red-500/10"
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

      {/* ====== Modal buat/edit ====== */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={submitting ? undefined : () => setModal(null)} />
          <div className="relative max-h-[90vh] w-full max-w-lg animate-slide-up overflow-y-auto rounded-2xl border border-surface-800 bg-surface-900 p-5 sm:p-6 shadow-2xl shadow-black/60">
            <div className="sticky top-0 z-10 -mx-5 -mt-5 mb-4 flex items-start justify-between gap-4 border-b border-surface-800 bg-surface-900 px-5 py-4 sm:-mx-6 sm:px-6">
              <div>
                <h3 className="flex items-center gap-2 font-display text-lg font-bold text-surface-50">
                  {modal === 'edit' ? <Pencil size={18} className="text-sky-300" /> : <Send size={18} className="text-brand-300" />}
                  {modal === 'edit' ? 'Edit Komik' : 'Upload Komik Baru'}
                </h3>
                <p className="mt-1 text-xs text-surface-500">
                  {modal === 'edit'
                    ? 'Perbarui detail komik Anda.'
                    : 'Lengkapi informasi komik. Komik akan ditinjau admin sebelum diterbitkan.'}
                </p>
              </div>
              <button
                onClick={() => setModal(null)}
                disabled={submitting}
                className="sticky top-4 z-20 rounded-lg p-2 text-surface-400 transition-colors hover:bg-surface-800 hover:text-surface-50"
                aria-label="Tutup"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={submit} className="mt-5 space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-surface-200">Judul *</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Judul komik Anda"
                  maxLength={120}
                  className="w-full rounded-xl border border-surface-800 bg-surface-950 px-4 py-3 text-sm text-surface-100 placeholder:text-surface-500 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-surface-200">Sinopsis *</label>
                <textarea
                  value={form.synopsis}
                  onChange={(e) => setForm({ ...form, synopsis: e.target.value })}
                  rows={4}
                  maxLength={5000}
                  placeholder="Ceritakan kisah komik Anda…"
                  className="w-full resize-none rounded-xl border border-surface-800 bg-surface-950 px-4 py-3 text-sm text-surface-100 placeholder:text-surface-500 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-surface-200">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as ComicStatus })}
                    className="w-full rounded-xl border border-surface-800 bg-surface-950 px-4 py-3 text-sm text-surface-100 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                  >
                    {statusOptions.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-surface-200">Umur</label>
                  <select
                    value={form.age_rating}
                    onChange={(e) => setForm({ ...form, age_rating: e.target.value as ComicAgeRating })}
                    className="w-full rounded-xl border border-surface-800 bg-surface-950 px-4 py-3 text-sm text-surface-100 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                  >
                    {ageOptions.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-surface-200">Genre (maks 5)</label>
                <div className="flex flex-wrap gap-2">
                  {genres.map((g) => {
                    const active = form.genres.includes(g.id)
                    return (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() =>
                          setForm((f) => ({
                            ...f,
                            genres: active ? f.genres.filter((x) => x !== g.id) : f.genres.length >= 5 ? f.genres : [...f.genres, g.id],
                          }))
                        }
                        className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                          active
                            ? 'bg-gradient-to-r from-brand-600 to-pink-600 text-white shadow-lg shadow-brand-600/25'
                            : 'border border-surface-700 bg-surface-950 text-surface-300 hover:border-brand-500/50 hover:text-surface-50'
                        }`}
                      >
                        {g.name}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-surface-200">Cover (opsional, maks 2MB)</label>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-surface-700 bg-surface-950 px-4 py-4 text-sm text-surface-400 transition-colors hover:border-brand-500/50 hover:text-surface-200"
                >
                  {form.cover ? (
                    <>
                      <BookOpen size={15} className="text-brand-300" /> {form.cover.name}
                    </>
                  ) : (
                    <>
                      <Plus size={15} /> Pilih file gambar
                    </>
                  )}
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => setForm({ ...form, cover: e.target.files?.[0] ?? null })}
                />
              </div>

              {formError && (
                <p className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-2.5 text-sm text-red-300">
                  <AlertCircle size={15} /> {formError}
                </p>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModal(null)}
                  disabled={submitting}
                  className="rounded-xl border border-surface-700 px-4 py-2.5 text-sm font-medium text-surface-300 transition-colors hover:bg-surface-800 disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-pink-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-600/25 transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? <Loader2 size={15} className="animate-spin" /> : modal === 'edit' ? <Pencil size={15} /> : <Send size={15} />}
                  {submitting ? 'Menyimpan…' : modal === 'edit' ? 'Simpan Perubahan' : 'Upload Komik'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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

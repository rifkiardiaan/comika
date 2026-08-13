import { useEffect, useState } from 'react'
import { AlertCircle, Loader2, Pencil, Plus, Tag, Trash2, X } from 'lucide-react'
import PageHeader from '../../components/admin/PageHeader'
import ConfirmDialog from '../../components/admin/ConfirmDialog'
import EmptyState from '../../components/admin/EmptyState'
import { admin, getApiErrorMessage } from '../../services/admin'
import type { Genre } from '../../types'

interface GenreForm {
  id: number | null
  name: string
  slug: string
}

const emptyForm: GenreForm = { id: null, name: '', slug: '' }

export default function AdminGenresPage() {
  const [genres, setGenres] = useState<Genre[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [form, setForm] = useState<GenreForm | null>(null)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<Genre | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchGenres = async () => {
    setLoading(true)
    setError('')
    try {
      const list = await admin.genres()
      setGenres(list)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Gagal memuat daftar genre.'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGenres()
  }, [])

  const slugify = (value: string) =>
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')

  const save = async () => {
    if (!form) return
    const name = form.name.trim()
    if (!name) {
      setFormError('Nama genre wajib diisi.')
      return
    }
    setSaving(true)
    setFormError('')
    try {
      const payload = { name, slug: form.slug.trim() || undefined }
      if (form.id === null) {
        await admin.createGenre(payload)
        setNotice(`Genre "${name}" berhasil ditambahkan.`)
      } else {
        await admin.updateGenre(form.id, payload)
        setNotice(`Genre "${name}" berhasil diperbarui.`)
      }
      setForm(null)
      await fetchGenres()
    } catch (err) {
      const anyErr = err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } }
      const fieldMsg = anyErr.response?.data?.errors
        ? Object.values(anyErr.response.data.errors)[0]?.[0]
        : undefined
      setFormError(fieldMsg ?? getApiErrorMessage(err, 'Gagal menyimpan genre.'))
    } finally {
      setSaving(false)
    }
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await admin.deleteGenre(deleteTarget.id)
      setGenres((list) => list.filter((g) => g.id !== deleteTarget.id))
      setNotice(`Genre "${deleteTarget.name}" telah dihapus.`)
      setDeleteTarget(null)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Gagal menghapus genre.'))
      setDeleteTarget(null)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Manajemen Genre"
        subtitle="Kelola kategori genre untuk klasifikasi komik"
        actions={
          <button
            onClick={() => setForm({ ...emptyForm })}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-pink-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-brand-600/25 transition-all hover:brightness-110"
          >
            <Plus size={16} /> Tambah Genre
          </button>
        }
      />

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

      {loading ? (
        <div className="flex items-center justify-center rounded-2xl border border-surface-800 bg-surface-900 py-20 text-surface-500">
          <Loader2 size={20} className="mr-2 animate-spin" /> Memuat data…
        </div>
      ) : genres.length === 0 ? (
        <EmptyState message="Belum ada genre. Tambahkan genre pertama untuk memulai." />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {genres.map((g) => (
            <div
              key={g.id}
              className="group flex items-center gap-3 rounded-2xl border border-surface-800 bg-surface-900 p-4 transition-all hover:border-brand-500/50 hover:shadow-lg hover:shadow-brand-500/5"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-500/10 text-brand-300">
                <Tag size={18} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-surface-100">{g.name}</p>
                <p className="truncate text-xs text-surface-500">/{g.slug}</p>
              </div>
              <div className="flex shrink-0 items-center gap-1 opacity-60 transition-opacity group-hover:opacity-100">
                <button
                  onClick={() => setForm({ id: g.id, name: g.name, slug: g.slug })}
                  className="rounded-lg p-2 text-surface-300 transition-colors hover:bg-surface-800 hover:text-brand-300"
                  title="Edit genre"
                >
                  <Pencil size={15} />
                </button>
                <button
                  onClick={() => setDeleteTarget(g)}
                  className="rounded-lg p-2 text-surface-300 transition-colors hover:bg-surface-800 hover:text-red-400"
                  title="Hapus genre"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form modal */}
      {form && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={saving ? undefined : () => setForm(null)} />
          <div className="relative w-full max-w-md animate-slide-up rounded-2xl border border-surface-800 bg-surface-900 p-6 shadow-2xl shadow-black/60">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-bold text-surface-50">
                {form.id === null ? 'Tambah Genre' : 'Edit Genre'}
              </h3>
              <button
                onClick={() => setForm(null)}
                disabled={saving}
                className="rounded-lg p-1.5 text-surface-400 transition-colors hover:bg-surface-800 hover:text-surface-50"
                aria-label="Tutup"
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                save()
              }}
              className="mt-5 space-y-4"
              noValidate
            >
              <div>
                <label className="mb-1.5 block text-sm font-medium text-surface-200">Nama Genre *</label>
                <input
                  autoFocus
                  value={form.name}
                  onChange={(e) => {
                    const name = e.target.value
                    setForm((f) => (f ? { ...f, name, slug: f.slug === slugify(f.name) ? slugify(name) : f.slug } : f))
                  }}
                  placeholder="Contoh: Slice of Life"
                  className="w-full rounded-xl border border-surface-800 bg-surface-950 px-4 py-2.5 text-sm text-surface-100 placeholder:text-surface-500 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-surface-200">Slug (opsional)</label>
                <input
                  value={form.slug}
                  onChange={(e) => setForm((f) => (f ? { ...f, slug: e.target.value } : f))}
                  placeholder={form.name ? slugify(form.name) : 'otomatis-dari-nama'}
                  className="w-full rounded-xl border border-surface-800 bg-surface-950 px-4 py-2.5 text-sm text-surface-100 placeholder:text-surface-500 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                />
              </div>

              {formError && (
                <p className="rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-400">{formError}</p>
              )}

              <div className="flex justify-end gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setForm(null)}
                  disabled={saving}
                  className="rounded-xl border border-surface-700 px-4 py-2 text-sm font-medium text-surface-300 transition-colors hover:bg-surface-800 disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-pink-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-brand-600/25 transition-all hover:brightness-110 disabled:opacity-60"
                >
                  {saving && <Loader2 size={15} className="animate-spin" />}
                  {saving ? 'Menyimpan…' : form.id === null ? 'Tambah Genre' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Hapus Genre"
        description={
          deleteTarget
            ? `Genre "${deleteTarget.name}" akan dihapus dari platform. Komik yang memakai genre ini tidak akan terhapus, tetapi klasifikasinya hilang.`
            : ''
        }
        confirmLabel="Hapus Genre"
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}

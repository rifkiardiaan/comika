import { useCallback, useEffect, useRef, useState } from 'react'
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileImage,
  Loader2,
  Replace,
  Trash2,
  Upload,
  X,
  ZoomIn,
} from 'lucide-react'
import { content } from '../../services/content'
import { getApiErrorMessage } from '../../utils/errors'
import type { EpisodePage } from '../../types'

interface Props {
  episodeId: number
  episodeNumber: number
  episodeTitle: string
  open: boolean
  onClose: () => void
  onUpdated: () => void
}

export default function EpisodePagesManager({
  episodeId,
  episodeNumber,
  episodeTitle,
  open,
  onClose,
  onUpdated,
}: Props) {
  const [pages, setPages] = useState<EpisodePage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  // Upload baru
  const [newFiles, setNewFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const addFileRef = useRef<HTMLInputElement>(null)

  // Replace halaman
  const [replaceTarget, setReplaceTarget] = useState<EpisodePage | null>(null)
  const [replacing, setReplacing] = useState(false)
  const [replaceError, setReplaceError] = useState('')
  const replaceFileRef = useRef<HTMLInputElement>(null)
  const [replaceFile, setReplaceFile] = useState<File | null>(null)

  // Preview
  const [previewPage, setPreviewPage] = useState<EpisodePage | null>(null)

  // Hapus
  const [deleteTarget, setDeleteTarget] = useState<EpisodePage | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchPages = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await content.episodePages(episodeId)
      setPages(data)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Gagal memuat halaman.'))
    } finally {
      setLoading(false)
    }
  }, [episodeId])

  useEffect(() => {
    if (open && episodeId) fetchPages()
  }, [open, episodeId, fetchPages])

  // Reset state saat tutup
  useEffect(() => {
    if (!open) {
      setNewFiles([])
      setUploadError('')
      setNotice('')
      setError('')
      setReplaceTarget(null)
      setReplaceFile(null)
      setReplaceError('')
      setPreviewPage(null)
      setDeleteTarget(null)
    }
  }, [open])

  const handleAddFiles = async () => {
    if (newFiles.length === 0) return
    setUploading(true)
    setUploadError('')
    try {
      await content.uploadPages(episodeId, newFiles)
      setNotice(`${newFiles.length} halaman berhasil ditambahkan.`)
      setNewFiles([])
      await fetchPages()
      onUpdated()
    } catch (err) {
      setUploadError(getApiErrorMessage(err, 'Gagal mengunggah halaman.'))
    } finally {
      setUploading(false)
    }
  }

  const handleReplace = async () => {
    if (!replaceTarget || !replaceFile) return
    setReplacing(true)
    setReplaceError('')
    try {
      await content.replacePage(replaceTarget.id, replaceFile)
      setNotice(`Halaman ${replaceTarget.page_number} berhasil diganti.`)
      setReplaceTarget(null)
      setReplaceFile(null)
      await fetchPages()
      onUpdated()
    } catch (err) {
      setReplaceError(getApiErrorMessage(err, 'Gagal mengganti halaman.'))
    } finally {
      setReplacing(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await content.deletePage(deleteTarget.id)
      setNotice(`Halaman ${deleteTarget.page_number} berhasil dihapus.`)
      setDeleteTarget(null)
      await fetchPages()
      onUpdated()
    } catch (err) {
      setError(getApiErrorMessage(err, 'Gagal menghapus halaman.'))
    } finally {
      setDeleting(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative flex max-h-[90vh] w-full max-w-5xl flex-col rounded-2xl border border-surface-800 bg-surface-900 shadow-2xl shadow-black/60">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-surface-800 px-4 py-3 sm:px-6 sm:py-4">
          <div className="min-w-0 flex-1">
            <h3 className="flex items-center gap-2 font-display text-base font-bold text-surface-50 sm:text-lg">
              <FileImage size={18} className="shrink-0 text-sky-300" />
              Kelola Halaman
            </h3>
            <p className="mt-0.5 truncate text-xs text-surface-400">
              Episode {episodeNumber} — {episodeTitle}
            </p>
          </div>
          <button
            onClick={onClose}
            className="ml-3 shrink-0 rounded-xl p-2.5 text-surface-400 transition-colors hover:bg-surface-800 hover:text-surface-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-300">
              <AlertCircle size={16} /> {error}
            </div>
          )}
          {notice && (
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-300">
              <CheckCircle2 size={16} /> {notice}
            </div>
          )}

          {/* Existing Pages Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-16 text-surface-500">
              <Loader2 size={20} className="mr-2 animate-spin" /> Memuat halaman…
            </div>
          ) : pages.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-surface-700 bg-surface-950 py-16 text-center">
              <FileImage size={40} className="mb-3 text-surface-600" />
              <p className="text-sm text-surface-400">Belum ada halaman. Unggah gambar komik di bawah.</p>
            </div>
          ) : (
            <>
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-medium text-surface-300">
                  {pages.length} Halaman
                </p>
                <p className="hidden text-xs text-surface-500 sm:inline">
                  Klik gambar untuk preview · Hover untuk aksi
                </p>
                <p className="text-xs text-surface-500 sm:hidden">
                  Ketuk gambar untuk preview
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {pages.map((page) => (
                  <div
                    key={page.id}
                    className="group relative overflow-hidden rounded-xl border border-surface-800 bg-surface-950 shadow-md transition-all hover:border-surface-600 hover:shadow-lg"
                  >
                    {/* Thumbnail */}
                    <div
                      className="relative aspect-[3/4] w-full cursor-pointer overflow-hidden bg-surface-900"
                      onClick={() => setPreviewPage(page)}
                    >
                      <img
                        src={page.image_url}
                        alt={`Halaman ${page.page_number}`}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      {/* Overlay — always visible on mobile for readability */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100" />

                      {/* Page Number Badge */}
                      <span className="absolute left-2 top-2 flex h-6 w-6 items-center justify-center rounded-md bg-black/70 text-xs font-bold text-white backdrop-blur-sm">
                        {page.page_number}
                      </span>

                      {/* Action Buttons — always visible on mobile, hover on desktop */}
                      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-center gap-1 rounded-lg bg-black/40 py-1 backdrop-blur-sm sm:bg-transparent sm:py-0 sm:backdrop-blur-none sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setPreviewPage(page)
                          }}
                          className="rounded-md bg-white/20 p-1.5 text-white transition-colors hover:bg-white/30"
                          title="Preview"
                        >
                          <ZoomIn size={13} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setReplaceTarget(page)
                            setReplaceFile(null)
                            setReplaceError('')
                          }}
                          className="rounded-md bg-sky-500/80 p-1.5 text-white transition-colors hover:bg-sky-500"
                          title="Ganti Gambar"
                        >
                          <Replace size={13} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setDeleteTarget(page)
                          }}
                          className="rounded-md bg-red-500/80 p-1.5 text-white transition-colors hover:bg-red-500"
                          title="Hapus"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Upload Area */}
          <div className="mt-6">
            <h4 className="mb-3 text-sm font-semibold text-surface-200">Tambah Halaman Baru</h4>
            <button
              type="button"
              onClick={() => addFileRef.current?.click()}
              className="flex w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-surface-700 bg-surface-950 px-4 py-8 text-sm text-surface-400 transition-colors hover:border-sky-500/50 hover:text-surface-200"
            >
              <Upload size={28} className="text-surface-500" />
              {newFiles.length === 0
                ? 'Klik untuk pilih gambar (bisa banyak sekaligus, maks 5MB/file)'
                : `${newFiles.length} file dipilih — siap diunggah`}
            </button>
            <input
              ref={addFileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="hidden"
              onChange={(e) => setNewFiles(Array.from(e.target.files ?? []))}
            />

            {/* Preview file yang dipilih */}
            {newFiles.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {newFiles.map((f, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 rounded-lg border border-surface-700 bg-surface-950 px-3 py-1.5 text-xs text-surface-300"
                  >
                    <FileImage size={12} className="text-sky-400" />
                    <span className="max-w-[140px] truncate">{f.name}</span>
                    <button
                      onClick={() => setNewFiles((prev) => prev.filter((_, idx) => idx !== i))}
                      className="rounded p-0.5 text-surface-500 hover:text-red-400"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {uploadError && (
              <p className="mt-3 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-2.5 text-sm text-red-300">
                <AlertCircle size={15} /> {uploadError}
              </p>
            )}

            {newFiles.length > 0 && (
              <div className="mt-4 flex justify-end">
                <button
                  onClick={handleAddFiles}
                  disabled={uploading}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-sky-600/25 transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {uploading ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
                  {uploading ? 'Mengunggah…' : `Unggah ${newFiles.length} Halaman`}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ====== Modal Preview ====== */}
      {previewPage && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90">
          {/* Close button — below header, right side */}
          <button
            onClick={() => setPreviewPage(null)}
            className="absolute right-4 top-20 z-[70] flex items-center gap-2 rounded-2xl bg-gradient-to-r from-red-500 to-pink-500 px-5 py-3 text-sm font-semibold text-white shadow-xl shadow-red-500/30 transition-all hover:brightness-110 hover:scale-105 active:scale-95 sm:right-6 sm:top-24"
          >
            <X size={18} /> Tutup
          </button>

          {/* Prev — bottom on mobile, left on desktop */}
          {pages.indexOf(previewPage) > 0 && (
            <button
              onClick={() => {
                const idx = pages.indexOf(previewPage)
                setPreviewPage(pages[idx - 1])
              }}
              className="absolute bottom-24 left-1/2 z-[70] -translate-x-16 rounded-full bg-white/15 p-4 text-white backdrop-blur-md transition-all hover:bg-white/25 hover:scale-110 active:scale-95 sm:bottom-auto sm:left-6 sm:top-1/2 sm:-translate-x-0 sm:-translate-y-1/2 sm:p-3"
            >
              <ChevronLeft size={26} />
            </button>
          )}

          {/* Next — bottom on mobile, right on desktop */}
          {pages.indexOf(previewPage) < pages.length - 1 && (
            <button
              onClick={() => {
                const idx = pages.indexOf(previewPage)
                setPreviewPage(pages[idx + 1])
              }}
              className="absolute bottom-24 right-1/2 z-[70] translate-x-16 rounded-full bg-white/15 p-4 text-white backdrop-blur-md transition-all hover:bg-white/25 hover:scale-110 active:scale-95 sm:bottom-auto sm:right-6 sm:top-1/2 sm:translate-x-0 sm:-translate-y-1/2 sm:p-3"
            >
              <ChevronRight size={26} />
            </button>
          )}

          {/* Image with proper z-index */}
          <img
            src={previewPage.image_url}
            alt={`Halaman ${previewPage.page_number}`}
            className="relative z-[65] max-h-[85vh] max-w-[90vw] rounded-lg object-contain shadow-2xl"
          />

          {/* Info bar */}
          <div className="absolute bottom-4 left-1/2 z-[70] -translate-x-1/2 rounded-full bg-black/70 px-5 py-2.5 text-sm font-medium text-white backdrop-blur-md">
            Halaman {previewPage.page_number} dari {pages.length}
          </div>
        </div>
      )}

      {/* ====== Modal Replace ====== */}
      {replaceTarget && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={replacing ? undefined : () => setReplaceTarget(null)}
          />
          <div className="relative w-full max-w-md animate-slide-up rounded-2xl border border-surface-800 bg-surface-900 p-6 shadow-2xl shadow-black/60">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="flex items-center gap-2 font-display text-lg font-bold text-surface-50">
                  <Replace size={18} className="text-sky-300" /> Ganti Halaman {replaceTarget.page_number}
                </h3>
                <p className="mt-1 text-xs text-surface-500">Pilih gambar baru untuk mengganti halaman ini.</p>
              </div>
              <button
                onClick={() => setReplaceTarget(null)}
                disabled={replacing}
                className="rounded-lg p-1.5 text-surface-400 transition-colors hover:bg-surface-800 hover:text-surface-50"
              >
                <X size={18} />
              </button>
            </div>

            {/* Current image */}
            <div className="mt-4 flex justify-center">
              <div className="relative h-40 w-28 overflow-hidden rounded-lg border border-surface-700">
                <img
                  src={replaceTarget.image_url}
                  alt={`Halaman ${replaceTarget.page_number}`}
                  className="h-full w-full object-cover"
                />
                <span className="absolute left-1 top-1 flex h-5 w-5 items-center justify-center rounded bg-black/60 text-[10px] font-bold text-white">
                  {replaceTarget.page_number}
                </span>
              </div>
            </div>

            {/* New file picker */}
            <button
              type="button"
              onClick={() => replaceFileRef.current?.click()}
              className="mt-4 flex w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-surface-700 bg-surface-950 px-4 py-6 text-sm text-surface-400 transition-colors hover:border-sky-500/50 hover:text-surface-200"
            >
              <FileImage size={24} className="text-surface-500" />
              {replaceFile ? replaceFile.name : 'Klik untuk pilih gambar baru (jpeg/png/webp, ≤5MB)'}
            </button>
            <input
              ref={replaceFileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => setReplaceFile(e.target.files?.[0] ?? null)}
            />

            {replaceError && (
              <p className="mt-3 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-2.5 text-sm text-red-300">
                <AlertCircle size={15} /> {replaceError}
              </p>
            )}

            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => setReplaceTarget(null)}
                disabled={replacing}
                className="rounded-xl border border-surface-700 px-4 py-2.5 text-sm font-medium text-surface-300 transition-colors hover:bg-surface-800 disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={handleReplace}
                disabled={replacing || !replaceFile}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-sky-600/25 transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {replacing ? <Loader2 size={15} className="animate-spin" /> : <Replace size={15} />}
                {replacing ? 'Mengganti…' : 'Ganti Gambar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====== Confirm Delete ====== */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={deleting ? undefined : () => setDeleteTarget(null)}
          />
          <div className="relative w-full max-w-sm animate-slide-up rounded-2xl border border-surface-800 bg-surface-900 p-6 shadow-2xl shadow-black/60">
            <h3 className="font-display text-lg font-bold text-surface-50">Hapus Halaman</h3>
            <p className="mt-2 text-sm text-surface-400">
              Halaman {deleteTarget.page_number} akan dihapus permanen. Halaman setelahnya akan otomatis dinomori ulang.
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="rounded-xl border border-surface-700 px-4 py-2.5 text-sm font-medium text-surface-300 transition-colors hover:bg-surface-800 disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-red-600/25 transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deleting ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                {deleting ? 'Menghapus…' : 'Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

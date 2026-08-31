import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Coins,
  Eye,
  FileImage,
  FilePlus2,
  Loader2,
  Lock,
  Plus,
  Send,
  Star,
  Trash2,
  X,
} from 'lucide-react'
import { StatusBadge } from '../../components/admin/Badge'
import ConfirmDialog from '../../components/admin/ConfirmDialog'
import EpisodePagesManager from '../../components/creator/EpisodePagesManager'
import { auth } from '../../services/auth'
import { content } from '../../services/content'
import { creator } from '../../services/creator'
import { getApiErrorMessage } from '../../utils/errors'
import { coverEmoji, coverKeyOf, coverStyle } from '../../data/mock'
import { formatDate, formatNumber } from '../../utils/format'
import type { CreatorComic, CreatorEpisode } from '../../types'

export default function CreatorComicDetailPage() {
  const { id } = useParams()
  const [user] = useState(() => auth.getStoredUser())
  const [comic, setComic] = useState<CreatorComic | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  // Modal episode baru
  const [showEpisodeModal, setShowEpisodeModal] = useState(false)
  const [epTitle, setEpTitle] = useState('')
  const [epNumber, setEpNumber] = useState('')
  const [epPremium, setEpPremium] = useState(false)
  const [epPrice, setEpPrice] = useState('50')
  const [epSubmitting, setEpSubmitting] = useState(false)
  const [epError, setEpError] = useState('')

  // Kelola halaman episode
  const [pagesEpisode, setPagesEpisode] = useState<CreatorEpisode | null>(null)

  // Hapus episode
  const [deleteTarget, setDeleteTarget] = useState<CreatorEpisode | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchComic = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setComic(await creator.comic(id!))
    } catch (err) {
      setError(getApiErrorMessage(err, 'Gagal memuat komik.'))
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    if (id && user?.role === 'creator') fetchComic()
  }, [id, user, fetchComic])

  const createEpisode = async (e: React.FormEvent) => {
    e.preventDefault()
    setEpError('')
    if (!epTitle.trim()) return setEpError('Judul episode wajib diisi.')
    if (epPremium && (!epPrice || Number(epPrice) <= 0)) return setEpError('Harga koin wajib diisi untuk episode premium.')

    setEpSubmitting(true)
    try {
      await content.createEpisode(comic!.id, {
        title: epTitle.trim(),
        number: epNumber ? Number(epNumber) : undefined,
        is_premium: epPremium,
        price_coin: epPremium ? Number(epPrice) : 0,
      })
      setNotice(`Episode "${epTitle.trim()}" berhasil dibuat.`)
      setShowEpisodeModal(false)
      setEpTitle('')
      setEpNumber('')
      setEpPremium(false)
      setEpPrice('50')
      await fetchComic()
    } catch (err) {
      setEpError(getApiErrorMessage(err, 'Gagal membuat episode.'))
    } finally {
      setEpSubmitting(false)
    }
  }

  const publish = async (ep: CreatorEpisode) => {
    try {
      const updated = await content.publishEpisode(ep.id)
      setNotice(`Episode ${updated.number} berhasil dipublikasikan.`)
      await fetchComic()
    } catch (err) {
      setError(getApiErrorMessage(err, 'Gagal mempublikasikan episode.'))
    }
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await content.deleteEpisode(deleteTarget.id)
      setNotice(`Episode ${deleteTarget.number} telah dihapus.`)
      setDeleteTarget(null)
      await fetchComic()
    } catch (err) {
      setError(getApiErrorMessage(err, 'Gagal menghapus episode.'))
      setDeleteTarget(null)
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-surface-500">
        <Loader2 size={22} className="mr-2 animate-spin" /> Memuat komik…
      </div>
    )
  }

  if (error || !comic) {
    const isUnauthorized = error?.includes('unauthorized') || error?.includes('tidak diizinkan') || error?.includes('This action is unauthorized')
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/15">
          <AlertCircle size={36} className="text-amber-400" />
        </div>
        <h1 className="mt-4 font-display text-2xl font-bold text-surface-50">
          {isUnauthorized ? 'Komik Akan Segera Dipublish' : 'Komik Tidak Ditemukan'}
        </h1>
        <p className="mt-2 text-sm text-surface-400">
          {isUnauthorized
            ? 'Komik Anda sedang menunggu persetujuan admin untuk dipublikasikan. Mohon tunggu sampai admin menyetujui komik Anda.'
            : error || 'Gagal memuat data komik.'}
        </p>
        <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs text-amber-200/80">
          💡 Komik yang baru diunggah akan menunggu persetujuan admin sebelum diterbitkan.
        </div>
        <Link
          to="/creator/comics"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-pink-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-600/25 transition-all hover:brightness-110"
        >
          <ArrowLeft size={16} /> Kembali ke Daftar Komik
        </Link>
      </div>
    )
  }

  const episodes = comic.episodes ?? []
  const publishedCount = episodes.filter((e) => e.status === 'published').length

  return (
    <div className="mx-auto max-w-7xl animate-fade-in px-4 py-10 sm:px-6">
      {/* Breadcrumb + header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/creator/comics"
            className="rounded-lg p-2 text-surface-400 transition-colors hover:bg-surface-800 hover:text-surface-50"
            title="Kembali"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="font-display text-2xl font-bold text-surface-50">{comic.title}</h1>
            <p className="mt-0.5 text-sm text-surface-400">
              {comic.episode_count} episode · {publishedCount} terbit · {formatNumber(comic.view_count)} dibaca ·{' '}
              <span className="text-amber-300">★ {comic.rating_avg.toFixed(1)}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to={`/creator/comics/${comic.id}/analytics`}
            className="inline-flex items-center gap-2 rounded-xl border border-surface-700 bg-surface-900 px-4 py-2.5 text-sm font-medium text-surface-200 transition-colors hover:border-brand-500/50"
          >
            <Star size={15} className="text-amber-300" /> Analitik
          </Link>
          <Link
            to={`/comic/${comic.id}`}
            className="inline-flex items-center gap-2 rounded-xl border border-surface-700 bg-surface-900 px-4 py-2.5 text-sm font-medium text-surface-200 transition-colors hover:border-brand-500/50"
          >
            <Eye size={15} /> Lihat Publik
          </Link>
        </div>
      </div>

      {error && (
        <div className="mt-6 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-300">
          <AlertCircle size={16} /> {error}
        </div>
      )}
      {notice && (
        <div className="mt-6 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-300">
          <CheckCircle2 size={16} /> {notice}
        </div>
      )}

      {/* Comic info */}
      <section className="mt-6 flex items-center gap-5 rounded-2xl border border-surface-800 bg-surface-900 p-5">
        <span
          className="flex h-24 w-16 shrink-0 items-center justify-center rounded-xl text-3xl shadow-lg shadow-black/30"
          style={{ background: coverStyle(coverKeyOf(comic.id)) }}
        >
          {coverEmoji(coverKeyOf(comic.id))}
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            {comic.genres.map((g) => (
              <span key={g.id} className="rounded-full bg-brand-500/15 px-2.5 py-0.5 text-xs font-medium text-brand-300">
                {g.name}
              </span>
            ))}
            <StatusBadge status={comic.status} />
          </div>
          <p className="mt-2 line-clamp-2 max-w-2xl text-sm leading-relaxed text-surface-300">{comic.synopsis}</p>
        </div>
      </section>

      {/* Episodes */}
      <section className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-surface-50">Episode ({episodes.length})</h2>
          <button
            onClick={() => setShowEpisodeModal(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-pink-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-brand-600/25 transition-all hover:brightness-110"
          >
            <Plus size={15} /> Episode Baru
          </button>
        </div>

        {episodes.length === 0 ? (
          <p className="mt-4 rounded-2xl border border-dashed border-surface-800 p-10 text-center text-sm text-surface-500">
            Belum ada episode. Buat episode pertama untuk mulai menerbitkan.
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {episodes.map((ep) => (
              <div key={ep.id} className="rounded-2xl border border-surface-800 bg-surface-900 p-4 transition-colors hover:border-surface-700">
                <div className="flex flex-wrap items-center gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-800 font-display text-sm font-bold text-surface-300">
                    {ep.number}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-surface-100">{ep.title}</p>
                    <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-surface-500">
                      <span className="flex items-center gap-1"><FileImage size={12} /> {ep.page_count ?? 0} halaman</span>
                      <span className="flex items-center gap-1"><Eye size={12} /> {formatNumber(ep.view_count)} dibaca</span>
                      {ep.is_premium && (
                        <span className="flex items-center gap-1 font-semibold text-amber-300">
                          <Coins size={12} /> {ep.price_coin} koin
                        </span>
                      )}
                      {ep.published_at && <span>terbit {formatDate(ep.published_at)}</span>}
                    </p>
                  </div>
                  <StatusBadge status={ep.status} />
                  <div className="flex items-center gap-1.5">
                    {ep.status === 'draft' ? (
                      <button
                        onClick={() => publish(ep)}
                        disabled={ep.page_count === 0}
                        title={ep.page_count === 0 ? 'Unggah halaman dulu sebelum publish' : 'Publikasikan episode'}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 px-3 py-1.5 text-xs font-semibold text-white shadow-lg shadow-emerald-600/20 transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <Send size={13} /> Publish
                      </button>
                    ) : (
                      <span className="flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-300">
                        <CheckCircle2 size={13} /> Terbit
                      </span>
                    )}
                    <button
                      onClick={() => setPagesEpisode(ep)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-surface-700 bg-surface-950 px-3 py-1.5 text-xs font-medium text-sky-300 transition-colors hover:border-sky-500/50"
                      title="Kelola halaman"
                    >
                      <FileImage size={13} /> Halaman
                    </button>
                    <button
                      onClick={() => setDeleteTarget(ep)}
                      className="rounded-lg p-1.5 text-red-400 transition-colors hover:bg-red-500/10"
                      title="Hapus episode"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ====== Modal episode baru ====== */}
      {showEpisodeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={epSubmitting ? undefined : () => setShowEpisodeModal(false)} />
          <div className="relative w-full max-w-md animate-slide-up rounded-2xl border border-surface-800 bg-surface-900 p-6 shadow-2xl shadow-black/60">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="flex items-center gap-2 font-display text-lg font-bold text-surface-50">
                  <FilePlus2 size={18} className="text-brand-300" /> Episode Baru
                </h3>
                <p className="mt-1 text-xs text-surface-500">Episode dibuat sebagai draft hingga Anda publikasikan.</p>
              </div>
              <button
                onClick={() => setShowEpisodeModal(false)}
                disabled={epSubmitting}
                className="rounded-lg p-1.5 text-surface-400 transition-colors hover:bg-surface-800 hover:text-surface-50"
                aria-label="Tutup"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={createEpisode} className="mt-5 space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-surface-200">Judul Episode *</label>
                <input
                  value={epTitle}
                  onChange={(e) => setEpTitle(e.target.value)}
                  placeholder="Episode 1: Awal Perjalanan"
                  maxLength={140}
                  className="w-full rounded-xl border border-surface-800 bg-surface-950 px-4 py-3 text-sm text-surface-100 placeholder:text-surface-500 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-surface-200">Nomor Episode (opsional)</label>
                <input
                  value={epNumber}
                  onChange={(e) => setEpNumber(e.target.value.replace(/[^\d]/g, ''))}
                  inputMode="numeric"
                  placeholder="Otomatis: episode berikutnya"
                  className="w-full rounded-xl border border-surface-800 bg-surface-950 px-4 py-3 text-sm text-surface-100 placeholder:text-surface-500 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                />
              </div>

              <label className="flex cursor-pointer items-center justify-between rounded-xl border border-surface-800 bg-surface-950 px-4 py-3">
                <span className="flex items-center gap-2 text-sm font-medium text-surface-200">
                  <Lock size={15} className="text-amber-300" /> Episode Premium
                </span>
                <input
                  type="checkbox"
                  checked={epPremium}
                  onChange={(e) => setEpPremium(e.target.checked)}
                  className="h-4 w-4 accent-amber-500"
                />
              </label>

              {epPremium && (
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-surface-200">Harga (koin)</label>
                  <div className="relative">
                    <Coins size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-amber-400" />
                    <input
                      value={epPrice}
                      onChange={(e) => setEpPrice(e.target.value.replace(/[^\d]/g, ''))}
                      inputMode="numeric"
                      placeholder="50"
                      className="w-full rounded-xl border border-surface-800 bg-surface-950 py-3 pl-9 pr-4 text-sm text-surface-100 placeholder:text-surface-500 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                    />
                  </div>
                  <p className="mt-1 text-xs text-surface-500">Creator menerima 60% dari setiap unlock.</p>
                </div>
              )}

              {epError && (
                <p className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-2.5 text-sm text-red-300">
                  <AlertCircle size={15} /> {epError}
                </p>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEpisodeModal(false)}
                  disabled={epSubmitting}
                  className="rounded-xl border border-surface-700 px-4 py-2.5 text-sm font-medium text-surface-300 transition-colors hover:bg-surface-800 disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={epSubmitting}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-pink-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-600/25 transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {epSubmitting ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
                  {epSubmitting ? 'Menyimpan…' : 'Buat Episode'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====== Kelola Halaman Episode ====== */}
      {pagesEpisode && (
        <EpisodePagesManager
          episodeId={pagesEpisode.id}
          episodeNumber={pagesEpisode.number}
          episodeTitle={pagesEpisode.title}
          open={!!pagesEpisode}
          onClose={() => setPagesEpisode(null)}
          onUpdated={fetchComic}
        />
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Hapus Episode"
        description={
          deleteTarget
            ? `Episode ${deleteTarget.number} "${deleteTarget.title}" beserta seluruh halamannya akan dihapus. Tindakan ini tidak dapat dibatalkan.`
            : ''
        }
        confirmLabel="Hapus Episode"
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}

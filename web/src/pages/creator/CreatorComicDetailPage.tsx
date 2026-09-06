import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  AlertCircle,
  ArrowLeft,
  Ban,
  CheckCircle2,
  Clock,
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

/**
 * Normalisasi status episode untuk tampilan.
 * Hanya status 'published' asli yang dianggap Terbit (hijau). Status lain
 * (termasuk 'pending' atau nilai tak dikenal dari DB lama) diperlakukan
 * sebagai Draft / Menunggu Review agar episode tidak pernah tampak hijau
 * sebelum benar-benar disetujui admin.
 */
function episodeDisplayStatus(status: string): 'draft' | 'pending' | 'published' {
  if (status === 'published') return 'published'
  if (status === 'draft') return 'draft'
  return 'pending'
}

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

  // Ajukan komik ke admin
  const [submittingComic, setSubmittingComic] = useState(false)

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

    // Episode pertama (nomor 1) selalu gratis — cegah sejak awal di sisi client.
    const epNum = epNumber ? Number(epNumber) : undefined
    const isFirstEpisode = epNum === 1 || (epNum === undefined && (comic?.episodes ?? []).length === 0)
    if (epPremium && isFirstEpisode) {
      setEpError('Terjadi kesalahan, setiap episode pertama harus free/gratis.')
      return
    }

    if (epPremium && (!epPrice || Number(epPrice) <= 0)) return setEpError('Harga koin wajib diisi untuk episode premium.')

    setEpSubmitting(true)
    try {
      await content.createEpisode(comic!.id, {
        title: epTitle.trim(),
        number: epNum,
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
      const raw = getApiErrorMessage(err, 'Gagal membuat episode.')
      // Jangan tampilkan pesan error SQL mentah — ganti dengan pesan ramah.
      setEpError(
        /SQLSTATE|Integrity constraint|Duplicate entry|\b1062\b/i.test(raw)
          ? 'Terjadi kesalahan, setiap episode pertama harus free/gratis.'
          : raw,
      )
    } finally {
      setEpSubmitting(false)
    }
  }

  const publish = async (ep: CreatorEpisode) => {
    try {
      const updated = await content.publishEpisode(ep.id)
      setNotice(
        ep.rejection_reason
          ? `Episode ${updated.number} dikirim ulang ke admin. Alasan penolakan sebelumnya dihapus — episode tampil setelah disetujui admin.`
          : `Episode ${updated.number} dikirim ke admin untuk direview. Episode akan tampil setelah disetujui admin.`,
      )
      await fetchComic()
    } catch (err) {
      setError(getApiErrorMessage(err, 'Gagal mengajukan episode ke admin.'))
    }
  }

  /** Episode yang ditolak admin: status kembali draft, tapi rejection_reason
   *  masih tersimpan sehingga creator melihat alasan & tombol kirim ulang. */
  const isEpisodeRejected = (ep: CreatorEpisode) => !!ep.rejection_reason

  const renderEpisodeStatusAction = (ep: CreatorEpisode) => {
    // ===== Episode ditolak admin — merah, tampilkan alasan + kirim ulang =====
    if (isEpisodeRejected(ep)) {
      return (
        <>
          <span
            className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/50 bg-red-500/15 px-3 py-1.5 text-xs font-semibold text-red-300"
            title={ep.rejection_reason ? `Ditolak admin: ${ep.rejection_reason}` : 'Ditolak admin'}
          >
            <span className="h-2 w-2 rounded-full bg-red-400" /> Ditolak
          </span>
          <button
            onClick={() => publish(ep)}
            disabled={ep.page_count === 0}
            title={
              ep.page_count === 0
                ? 'Unggah halaman dulu, lalu kirim ulang review ke admin'
                : 'Perbaiki episode lalu kirim ulang review ke admin'
            }
            className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-rose-600 to-red-600 px-3 py-1.5 text-xs font-semibold text-white shadow-lg shadow-red-600/20 transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Send size={13} /> Coba Lagi
          </button>
        </>
      )
    }

    // ===== Draft — putih =====
    if (episodeDisplayStatus(ep.status) === 'draft') {
      return (
        <>
          <span
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/40 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white"
            title="Draft — belum dikirim ke admin. Hanya kamu yang bisa melihat episode ini."
          >
            <span className="h-2 w-2 rounded-full bg-white" /> Draft
          </span>
          <button
            onClick={() => publish(ep)}
            disabled={ep.page_count === 0}
            title={
              ep.page_count === 0
                ? 'Unggah halaman dulu — draft hanya terlihat oleh Anda'
                : 'Kirim episode ke admin untuk direview'
            }
            className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 px-3 py-1.5 text-xs font-semibold text-white shadow-lg shadow-emerald-600/20 transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Send size={13} /> Kirim Review
          </button>
        </>
      )
    }

    // ===== Menunggu review — kuning =====
    if (episodeDisplayStatus(ep.status) === 'pending') {
      return (
        <span
          className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-500/15 px-3 py-1.5 text-xs font-semibold text-amber-300"
          title="Menunggu persetujuan admin di dashboard Laporan Komik — belum tampil publik"
        >
          <span className="h-2 w-2 rounded-full bg-amber-400" /> Menunggu Review
        </span>
      )
    }

    // ===== Terbit — hijau =====
    return (
      <span
        className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-500/15 px-3 py-1.5 text-xs font-semibold text-emerald-300"
        title="Disetujui admin — episode tampil untuk semua pembaca"
      >
        <span className="h-2 w-2 rounded-full bg-emerald-400" /> Terbit
      </span>
    )
  }

  const submitComic = async () => {
    if (!comic) return
    setSubmittingComic(true)
    setError('')
    setNotice('')
    try {
      await creator.submitComic(comic.id)
      setNotice('Komik dikirim ke admin untuk direview. Komik akan tampil publik setelah disetujui admin di dashboard Laporan Komik.')
      await fetchComic()
    } catch (err) {
      setError(getApiErrorMessage(err, 'Gagal mengajukan komik ke admin.'))
    } finally {
      setSubmittingComic(false)
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
    const isWaitingApproval =
      error?.includes('belum diterbitkan') ||
      error?.includes('belum disetujui') ||
      error?.includes('menunggu persetujuan') ||
      error?.includes('Belum diterbitkan') ||
      error?.includes('Komik belum diterbitkan') ||
      // Error teknis (mis. SQLSTATE dari DB lama) jangan ditampilkan mentah
      /SQLSTATE|42S22|Unknown column/i.test(error || '')

    return (
      <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/15">
          <AlertCircle size={36} className="text-amber-400" />
        </div>
        <h1 className="mt-4 font-display text-2xl font-bold text-surface-50">
          {isWaitingApproval ? 'Komik Menunggu Persetujuan Admin' : 'Komik Tidak Ditemukan'}
        </h1>
        <p className="mt-2 text-sm text-surface-400">
          {isWaitingApproval
            ? 'Komik Anda sedang menunggu persetujuan admin Komika. Mohon tunggu sampai admin menyetujui komik Anda — episode yang dikirim juga baru tampil setelah disetujui admin.'
            : /SQLSTATE|42S22|Unknown column/i.test(error || '')
              ? 'Terjadi kesalahan saat memuat komik. Silakan muat ulang halaman atau hubungi admin.'
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
  const isComicPublished = !!comic.published_at && comic.verification_status === 'approved'
  const isComicPending = comic.verification_status === 'pending'
  const isComicRejected = comic.verification_status === 'rejected'
  const isComicDraft = comic.verification_status === 'draft'
  const isComicBlocked = comic.verification_status === 'blocked'
  const uploadRestricted = (user as any)?.can_upload === false
  const hasReadyEpisode = episodes.some((ep) => (ep.page_count ?? 0) > 0)

  // Info status persetujuan admin untuk komik
  const reviewState = isComicPublished
    ? {
        border: 'border-emerald-500/30',
        bg: 'bg-emerald-500/5',
        iconBox: 'bg-emerald-500/15 text-emerald-300',
        icon: <CheckCircle2 size={22} />,
        title: 'Komik Terbit',
        desc: 'Komik sudah disetujui admin dan tampil untuk semua pembaca.',
      }
    : isComicPending
      ? {
          border: 'border-amber-500/30',
          bg: 'bg-amber-500/5',
          iconBox: 'bg-amber-500/15 text-amber-300',
          icon: <Clock size={22} />,
          title: 'Menunggu Persetujuan Admin',
          desc: 'Komik sudah dikirim ke admin untuk direview di dashboard Laporan Komik. Komik belum tampil publik sampai disetujui admin.',
        }
      : isComicRejected
        ? {
            border: 'border-red-500/30',
            bg: 'bg-red-500/5',
            iconBox: 'bg-red-500/15 text-red-300',
            icon: <AlertCircle size={22} />,
            title: 'Komik Anda Ditolak Admin',
            desc: 'Perbaiki komik sesuai catatan admin, lalu tekan "Ajukan Ulang Review" untuk mencoba lagi.',
          }
        : isComicBlocked
          ? {
              border: 'border-orange-500/30',
              bg: 'bg-orange-500/5',
              iconBox: 'bg-orange-500/15 text-orange-300',
              icon: <Ban size={22} />,
              title: 'Komik Diblokir Admin',
              desc: 'Komik tidak disetujui karena diblokir admin dan tidak lagi tampil publik. Izin upload komik baru Anda dinonaktifkan — hubungi admin bila ada pertanyaan.',
            }
          : {
            border: 'border-sky-500/30',
            bg: 'bg-sky-500/5',
            iconBox: 'bg-sky-500/15 text-sky-300',
            icon: <FileImage size={22} />,
            title: 'Komik Draft',
            desc: 'Komik masih draft dan belum masuk antrian review admin. Lengkapi episode, lalu klik "Ajukan Review" agar admin menyetujui komik sebelum tampil publik.',
          }


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
          {isComicPublished && (
            <Link
              to={`/comic/${comic.id}`}
              className="inline-flex items-center gap-2 rounded-xl border border-surface-700 bg-surface-900 px-4 py-2.5 text-sm font-medium text-surface-200 transition-colors hover:border-brand-500/50"
            >
              <Eye size={15} /> Lihat Publik
            </Link>
          )}
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

      {/* ====== Status persetujuan admin ====== */}
      <section className={`mt-6 flex flex-col gap-4 rounded-2xl border p-5 sm:flex-row sm:items-center ${reviewState.border} ${reviewState.bg}`}>
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${reviewState.iconBox}`}>
          {reviewState.icon}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-surface-100">{reviewState.title}</p>
          <p className="mt-1 text-xs leading-relaxed text-surface-400">{reviewState.desc}</p>
          {isComicRejected && (
            <p className="mt-1.5 flex items-start gap-1.5 rounded-lg border border-red-500/25 bg-red-500/10 px-2.5 py-1.5 text-[11px] leading-snug text-red-300">
              <AlertCircle size={13} className="mt-0.5 shrink-0" />
              <span>
                <b className="font-semibold">Komik Anda ditolak karena:</b>{' '}
                {comic.rejection_reason || 'tidak disebutkan oleh admin.'} Perbaiki lalu tekan{' '}
                <b className="font-semibold">Ajukan Ulang Review</b> untuk mencoba lagi.
              </span>
            </p>
          )}
          {isComicBlocked && (
            <p className="mt-1.5 flex items-start gap-1.5 rounded-lg border border-orange-500/25 bg-orange-500/10 px-2.5 py-1.5 text-[11px] leading-snug text-orange-300">
              <Ban size={13} className="mt-0.5 shrink-0" />
              <span>
                <b className="font-semibold">Komik Anda diblokir karena:</b>{' '}
                {comic.rejection_reason || 'tidak disebutkan oleh admin.'} Komik tidak dapat diajukan ulang.
              </span>
            </p>
          )}
        </div>
        {(isComicDraft || isComicRejected) && !isComicBlocked && !uploadRestricted && (
          <button
            onClick={submitComic}
            disabled={submittingComic || !hasReadyEpisode}
            title={
              hasReadyEpisode
                ? 'Kirim komik ke admin untuk direview — komik tampil publik setelah disetujui'
                : 'Buat minimal 1 episode lengkap dengan halaman sebelum mengajukan review'
            }
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-pink-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-600/25 transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submittingComic ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
            {submittingComic ? 'Mengirim…' : isComicRejected ? 'Coba Lagi (Ajukan Ulang)' : 'Ajukan Review ke Admin'}
          </button>
        )}
      </section>

      {/* Episodes */}
      <section className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-surface-50">Episode ({episodes.length})</h2>
          <button
            onClick={() => setShowEpisodeModal(true)}
            disabled={uploadRestricted}
            title={uploadRestricted ? 'Izin upload dinonaktifkan oleh admin' : 'Tambah episode baru'}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-pink-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-brand-600/25 transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus size={15} /> Episode Baru
          </button>
        </div>

        {/* ====== Keterangan status episode ====== */}
        <div className="mt-4 grid gap-2 rounded-xl border border-surface-800 bg-surface-950/60 p-4 text-[11px] leading-relaxed text-surface-400 sm:grid-cols-2 lg:grid-cols-4 sm:gap-3">
          <div className="flex items-start gap-2">
            <span className="mt-0.5 shrink-0 rounded-full bg-surface-800 px-2 py-0.5 text-[10px] font-bold text-surface-300">Draft</span>
            <span>Disimpan pribadi — hanya Anda yang melihat. Lengkapi halaman, lalu klik <b className="font-semibold text-surface-200">Kirim Review</b> untuk dikirim ke admin.</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="mt-0.5 shrink-0 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-300">Menunggu Review</span>
            <span>Episode sudah dikirim ke admin di dashboard Laporan Komik. Belum tampil untuk pembaca.</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="mt-0.5 shrink-0 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-300">Terbit</span>
            <span>Sudah disetujui admin — episode tampil untuk semua pembaca.</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="mt-0.5 shrink-0 rounded-full bg-red-500/15 px-2 py-0.5 text-[10px] font-bold text-red-300">Ditolak</span>
            <span>Ditolak admin karena suatu alasan. Perbaiki sesuai alasan, lalu klik <b className="font-semibold text-surface-200">Coba Lagi</b> untuk kirim ulang review.</span>
          </div>
        </div>

        {episodes.length === 0 ? (
          <p className="mt-4 rounded-2xl border border-dashed border-surface-800 p-10 text-center text-sm text-surface-500">
            Belum ada episode. Buat episode, unggah halamannya, lalu klik Kirim Review — episode akan tampil Menunggu Review (kuning) dan terbit setelah disetujui admin.
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {episodes.map((ep) => (
              <div
                key={ep.id}
                className={`rounded-2xl border border-l-4 border-surface-800 bg-surface-900 p-4 transition-colors hover:border-surface-700 ${
                  isEpisodeRejected(ep)
                    ? 'border-red-500/40 bg-red-500/[0.04] border-l-red-500'
                    : episodeDisplayStatus(ep.status) === 'pending'
                      ? 'border-l-amber-400'
                      : episodeDisplayStatus(ep.status) === 'published'
                        ? 'border-l-emerald-400'
                        : 'border-l-white/40'
                }`}
              >
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
                    {/* Alasan penolakan admin tampil jelas di kartu episode */}
                    {isEpisodeRejected(ep) && (
                      <p className="mt-1.5 flex items-start gap-1.5 rounded-lg border border-red-500/25 bg-red-500/10 px-2.5 py-1.5 text-[11px] leading-snug text-red-300">
                        <AlertCircle size={13} className="mt-0.5 shrink-0" />
                        <span>
                          <b className="font-semibold">Episode Anda ditolak karena:</b>{' '}
                          {ep.rejection_reason || 'tidak disebutkan oleh admin.'}
                          {' '}Perbaiki episode lalu tekan <b className="font-semibold">Coba Lagi</b> untuk kirim ulang review ke admin.
                        </span>
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    {renderEpisodeStatusAction(ep)}
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
                <p className="mt-1 text-xs text-surface-500">Episode dibuat sebagai draft. Setelah halaman lengkap, klik Publish untuk dikirim ke admin — episode tampil setelah disetujui admin.</p>
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

              <div>
                <p className="mb-1.5 block text-sm font-medium text-surface-200">Tipe Episode</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => { setEpPremium(false); setEpPrice('50') }}
                    className={`flex items-start gap-2.5 rounded-xl border p-3 text-left transition-all ${
                      !epPremium
                        ? 'border-emerald-500/60 bg-emerald-500/10'
                        : 'border-surface-800 bg-surface-950 hover:border-surface-700'
                    }`}
                  >
                    <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs ${!epPremium ? 'bg-emerald-500/20 text-emerald-300' : 'bg-surface-800 text-surface-400'}`}>
                      🆓
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-surface-100">Gratis</span>
                      <span className="mt-0.5 block text-[11px] leading-snug text-surface-400">Semua pembaca bisa membaca episode ini tanpa koin.</span>
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEpPremium(true)}
                    className={`flex items-start gap-2.5 rounded-xl border p-3 text-left transition-all ${
                      epPremium
                        ? 'border-amber-500/60 bg-amber-500/10'
                        : 'border-surface-800 bg-surface-950 hover:border-surface-700'
                    }`}
                  >
                    <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${epPremium ? 'bg-amber-500/20 text-amber-300' : 'bg-surface-800 text-surface-400'}`}>
                      <Lock size={14} />
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-surface-100">Premium (koin)</span>
                      <span className="mt-0.5 block text-[11px] leading-snug text-surface-400">Pembaca membayar koin untuk membuka. Creator menerima 60% dari tiap unlock.</span>
                    </span>
                  </button>
                </div>
              </div>

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
                  <p className="mt-1 text-xs text-surface-500">Catatan: episode nomor 1 selalu gratis untuk pembaca.</p>
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

import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  AlertCircle,
  ArrowLeft,
  Bookmark,
  Calendar,
  Check,
  Coins,
  Copy,
  Eye,
  Gem,
  Heart,
  Loader2,
  Lock,
  MessageCircle,
  MessageSquare,
  Play,
  Send,
  Share2,
  Star,
  Trash2,
  Users,
  X,
} from 'lucide-react'
import Avatar from '../components/Avatar'
import { content } from '../services/content'
import { community } from '../services/community'
import { getApiErrorMessage } from '../utils/errors'
import { auth } from '../services/auth'
import { coverEmoji, coverKeyOf, coverStyle } from '../data/mock'
import { formatDate, formatNumber, timeAgo } from '../utils/format'
import AuthWall from '../components/AuthWall'
import type { ComicDetail, Comment } from '../types'

export default function ComicDetailPage() {
  const { id } = useParams()
  // Stabilkan referensi user agar tidak berubah tiap render
  const [user] = useState(() => auth.getStoredUser())
  const [comic, setComic] = useState<ComicDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [followed, setFollowed] = useState(false)
  const [liked, setLiked] = useState(false)
  const [bookmarked, setBookmarked] = useState(false)
  const [busy, setBusy] = useState<'follow' | 'like' | 'bookmark' | null>(null)
  const [likeCount, setLikeCount] = useState(0)

  // Komentar
  const [comments, setComments] = useState<Comment[]>([])
  const [commentText, setCommentText] = useState('')
  const [commentBusy, setCommentBusy] = useState(false)
  const [likedComments, setLikedComments] = useState<Set<number>>(new Set())
  const [commentLikes, setCommentLikes] = useState<Record<number, number>>({})
  const [replyingTo, setReplyingTo] = useState<number | null>(null)
  const [replyText, setReplyText] = useState('')
  const [replyBusy, setReplyBusy] = useState(false)
  const [deletingCommentId, setDeletingCommentId] = useState<number | null>(null)
  const [coverImgError, setCoverImgError] = useState(false)
  const [commentPage, setCommentPage] = useState(1)
  const [hasMoreComments, setHasMoreComments] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const fetchComic = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const detail = await content.comic(id!)
      setComic(detail)
      setLikeCount(detail.like_count)
      if (detail.user_actions) {
        setFollowed(detail.user_actions.is_followed)
        setLiked(detail.user_actions.is_liked)
        setBookmarked(detail.user_actions.is_bookmarked)
      }
      // Komentar opsional — kegagalannya tidak boleh merusak halaman utama
      try {
        const commentRes = await community.comments(Number(id))
        setComments(commentRes.data)
        setCommentPage(commentRes.meta.current_page)
        setHasMoreComments(commentRes.meta.current_page < commentRes.meta.last_page)
      } catch {
        setComments([])
      }
    } catch (err) {
      setError(getApiErrorMessage(err, 'Gagal memuat detail komik.'))
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    if (id) fetchComic()
  }, [id, fetchComic])

  const loadMoreComments = async () => {
    if (!comic || loadingMore) return
    setLoadingMore(true)
    try {
      const nextPage = commentPage + 1
      const res = await community.comments(comic.id, nextPage)
      setComments((prev) => [...prev, ...res.data])
      setCommentPage(res.meta.current_page)
      setHasMoreComments(res.meta.current_page < res.meta.last_page)
    } catch {
      // abaikan
    } finally {
      setLoadingMore(false)
    }
  }

  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!comic || !commentText.trim()) return
    setCommentBusy(true)
    try {
      const created = await community.postComment(comic.id, { content: commentText.trim() })
      setComments((list) => [...list, created])
      setCommentText('')
    } catch (err) {
      setError(getApiErrorMessage(err, 'Gagal mengirim komentar.'))
    } finally {
      setCommentBusy(false)
    }
  }

  const handleLikeComment = async (commentId: number) => {
    if (!user) return
    try {
      const res = await community.toggleCommentLike(commentId)
      setLikedComments((prev) => {
        const next = new Set(prev)
        if (res.liked) next.add(commentId)
        else next.delete(commentId)
        return next
      })
      setCommentLikes((prev) => ({ ...prev, [commentId]: res.like_count }))
    } catch {
      // abaikan
    }
  }

  const handleDeleteComment = async (commentId: number) => {
    try {
      await community.deleteComment(commentId)
      setComments((list) => list.filter((c) => c.id !== commentId).map((c) => ({
        ...c,
        replies: (c.replies ?? []).filter((r) => r.id !== commentId),
      })))
      setDeletingCommentId(null)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Gagal menghapus komentar.'))
    }
  }

  const submitReply = async (e: React.FormEvent, parentId: number) => {
    e.preventDefault()
    if (!comic || !replyText.trim()) return
    setReplyBusy(true)
    try {
      const created = await community.postComment(comic.id, { content: replyText.trim(), parent_id: parentId })
      setComments((list) =>
        list.map((c) =>
          c.id === parentId
            ? { ...c, replies: [...(c.replies ?? []), created] }
            : c,
        ),
      )
      setReplyText('')
      setReplyingTo(null)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Gagal mengirim balasan.'))
    } finally {
      setReplyBusy(false)
    }
  }

  const comicUrl = typeof window !== 'undefined' ? `${window.location.origin}/comic/${comic?.id}` : ''
  const shareTitle = comic?.title ?? 'Komik COMIKA'
  const shareText = `Baca komik \"${shareTitle}\" di COMIKA! 🎨`

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: shareTitle, text: shareText, url: comicUrl })
      } catch {
        // user batal
      }
    } else {
      setShareOpen((v) => !v)
    }
  }

  const shareTo = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer,width=600,height=500')
    setShareOpen(false)
  }

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(comicUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback
    }
    setShareOpen(false)
  }

  const toggle = async (action: 'follow' | 'like' | 'bookmark') => {
    if (!comic || !user) return
    setBusy(action)
    try {
      if (action === 'follow') {
        const res = await community.toggleFollow(comic.id)
        setFollowed(res.followed)
      } else if (action === 'like') {
        const res = await community.toggleLike(comic.id)
        setLiked(res.liked)
        setLikeCount(res.like_count)
      } else {
        const res = await community.toggleBookmark(comic.id)
        setBookmarked(res.bookmarked)
      }
    } catch {
      // abaikan error — status lokal tidak berubah
    } finally {
      setBusy(null)
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
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 text-center">
        <AlertCircle size={36} className="text-red-400" />
        <h1 className="mt-4 font-display text-2xl font-bold text-surface-50">Komik Tidak Ditemukan</h1>
        <p className="mt-2 text-sm text-surface-400">{error}</p>
        <Link
          to="/discover"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-pink-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-600/25 transition-all hover:brightness-110"
        >
          <ArrowLeft size={16} /> Kembali ke Jelajah
        </Link>
      </div>
    )
  }

  // Auth wall: jika belum login, tampilkan halaman login
  if (!user) {
    return (
      <div className="animate-fade-in">
        {/* Mini header info komik */}
        <section className="relative overflow-hidden border-b border-surface-800/70">
          <div
            className="absolute inset-0 opacity-20"
            style={{ background: coverStyle(coverKeyOf(comic.id)) }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-surface-950/60 to-surface-950" />
          <div className="relative mx-auto flex max-w-7xl items-center gap-6 px-4 py-8 sm:px-6">
            <div className="hidden w-24 shrink-0 sm:block">
              <div
                className="flex aspect-[3/4] items-center justify-center rounded-xl border border-white/10"
                style={{ background: coverStyle(coverKeyOf(comic.id)) }}
              >
                {comic.cover_url && !coverImgError ? (
                  <img src={comic.cover_url} alt={comic.title} className="h-full w-full rounded-xl object-cover" onError={() => setCoverImgError(true)} />
                ) : (
                  <span className="text-3xl">{coverEmoji(coverKeyOf(comic.id))}</span>
                )}
              </div>
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-surface-50">{comic.title}</h1>
              <p className="mt-1 text-sm text-surface-400">oleh {comic.creator.name}</p>
            </div>
          </div>
        </section>
        <AuthWall
          title="Masuk untuk Membaca Komik"
          description={`Kamu harus masuk atau daftar akun untuk membaca "${comic.title}" dan komik lainnya.`}
        />
      </div>
    )
  }

  const episodes = comic.episodes
  const firstReadable = episodes.find((e) => e.is_premium !== true) ?? episodes[0]

  return (
    <div className="animate-fade-in">
      {/* Creator back button — floating, responsive */}
      {user?.id === comic.creator.id && (
        <Link
          to={`/creator/comics/${comic.id}`}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-2xl border border-surface-700 bg-surface-900/95 px-4 py-3 text-sm font-medium text-surface-300 shadow-xl shadow-black/40 backdrop-blur-sm transition-all hover:border-brand-500/50 hover:text-surface-100 sm:left-4 sm:bottom-auto sm:top-20 sm:rounded-xl sm:px-4 sm:py-2.5"
        >
          <ArrowLeft size={18} />
          <span className="hidden sm:inline">Kembali ke Kelola</span>
        </Link>
      )}
      {/* Header */}
      <section className="relative overflow-hidden border-b border-surface-800/70">
        <div
          className="absolute inset-0 opacity-30"
          style={{ background: coverStyle(coverKeyOf(comic.id)) }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-surface-950/60 to-surface-950" />

        <div className="relative mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 md:flex-row">
          {/* Cover */}
          <div className="mx-auto w-48 shrink-0 md:mx-0 md:w-56">
            <div
              className="relative flex aspect-[3/4] items-center justify-center overflow-hidden rounded-2xl border border-white/10 shadow-2xl shadow-black/50"
              style={{ background: coverStyle(coverKeyOf(comic.id)) }}
            >
              {comic.cover_url && !coverImgError ? (
                <img
                  src={comic.cover_url}
                  alt={comic.title}
                  className="absolute inset-0 h-full w-full object-cover"
                  loading="lazy"
                  onError={() => setCoverImgError(true)}
                />
              ) : (
                <span className="text-6xl drop-shadow-xl">{coverEmoji(coverKeyOf(comic.id))}</span>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              {comic.genres.map((gen) => (
                <span key={gen.id} className="rounded-full bg-brand-500/15 px-3 py-1 text-xs font-medium text-brand-300">
                  {gen.name}
                </span>
              ))}
              <span className="rounded-full bg-surface-800 px-3 py-1 text-xs text-surface-300">
                {comic.status === 'ongoing' ? 'Ongoing' : comic.status === 'completed' ? 'Completed' : 'Hiatus'}
              </span>
            </div>

            <h1 className="mt-3 font-display text-3xl font-bold text-surface-50 sm:text-4xl">
              {comic.title}
            </h1>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-surface-300">
              oleh
              <Link
                to={`/creators/${comic.creator.id}`}
                className="inline-flex items-center gap-1.5 transition-colors hover:text-brand-200"
              >
                <Avatar name={comic.creator.name} avatarUrl={comic.creator.avatar_url} size={20} className="rounded-full" />
                <span className="font-medium text-brand-300">{comic.creator.name}</span>
              </Link>
            </p>

            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-surface-300">{comic.synopsis}</p>

            {/* Stats */}
            <div className="mt-6 flex flex-wrap items-center gap-6 text-sm text-surface-300">
              <span className="flex items-center gap-1.5">
                <Star size={16} className="text-amber-400" fill="currentColor" />
                <strong className="text-surface-50">{comic.rating_avg.toFixed(1)}</strong>
                ({formatNumber(comic.rating_count)} rating)
              </span>
              <span className="flex items-center gap-1.5">
                <Eye size={16} className="text-surface-400" /> {formatNumber(comic.view_count)} dibaca
              </span>
              <span className="flex items-center gap-1.5">
                <Heart size={16} className="text-surface-400" /> {formatNumber(likeCount)} suka
              </span>
              <span className="flex items-center gap-1.5">
                <Users size={16} className="text-surface-400" /> {formatNumber(Math.max(1, Math.round(likeCount / 4)))} pengikut
              </span>
            </div>

            {/* Actions */}
            <div className="mt-7 flex flex-wrap gap-2 sm:gap-3">
              <Link
                to={firstReadable ? `/comic/${comic.id}/episode/${firstReadable.id}` : '#'}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-pink-600 px-6 py-3 text-sm font-semibold text-white shadow-xl shadow-brand-600/25 transition-all hover:brightness-110"
              >
                <Play size={16} fill="currentColor" /> Baca Sekarang
              </Link>
              <button
                onClick={() => toggle('follow')}
                disabled={!user || busy === 'follow'}
                className={`inline-flex items-center gap-1.5 rounded-xl border px-4 py-2.5 text-xs font-semibold transition-all sm:gap-2 sm:px-5 sm:py-3 sm:text-sm disabled:cursor-not-allowed disabled:opacity-50 ${
                  followed
                    ? 'border-brand-500 bg-brand-500/15 text-brand-300'
                    : 'border-surface-700 bg-surface-900 text-surface-200 hover:border-brand-500/50'
                }`}
              >
                {followed ? <Check size={16} /> : <Bookmark size={16} />}
                {followed ? 'Mengikuti' : 'Ikuti'}
              </button>
              <button
                onClick={() => toggle('like')}
                disabled={!user || busy === 'like'}
                className={`inline-flex items-center gap-1.5 rounded-xl border px-4 py-2.5 text-xs font-semibold transition-all sm:gap-2 sm:px-5 sm:py-3 sm:text-sm disabled:cursor-not-allowed disabled:opacity-50 ${
                  liked
                    ? 'border-pink-500 bg-pink-500/15 text-pink-300'
                    : 'border-surface-700 bg-surface-900 text-surface-200 hover:border-pink-500/50'
                }`}
              >
                <Heart size={16} fill={liked ? 'currentColor' : 'none'} />
                {liked ? 'Disukai' : 'Suka'}
              </button>
              <button
                onClick={() => toggle('bookmark')}
                disabled={!user || busy === 'bookmark'}
                className={`inline-flex items-center gap-1.5 rounded-xl border px-4 py-2.5 text-xs font-semibold transition-all sm:gap-2 sm:px-5 sm:py-3 sm:text-sm disabled:cursor-not-allowed disabled:opacity-50 ${
                  bookmarked
                    ? 'border-amber-500 bg-amber-500/15 text-amber-300'
                    : 'border-surface-700 bg-surface-900 text-surface-200 hover:border-amber-500/50'
                }`}
              >
                {bookmarked ? <Check size={16} /> : <Bookmark size={16} />}
                {bookmarked ? 'Tersimpan' : 'Simpan'}
              </button>
              <div className="relative">
                <button
                  onClick={handleShare}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-surface-700 bg-surface-900 px-4 py-2.5 text-xs font-semibold text-surface-200 transition-colors hover:border-brand-500/50 sm:gap-2 sm:px-5 sm:py-3 sm:text-sm"
                >
                  <Share2 size={14} className="sm:hidden" /><Share2 size={16} className="hidden sm:block" /> Bagikan
                </button>

                {/* Share dropdown */}
                {shareOpen && (
                  <div className="absolute left-0 top-full z-40 mt-2 w-56 rounded-xl border border-surface-700 bg-surface-900 p-2 shadow-2xl">
                    <div className="mb-1 flex items-center justify-between px-2 py-1">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-surface-500">Bagikan ke</span>
                      <button onClick={() => setShareOpen(false)} className="text-surface-500 hover:text-surface-300">
                        <X size={14} />
                      </button>
                    </div>
                    <button
                      onClick={() => shareTo(`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + comicUrl)}`)}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-surface-200 transition-colors hover:bg-surface-800"
                    >
                      <MessageSquare size={16} className="text-green-400" /> WhatsApp
                    </button>
                    <button
                      onClick={() => shareTo(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(comicUrl)}`)}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-surface-200 transition-colors hover:bg-surface-800"
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 text-sky-400"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>                      Twitter / X
                    </button>
                    <button
                      onClick={() => shareTo(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(comicUrl)}`)}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-surface-200 transition-colors hover:bg-surface-800"
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 text-blue-500"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>                      Facebook
                    </button>
                    <div className="my-1 border-t border-surface-800" />
                    <button
                      onClick={copyLink}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-surface-200 transition-colors hover:bg-surface-800"
                    >
                      <Copy size={16} className="text-surface-400" /> {copied ? '✓ Tersalin!' : 'Salin Link'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {!user && (
              <p className="mt-3 text-xs text-surface-500">
                Masuk untuk mengikuti, menyukai, dan menyimpan komik ini.
              </p>
            )}

            <div className="mt-5 flex items-center gap-5 text-xs text-surface-400">
              <span className="flex items-center gap-1.5">
                <Calendar size={13} /> Dibuat {formatDate(comic.created_at)}
              </span>
              <span>{comic.episode_count} episode</span>
              <span>{comic.age_rating === 'remaja' ? 'Remaja (13+)' : 'Semua Umur'}</span>
            </div>
          </div>
        </div>
      </section>        {/* Episodes + comments */}
      <section className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-10 sm:px-6 lg:grid-cols-3">
        {/* Episode list */}
        <div className="lg:col-span-2">
          <div className="mt-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-surface-50">Daftar Episode</h2>
            <span className="text-xs text-surface-500">{episodes.length} episode</span>
          </div>
          
          {/* Featured Episode 1 */}
          {episodes.length > 0 && (() => {
            const ep1 = episodes[0]
            const isVvipUser = user?.is_vvip === true
            const ep1Locked = ep1.is_locked === true && !isVvipUser
            const ep1HasThumbnail = ep1.thumbnail_url && ep1.thumbnail_url.length > 0
            return (
              <Link
                to={`/comic/${comic.id}/episode/${ep1.id}`}
                className={`group relative mt-4 block overflow-hidden rounded-2xl border p-4 transition-all hover:shadow-xl ${
                  ep1.is_premium && ep1Locked
                    ? 'border-amber-500/30 bg-gradient-to-r from-amber-950/40 to-surface-900 hover:border-amber-500/50 hover:shadow-amber-500/10'
                    : 'border-brand-500/30 bg-gradient-to-r from-brand-900/40 to-purple-900/30 hover:border-brand-500/50 hover:shadow-brand-500/10'
                }`}
              >
                <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-brand-500/10 blur-3xl" />
                <div className="relative flex gap-4">
                  {/* Thumbnail Episode 1 */}
                  <div className="relative h-36 w-28 shrink-0 overflow-hidden rounded-xl bg-surface-800 shadow-lg sm:h-44 sm:w-36">
                    {/* Always show number as main display */}
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-brand-600 to-purple-600">
                      <span className="font-display text-5xl font-bold text-white/90">1</span>
                    </div>
                    {/* Overlay thumbnail if exists */}
                    {ep1HasThumbnail && (
                      <img
                        src={ep1.thumbnail_url!}
                        alt={ep1.title}
                        className={`absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-110 ${
                          ep1Locked && ep1.is_premium ? 'blur-md brightness-50' : ''
                        }`}
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none'
                        }}
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    <div className="absolute left-2 top-2 flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 text-sm font-bold text-white shadow-lg">
                      1
                    </div>
                    {ep1.is_premium && ep1Locked ? (
                      <div className="absolute bottom-2 left-2 rounded-full bg-amber-500 px-2.5 py-1 text-[10px] font-bold text-white shadow-lg">
                        🔒 Premium
                      </div>
                    ) : (
                      <div className="absolute bottom-2 left-2 rounded-full bg-emerald-500 px-2.5 py-1 text-[10px] font-bold text-white shadow-lg">
                        ✨ Mulai Baca
                      </div>
                    )}
                  </div>
                  
                  {/* Info Episode 1 */}
                  <div className="flex flex-1 flex-col justify-center">
                    <span className="text-xs font-semibold uppercase tracking-wider text-brand-400">Episode Perdana</span>
                    <h3 className="mt-1 text-lg font-bold text-surface-50 group-hover:text-brand-200">
                      {ep1.title}
                    </h3>
                    <p className="mt-1 text-xs text-surface-400">{ep1.published_at ? formatDate(ep1.published_at) : 'Draft'}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      {ep1.is_premium ? (
                        ep1Locked ? (
                          <span className="flex items-center gap-1 rounded-full bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-300">
                            <Lock size={11} /> {ep1.price_coin} koin
                          </span>
                        ) : isVvipUser ? (
                          <span className="flex items-center gap-1 rounded-full bg-purple-500/15 px-3 py-1 text-xs font-semibold text-purple-300">
                            <Gem size={11} /> VVIP Gratis
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-300">
                            <Check size={11} /> Terbuka
                          </span>
                        )
                      ) : (
                        <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-300">Gratis</span>
                      )}
                      <span className="flex items-center gap-1 text-xs text-surface-400">
                        <Eye size={12} /> {formatNumber(ep1.view_count)} dibaca
                      </span>
                      <span className="flex items-center gap-1 text-xs text-surface-400">
                        <Heart size={12} /> {formatNumber(ep1.like_count)} suka
                      </span>
                    </div>
                    <div className="mt-4">
                      <span className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-pink-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-600/25 transition-all group-hover:brightness-110">
                        <Play size={14} fill="currentColor" /> {ep1Locked && ep1.is_premium ? 'Unlock untuk Baca' : 'Baca Sekarang'}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })()}
          
          {/* Other Episodes Grid */}
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {episodes.slice(episodes[0]?.is_premium ? 0 : 1).map((ep) => {
              const isVvipUser = user?.is_vvip === true
              const locked = ep.is_locked === true && !isVvipUser
              const hasThumbnail = ep.thumbnail_url && ep.thumbnail_url.length > 0
              return (
                <Link
                  key={ep.id}
                  to={`/comic/${comic.id}/episode/${ep.id}`}
                  className={`group relative overflow-hidden rounded-xl border transition-all hover:shadow-lg ${
                    locked && ep.is_premium
                      ? 'border-amber-500/20 bg-gradient-to-br from-surface-900 to-amber-950/20 hover:border-amber-500/40'
                      : 'border-surface-800 bg-surface-900 hover:border-brand-500/50 hover:shadow-brand-500/10'
                  }`}
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface-800">
                    {/* Always show number as main display */}
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-surface-800 via-surface-900 to-surface-800">
                      <span className="font-display text-5xl font-bold text-surface-700/50">{ep.number}</span>
                    </div>
                    {/* Overlay thumbnail if exists */}
                    {hasThumbnail && (
                      <img
                        src={ep.thumbnail_url!}
                        alt={ep.title}
                        className={`absolute inset-0 h-full w-full object-cover transition-all duration-500 group-hover:scale-110 ${
                          locked && ep.is_premium ? 'blur-md brightness-[0.3]' : ''
                        }`}
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none'
                        }}
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    
                    {/* Episode number */}
                    <div className="absolute left-3 top-3 flex h-8 w-8 items-center justify-center rounded-lg bg-black/60 text-xs font-bold text-white backdrop-blur-sm">
                      {ep.number}
                    </div>
                    
                    {/* Status badges */}
                    <div className="absolute right-3 top-3">
                      {locked && ep.is_premium && (
                        <div className="flex items-center gap-1 rounded-full bg-amber-500/90 px-2.5 py-1 text-[10px] font-bold text-white shadow-lg">
                          <Lock size={10} /> {ep.price_coin} koin
                        </div>
                      )}
                      {isVvipUser && ep.is_premium && (
                        <div className="flex items-center gap-1 rounded-full bg-purple-500/90 px-2.5 py-1 text-[10px] font-bold text-white shadow-lg">
                          <Gem size={10} /> VVIP
                        </div>
                      )}
                    </div>
                    
                    {/* Bottom badges */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                      {!ep.is_premium && (
                        <span className="rounded-full bg-emerald-500/90 px-2.5 py-1 text-[10px] font-bold text-white shadow-lg">
                          Gratis
                        </span>
                      )}
                      {ep.is_premium && !locked && (
                        <span className="rounded-full bg-emerald-500/90 px-2.5 py-1 text-[10px] font-bold text-white shadow-lg">
                          ✓ Terbuka
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Episode info */}
                  <div className="p-3">
                    <h3 className="text-sm font-bold text-surface-100 group-hover:text-brand-200 line-clamp-1">
                      {ep.title}
                    </h3>
                    <div className="mt-2 flex items-center gap-3 text-[11px] text-surface-500">
                      <span className="flex items-center gap-1">
                        <Eye size={11} /> {formatNumber(ep.view_count)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart size={11} /> {formatNumber(ep.like_count)}
                      </span>
                      {ep.page_count !== undefined && ep.page_count > 0 && (
                        <span>{ep.page_count} hlm</span>
                      )}
                    </div>
                    <div className="mt-2 text-xs text-surface-500">
                      {ep.published_at ? formatDate(ep.published_at) : 'Draft'}
                    </div>
                    
                    {/* Hover action */}
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-xs font-medium text-brand-400 opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-1">
                        {locked ? 'Buka dengan koin →' : 'Baca sekarang →'}
                      </span>
                      {ep.is_premium && (
                        <span className="flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-400">
                          <Coins size={10} /> {ep.price_coin}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
          
          {episodes.length === 0 && (
            <p className="rounded-2xl border border-dashed border-surface-800 p-8 text-center text-sm text-surface-500">
              Belum ada episode yang terbit.
            </p>
          )}
        </div>

        {/* Comments */}
        <div>
          <h2 className="font-display text-lg font-bold text-surface-50">Komentar ({comments.length})</h2>

          {user ? (
            <form onSubmit={submitComment} className="mt-4 flex gap-2">
              <input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Tulis komentar…"
                maxLength={1000}
                className="flex-1 rounded-xl border border-surface-800 bg-surface-950 px-4 py-2.5 text-sm text-surface-100 placeholder:text-surface-500 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
              />
              <button
                type="submit"
                disabled={commentBusy || !commentText.trim()}
                className="shrink-0 rounded-xl bg-gradient-to-r from-brand-600 to-pink-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-600/25 transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {commentBusy ? <Loader2 size={15} className="animate-spin" /> : 'Kirim'}
              </button>
            </form>
          ) : (
            <p className="mt-4 rounded-xl border border-dashed border-surface-800 px-4 py-3 text-xs text-surface-500">
              <Link to="/login" className="font-medium text-brand-300 hover:underline">Masuk</Link> untuk berkomentar.
            </p>
          )}

          <div className="mt-4 space-y-4">
            {comments.length === 0 && (
              <p className="rounded-xl border border-dashed border-surface-800 p-6 text-center text-sm text-surface-500">
                Belum ada komentar. Jadilah yang pertama!
              </p>
            )}
            {hasMoreComments && (
              <button
                onClick={loadMoreComments}
                disabled={loadingMore}
                className="w-full rounded-xl border border-surface-800 bg-surface-900 py-3 text-sm font-medium text-surface-400 transition-colors hover:border-brand-500/50 hover:text-brand-300 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loadingMore ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 size={15} className="animate-spin" /> Memuat komentar lainnya…
                  </span>
                ) : (
                  'Muat Lainnya'
                )}
              </button>
            )}
            {comments.map((comment) => {
              const isVvipComment = comment.user.is_vvip === true
              return (
              <div key={comment.id} className={`rounded-xl border p-4 ${isVvipComment ? 'comment-vvip-elite border-purple-500/30' : 'border-surface-800 bg-surface-900'}`}>
                <div className="flex min-w-0 items-center gap-3">
                  <Link to={`/user/${comment.user.id}`} className="shrink-0">
                    <div className={isVvipComment ? 'avatar-vvip-comment' : ''}>
                      <Avatar name={comment.user.name} avatarUrl={comment.user.avatar_url} size={32} className={`rounded-full transition-opacity hover:opacity-80 ${isVvipComment ? 'shadow-lg shadow-purple-500/30' : ''}`} />
                    </div>
                  </Link>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Link to={`/user/${comment.user.id}`} className={`truncate text-sm font-semibold transition-colors ${isVvipComment ? 'vvip-name-glow hover:opacity-80' : 'text-surface-100 hover:text-brand-300'}`}>
                        {comment.user.name}
                      </Link>
                      {isVvipComment && (
                        <span className="vvip-comment-badge">
                          <Gem size={9} /> VVIP
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-surface-400">{timeAgo(comment.created_at)}</p>
                  </div>
                </div>
                <p className={`mt-3 text-sm leading-relaxed ${isVvipComment ? 'text-purple-100/90' : 'text-surface-300'}`}>{comment.content}</p>
                <div className="mt-3 flex items-center gap-4">
                  <button
                    onClick={() => handleLikeComment(comment.id)}
                    disabled={!user}
                    className={`flex items-center gap-1.5 text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                      likedComments.has(comment.id) ? 'text-pink-400' : 'text-surface-400 hover:text-pink-400'
                    }`}
                  >
                    <Heart size={13} fill={likedComments.has(comment.id) ? 'currentColor' : 'none'} /> {commentLikes[comment.id] ?? comment.like_count}
                  </button>
                  <button
                    onClick={() => { setReplyingTo(replyingTo === comment.id ? null : comment.id); setReplyText('') }}
                    disabled={!user}
                    className="flex items-center gap-1.5 text-xs text-surface-400 transition-colors hover:text-brand-300 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <MessageCircle size={13} /> Balas
                  </button>
                  {user && user.id === comment.user.id && (
                    <button
                      onClick={() => setDeletingCommentId(comment.id)}
                      className="flex items-center gap-1.5 text-xs text-surface-500 transition-colors hover:text-red-400"
                    >
                      <Trash2 size={13} /> Hapus
                    </button>
                  )}
                </div>

                {/* Reply input */}
                {replyingTo === comment.id && user && (
                  <form onSubmit={(e) => submitReply(e, comment.id)} className="mt-3 flex gap-2">
                    <input
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder={`Balas ${comment.user.name}…`}
                      maxLength={1000}
                      autoFocus
                      className="flex-1 rounded-lg border border-surface-700 bg-surface-800 px-3 py-2 text-xs text-surface-100 placeholder:text-surface-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500/30"
                    />
                    <button
                      type="submit"
                      disabled={replyBusy || !replyText.trim()}
                      className="shrink-0 rounded-lg bg-brand-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {replyBusy ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                    </button>
                  </form>
                )}

                {/* Replies */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="mt-4 space-y-3 border-l-2 border-surface-800 pl-4">
                    {comment.replies.map((reply) => (
                      <div key={reply.id} className="group">
                        <div className="flex items-start gap-2.5">
                          <Link to={`/user/${reply.user.id}`} className="shrink-0">
                            <Avatar name={reply.user.name} avatarUrl={reply.user.avatar_url} size={24} className="rounded-full transition-opacity hover:opacity-80" />
                          </Link>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-surface-200">
                              <Link to={`/user/${reply.user.id}`} className="hover:text-brand-300 transition-colors">
                                {reply.user.name}
                              </Link>
                              <span className="font-normal text-surface-500"> membalas </span>
                              <Link to={`/user/${reply.parent_user?.id ?? comment.user.id}`} className="font-medium text-brand-400 hover:text-brand-300 transition-colors">
                                {reply.parent_user?.name ?? comment.user.name}
                              </Link>
                              <span className="font-normal text-surface-500"> · {timeAgo(reply.created_at)}</span>
                            </p>
                            <p className="mt-0.5 text-xs leading-relaxed text-surface-400">{reply.content}</p>
                          </div>
                        </div>
                        <div className="ml-8 mt-1 flex items-center gap-3">
                          <button
                            onClick={() => handleLikeComment(reply.id)}
                            disabled={!user}
                            className={`flex items-center gap-1 text-[11px] transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                              likedComments.has(reply.id) ? 'text-pink-400' : 'text-surface-500 hover:text-pink-400'
                            }`}
                          >
                            <Heart size={11} fill={likedComments.has(reply.id) ? 'currentColor' : 'none'} /> {commentLikes[reply.id] ?? reply.like_count}
                          </button>
                          <button
                            onClick={() => { setReplyingTo(replyingTo === reply.id ? null : reply.id); setReplyText('') }}
                            disabled={!user}
                            className="flex items-center gap-1 text-[11px] text-surface-500 transition-colors hover:text-brand-400 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <MessageCircle size={11} /> Balas
                          </button>
                          {user && user.id === reply.user.id && (
                            <button
                              onClick={() => setDeletingCommentId(reply.id)}
                              className="flex items-center gap-1 text-[11px] text-surface-500 transition-colors hover:text-red-400"
                            >
                              <Trash2 size={11} />
                            </button>
                          )}
                        </div>

                        {/* Reply-to-reply input */}
                        {replyingTo === reply.id && user && (
                          <form onSubmit={(e) => submitReply(e, comment.id)} className="ml-8 mt-2 flex gap-2">
                            <input
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder={`Balas ${reply.user.name}…`}
                              maxLength={1000}
                              autoFocus
                              className="flex-1 rounded-lg border border-surface-700 bg-surface-800 px-3 py-2 text-[11px] text-surface-100 placeholder:text-surface-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500/30"
                            />
                            <button
                              type="submit"
                              disabled={replyBusy || !replyText.trim()}
                              className="shrink-0 rounded-lg bg-brand-600 px-2.5 py-2 text-[11px] font-semibold text-white transition-colors hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {replyBusy ? <Loader2 size={10} className="animate-spin" /> : <Send size={10} />}
                            </button>
                          </form>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )})}
          </div>
        </div>
      </section>
      {/* Delete confirmation modal */}
      {deletingCommentId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setDeletingCommentId(null)}>
          <div
            className="w-full max-w-sm rounded-2xl border border-surface-700 bg-surface-900 p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/15">
                <Trash2 size={18} className="text-red-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-surface-50">Hapus Komentar?</h3>
                <p className="mt-0.5 text-xs text-surface-400">Tindakan ini tidak dapat dibatalkan.</p>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setDeletingCommentId(null)}
                className="rounded-lg border border-surface-700 px-4 py-2 text-xs font-semibold text-surface-300 transition-colors hover:bg-surface-800"
              >
                Batal
              </button>
              <button
                onClick={() => handleDeleteComment(deletingCommentId)}
                disabled={false}
                className="rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  AlertCircle,
  ArrowLeft,
  Bookmark,
  Calendar,
  Check,
  Eye,
  Heart,
  Loader2,
  Lock,
  Play,
  Share2,
  Star,
  Users,
} from 'lucide-react'
import Avatar from '../components/Avatar'
import { content } from '../services/content'
import { community } from '../services/community'
import { getApiErrorMessage } from '../utils/errors'
import { auth } from '../services/auth'
import { coverEmoji, coverKeyOf, coverStyle } from '../data/mock'
import { formatDate, formatNumber, timeAgo } from '../utils/format'
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

  const episodes = comic.episodes
  const firstReadable = episodes.find((e) => e.is_premium !== true) ?? episodes[0]

  return (
    <div className="animate-fade-in">
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
              className="flex aspect-[3/4] items-center justify-center rounded-2xl border border-white/10 shadow-2xl shadow-black/50"
              style={{ background: coverStyle(coverKeyOf(comic.id)) }}
            >
              <span className="text-6xl drop-shadow-xl">{coverEmoji(coverKeyOf(comic.id))}</span>
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
              <button className="inline-flex items-center gap-1.5 rounded-xl border border-surface-700 bg-surface-900 px-4 py-2.5 text-xs font-semibold text-surface-200 transition-colors hover:border-brand-500/50 sm:gap-2 sm:px-5 sm:py-3 sm:text-sm">
                <Share2 size={14} className="sm:hidden" /><Share2 size={16} className="hidden sm:block" /> Bagikan
              </button>
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
          <h2 className="font-display text-lg font-bold text-surface-50">Daftar Episode</h2>
          <div className="mt-4 space-y-2">
            {episodes.map((ep) => {
              const locked = ep.is_locked === true || (ep.is_premium && ep.is_locked === undefined && !user)
              return (
                <Link
                  key={ep.id}
                  to={`/comic/${comic.id}/episode/${ep.id}`}
                  className="group flex items-center gap-4 rounded-xl border border-surface-800 bg-surface-900 p-4 transition-all hover:border-brand-500/50 hover:bg-surface-800/60"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-800 font-display text-sm font-bold text-surface-300 transition-colors group-hover:bg-brand-500/20 group-hover:text-brand-300">
                    {locked ? <Lock size={16} /> : ep.number}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-surface-100 group-hover:text-brand-200">
                      {ep.title}
                    </p>
                    <p className="text-xs text-surface-400">
                      {formatDate(ep.published_at)} · {formatNumber(ep.view_count)} dibaca
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3 text-xs">
                    {ep.is_premium ? (
                      locked ? (
                        <span className="flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-1 font-semibold text-amber-300">
                          <Lock size={11} /> {ep.price_coin} koin
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-1 font-semibold text-emerald-300">
                          <Check size={11} /> Terbuka
                        </span>
                      )
                    ) : (
                      <span className="rounded-full bg-brand-500/15 px-2.5 py-1 font-semibold text-brand-300">Gratis</span>
                    )}
                  </div>
                </Link>
              )
            })}
            {episodes.length === 0 && (
              <p className="rounded-xl border border-dashed border-surface-800 p-6 text-center text-sm text-surface-500">
                Belum ada episode yang terbit.
              </p>
            )}
          </div>
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
            {comments.map((comment) => (
              <div key={comment.id} className="rounded-xl border border-surface-800 bg-surface-900 p-4">
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar name={comment.user.name} avatarUrl={comment.user.avatar_url} size={32} className="shrink-0 rounded-full" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-surface-100">{comment.user.name}</p>
                    <p className="text-xs text-surface-400">{timeAgo(comment.created_at)}</p>
                  </div>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-surface-300">{comment.content}</p>
                <div className="mt-2 flex items-center gap-1.5 text-xs text-surface-400">
                  <Heart size={13} /> {comment.like_count}
                </div>
                {comment.replies && comment.replies.length > 0 && (
                  <div className="mt-4 space-y-3 border-l-2 border-surface-800 pl-4">
                    {comment.replies.map((reply) => (
                      <div key={reply.id} className="flex items-start gap-2.5">
                        <Avatar name={reply.user.name} avatarUrl={reply.user.avatar_url} size={24} className="rounded-full" />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-surface-200">
                            {reply.user.name} <span className="font-normal text-surface-500">· {timeAgo(reply.created_at)}</span>
                          </p>
                          <p className="mt-0.5 text-xs leading-relaxed text-surface-400">{reply.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

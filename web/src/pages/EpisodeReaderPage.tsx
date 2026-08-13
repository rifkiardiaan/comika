import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Coins,
  Home,
  List,
  Loader2,
  Lock,
  LogIn,
  Wallet,
} from 'lucide-react'
import { content } from '../services/content'
import { monetization } from '../services/monetization'
import { getApiErrorMessage } from '../utils/errors'
import { auth } from '../services/auth'
import { coverEmoji, coverKeyOf } from '../data/mock'
import { readingTime } from '../utils/format'
import type { ComicDetail, EpisodeDetail } from '../types'

const gradients = ['#1e1b4b', '#312e81', '#4c1d95', '#831843', '#7f1d1d', '#14532d', '#0c4a6e', '#292524']

export default function EpisodeReaderPage() {
  const { id, episodeId } = useParams()
  const navigate = useNavigate()

  const [comic, setComic] = useState<ComicDetail | null>(null)
  const [episode, setEpisode] = useState<EpisodeDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [progress, setProgress] = useState(0)
  const [unlocking, setUnlocking] = useState(false)
  const [balance, setBalance] = useState<number | null>(() => auth.getStoredUser()?.coin_balance ?? null)
  const [failedPages, setFailedPages] = useState<Set<number>>(() => new Set())

  const user = auth.getStoredUser()
  const isLoggedIn = user !== null

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [comicData, episodeData] = await Promise.all([
        content.comic(id!),
        content.episode(episodeId!),
      ])
      setComic(comicData)
      setEpisode(episodeData)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Gagal memuat episode.'))
    } finally {
      setLoading(false)
    }
  }, [id, episodeId])

  useEffect(() => {
    if (id && episodeId) load()
  }, [id, episodeId, load])

  useEffect(() => {
    const onScroll = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight
      if (scrollable > 0) {
        setProgress(Math.min(100, Math.round((window.scrollY / scrollable) * 100)))
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleUnlock = async () => {
    if (!episode || !isLoggedIn) return
    setUnlocking(true)
    setError('')
    try {
      const result = await monetization.unlock(episode.id)
      setBalance(result.balance)
      if (user) {
        auth.setSession(auth.getToken() ?? '', { ...user, coin_balance: result.balance })
      }
      await load()
    } catch (err) {
      setError(getApiErrorMessage(err, 'Gagal meng-unlock episode.'))
    } finally {
      setUnlocking(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-950 text-surface-500">
        <Loader2 size={22} className="mr-2 animate-spin" /> Memuat episode…
      </div>
    )
  }

  if (error || !episode || !comic) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-surface-950 px-4 text-center">
        <AlertCircle size={36} className="text-red-400" />
        <h1 className="mt-4 font-display text-2xl font-bold text-surface-50">Episode Tidak Ditemukan</h1>
        <p className="mt-2 max-w-md text-sm text-surface-400">{error}</p>
        <Link
          to={id ? `/comic/${id}` : '/'}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-pink-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-600/25 transition-all hover:brightness-110"
        >
          <ArrowLeft size={16} /> Kembali ke Komik
        </Link>
      </div>
    )
  }

  const locked = episode.is_locked === true
  const pages = episode.pages ?? []

  return (
    <div className="min-h-screen bg-surface-950">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-surface-800/70 bg-surface-950/90 backdrop-blur-lg">
        <div className="mx-auto flex h-14 max-w-5xl items-center gap-3 px-4">
          <Link
            to={`/comic/${comic.id}`}
            className="flex items-center gap-2 text-sm text-surface-300 hover:text-surface-50"
          >
            <ArrowLeft size={18} />
            <span className="hidden sm:inline">{comic.title}</span>
            <span className="sm:hidden">Kembali</span>
          </Link>
          <span className="mx-1 hidden h-4 w-px bg-surface-700 sm:block" />
          <span className="truncate text-sm font-medium text-surface-100">{episode.title}</span>
          <div className="ml-auto flex items-center gap-1">
            <Link
              to={`/comic/${comic.id}`}
              className="rounded-lg p-2 text-surface-400 transition-colors hover:bg-surface-800 hover:text-surface-50"
              title="Daftar episode"
            >
              <List size={18} />
            </Link>
            {isLoggedIn && (
              <Link
                to="/wallet"
                className="flex items-center gap-1.5 rounded-lg px-2 py-2 text-sm font-semibold text-amber-300 transition-colors hover:bg-surface-800"
                title="Dompet koin"
              >
                <Coins size={16} />
                {balance?.toLocaleString('id-ID') ?? '…'}
              </Link>
            )}
            <Link to="/" className="rounded-lg p-2 text-surface-400 transition-colors hover:bg-surface-800 hover:text-surface-50" title="Beranda">
              <Home size={18} />
            </Link>
          </div>
        </div>
        {/* Progress bar */}
        <div className="h-0.5 w-full bg-surface-800">
          <div
            className="h-full bg-gradient-to-r from-brand-500 to-pink-500 transition-all duration-150"
            style={{ width: `${progress}%` }}
          />
        </div>
      </header>

      {locked ? (
        /* ====== Lock screen ====== */
        <main className="flex min-h-[80vh] items-center justify-center px-4 py-16">
          <div className="relative w-full max-w-md animate-slide-up overflow-hidden rounded-3xl border border-surface-800 bg-surface-900 p-8 text-center shadow-2xl shadow-black/40">
            <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-amber-500/15 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-brand-500/15 blur-3xl" />

            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-600/30">
              <Lock size={28} />
            </span>
            <h1 className="mt-5 font-display text-2xl font-bold text-surface-50">Episode Premium</h1>
            <p className="mt-1 text-sm text-surface-400">{comic.title}</p>
            <p className="mt-3 text-sm font-medium text-surface-200">{episode.title}</p>

            <div className="mt-6 flex items-center justify-center gap-2 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3">
              <Coins size={18} className="text-amber-400" />
              <span className="font-display text-2xl font-bold text-amber-300">{episode.price_coin}</span>
              <span className="text-sm text-amber-200/80">koin</span>
            </div>

            {error && (
              <p className="mt-4 rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-400">{error}</p>
            )}

            {!isLoggedIn ? (
              <>
                <p className="mt-4 text-sm text-surface-400">
                  Masuk untuk membuka episode premium ini dengan koin.
                </p>
                <button
                  onClick={() => navigate('/login')}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-pink-600 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-600/25 transition-all hover:brightness-110"
                >
                  <LogIn size={16} /> Masuk untuk Lanjut
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleUnlock}
                  disabled={unlocking}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 py-3 text-sm font-bold text-white shadow-lg shadow-amber-600/30 transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {unlocking ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />}
                  {unlocking ? 'Membuka Episode…' : `Unlock dengan ${episode.price_coin} Koin`}
                </button>
                <div className="mt-4 flex items-center justify-between rounded-xl border border-surface-800 bg-surface-950 px-4 py-3 text-sm">
                  <span className="flex items-center gap-1.5 text-surface-400">
                    <Wallet size={14} /> Saldo kamu
                  </span>
                  <span className="flex items-center gap-1 font-semibold text-amber-300">
                    <Coins size={14} /> {balance?.toLocaleString('id-ID') ?? '…'}
                  </span>
                </div>
                {balance !== null && balance < episode.price_coin && (
                  <Link
                    to="/wallet"
                    className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-brand-300 underline-offset-2 hover:underline"
                  >
                    Saldo tidak cukup — top-up koin <ArrowRight size={12} />
                  </Link>
                )}
              </>
            )}
          </div>
        </main>
      ) : (
        /* ====== Pages ====== */
        <main className="mx-auto max-w-2xl px-0 sm:px-4">
          <div className="mb-6 border-b border-surface-800/60 px-4 pb-4 pt-6 sm:px-0">
            <p className="text-xs uppercase tracking-wide text-surface-400">{comic.title}</p>
            <h1 className="mt-1 font-display text-xl font-bold text-surface-50">{episode.title}</h1>
            <p className="mt-1 text-xs text-surface-400">
              {pages.length} halaman · {readingTime(pages.length)}
              {episode.is_premium && (
                <span className="ml-2 rounded-full bg-emerald-500/15 px-2 py-0.5 font-semibold text-emerald-300">
                  Premium terbuka
                </span>
              )}
            </p>
          </div>

          {pages.length === 0 ? (
            <div className="px-4 py-24 text-center text-surface-500 sm:px-0">
              Episode ini belum memiliki halaman.
            </div>
          ) : (
            pages.map((page, i) => {
              const failed = failedPages.has(page.id)
              return (
                <div
                  key={page.id}
                  className="relative flex min-h-[70vh] items-center justify-center border-b border-surface-800/40"
                  style={{
                    background: `linear-gradient(160deg, ${gradients[i % gradients.length]}, ${gradients[(i + 3) % gradients.length]})`,
                  }}
                >
                  {!failed ? (
                    <img
                      src={page.image_url}
                      alt={`Halaman ${page.page_number}`}
                      loading="lazy"
                      onError={() =>
                        setFailedPages((prev) => {
                          const next = new Set(prev)
                          next.add(page.id)
                          return next
                        })
                      }
                      className="w-full"
                    />
                  ) : (
                    /* Placeholder hanya tampil bila gambar gagal dimuat */
                    <div className="flex flex-col items-center gap-3 py-10 text-center">
                      <span className="text-5xl drop-shadow-lg">{coverEmoji(coverKeyOf(comic.id))}</span>
                      <span className="font-display text-3xl font-bold text-white/90">
                        Halaman {page.page_number}
                      </span>
                      <span className="max-w-xs text-sm text-white/60">
                        Panel ilustrasi webtoon — halaman penuh, scroll vertikal.
                      </span>
                    </div>
                  )}
                </div>
              )
            })
          )}

          {/* Episode nav */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-10 sm:px-0">
            {episode.prev ? (
              <Link
                to={`/comic/${comic.id}/episode/${episode.prev.id}`}
                className="inline-flex items-center gap-2 rounded-xl border border-surface-700 bg-surface-900 px-5 py-3 text-sm font-semibold text-surface-200 transition-colors hover:border-brand-500/50"
              >
                <ArrowLeft size={16} /> Episode Sebelumnya
              </Link>
            ) : (
              <span />
            )}
            {episode.next ? (
              <Link
                to={`/comic/${comic.id}/episode/${episode.next.id}`}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-pink-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-600/25 transition-all hover:brightness-110"
              >
                Episode Berikutnya <ArrowRight size={16} />
              </Link>
            ) : (
              <Link
                to={`/comic/${comic.id}`}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-pink-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-600/25 transition-all hover:brightness-110"
              >
                Selesai — Kembali ke Komik <ArrowRight size={16} />
              </Link>
            )}
          </div>
        </main>
      )}
    </div>
  )
}

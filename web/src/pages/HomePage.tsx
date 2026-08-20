import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Flame, Sparkles, TrendingUp } from 'lucide-react'
import ComicCard from '../components/ComicCard'
import { content } from '../services/content'
import { coverEmoji, coverKeyOf, coverStyle } from '../data/mock'
import type { Comic } from '../types'

export default function HomePage() {
  const [trending, setTrending] = useState<Comic[]>([])
  const [recommended, setRecommended] = useState<Comic[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const [popular, rating] = await Promise.all([
          content.comics({ sort: 'popular', per_page: 10 }),
          content.comics({ sort: 'rating', per_page: 8 }),
        ])
        if (cancelled) return
        setTrending(popular.data)
        setRecommended(rating.data)
      } catch {
        // abaikan — halaman tetap tampil dengan data kosong
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const hero = trending[0]
  const heroLoading = loading && !hero

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{ background: heroLoading ? 'linear-gradient(160deg,#1e1b4b,#7c3aed)' : coverStyle(coverKeyOf(hero!.id)) }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-surface-950 via-surface-950/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-surface-950 via-transparent to-surface-950/40" />

        <div className="relative mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 sm:py-16 lg:flex-row lg:items-center lg:gap-10 lg:py-24">
          <div className="max-w-xl">
            {heroLoading ? (
              <>
                <div className="h-6 w-40 animate-pulse rounded-full bg-white/10" />
                <div className="mt-4 h-12 w-3/4 animate-pulse rounded-xl bg-white/10" />
                <div className="mt-3 h-4 w-full animate-pulse rounded bg-white/10" />
                <div className="mt-2 h-4 w-2/3 animate-pulse rounded bg-white/10" />
              </>
            ) : (
              <>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                  <Flame size={13} className="text-amber-300" /> Sedang Trending
                </span>
                <h1 className="mt-4 font-display text-2xl font-bold leading-tight text-white sm:text-3xl lg:text-5xl">
                  {hero!.title}
                </h1>
                <p className="mt-3 line-clamp-3 max-w-lg text-sm leading-relaxed text-surface-200/90 sm:text-base">
                  {hero!.synopsis}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {hero!.genres.map((gen) => (
                    <span key={gen.id} className="rounded-full bg-white/15 px-3 py-1 text-xs text-white backdrop-blur">
                      {gen.name}
                    </span>
                  ))}
                </div>
              </>
            )}
            <div className="mt-6 flex flex-wrap gap-3 sm:mt-8">
              {hero && (
                <Link
                  to={`/comic/${hero.id}`}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-pink-600 px-6 py-3 text-sm font-semibold text-white shadow-xl shadow-brand-600/30 transition-all hover:brightness-110"
                >
                  Mulai Membaca <ArrowRight size={16} />
                </Link>
              )}
              <Link
                to="/discover"
                className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition-colors hover:bg-white/20"
              >
                Jelajahi Semua
              </Link>
            </div>
          </div>

          {/* Hero cover */}
          {hero && (
            <div className="relative mx-auto hidden lg:block">
              <div
                className="flex h-80 w-56 items-center justify-center rounded-2xl border border-white/20 shadow-2xl shadow-black/50"
                style={{ background: coverStyle(coverKeyOf(hero.id)) }}
              >
                <span className="text-7xl drop-shadow-xl">{coverEmoji(coverKeyOf(hero.id))}</span>
              </div>
              <div className="absolute -right-6 -top-4 rotate-6 rounded-xl border border-white/10 bg-white/10 px-3 py-2 backdrop-blur">
                <div className="text-[10px] uppercase tracking-wide text-white/70">Rating</div>
                <div className="font-display text-lg font-bold text-amber-300">⭐ {hero.rating_avg.toFixed(1)}</div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Trending */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="flex items-center gap-2 font-display text-xl font-bold text-surface-50">
              <TrendingUp size={20} className="text-brand-400" /> Trending Minggu Ini
            </h2>
            <p className="mt-1 text-sm text-surface-400">Komik paling banyak dibaca saat ini</p>
          </div>
          <Link to="/discover" className="flex items-center gap-1 text-sm font-medium text-brand-300 hover:text-brand-200">
            Lihat semua <ArrowRight size={14} />
          </Link>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {loading ? (
            <SectionSkeleton count={10} />
          ) : (
            trending.map((comic) => <ComicCard key={comic.id} comic={comic} />)
          )}
        </div>
        {!loading && trending.length === 0 && (
          <p className="mt-8 text-center text-sm text-surface-500">Belum ada komik yang terbit.</p>
        )}
      </section>

      {/* Recommended */}
      <section className="border-t border-surface-800/60 bg-surface-900/40 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="flex items-center gap-2 font-display text-xl font-bold text-surface-50">
            <Sparkles size={20} className="text-pink-400" /> Rekomendasi Untukmu
          </h2>
          <p className="mt-1 text-sm text-surface-400">Berdasarkan rating tertinggi dari komunitas</p>
          {loading ? (
            <div className="mt-6 flex gap-4 overflow-hidden">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-64 w-40 shrink-0 animate-pulse rounded-2xl bg-surface-800" />
              ))}
            </div>
          ) : (
            <div className="no-scrollbar mt-6 flex gap-4 overflow-x-auto pb-2">
              {recommended.map((comic) => (
                <div key={comic.id} className="w-40 shrink-0">
                  <ComicCard comic={comic} compact />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl border border-brand-500/30 bg-gradient-to-r from-brand-900/60 via-surface-900 to-pink-900/40 p-8 sm:p-12">
          <div className="relative z-10 max-w-xl">
            <h2 className="font-display text-2xl font-bold text-surface-50 sm:text-3xl">
              Punya cerita untuk dibagikan?
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-surface-300 sm:text-base">
              Terbitkan komikmu di COMIKA, jangkau ribuan pembaca, dan mulai dapatkan penghasilan dari
              karyamu.
            </p>
            <Link
              to="/register"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-500 to-pink-500 px-6 py-3 text-sm font-semibold text-white shadow-xl shadow-brand-500/30 transition-all hover:brightness-110"
            >
              Mulai Jadi Creator <ArrowRight size={16} />
            </Link>
          </div>
          <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-brand-500/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-10 right-24 h-40 w-40 rounded-full bg-pink-500/20 blur-3xl" />
        </div>
      </section>
    </div>
  )
}

function SectionSkeleton({ count }: { count: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-72 animate-pulse rounded-2xl bg-surface-900" />
      ))}
    </>
  )
}

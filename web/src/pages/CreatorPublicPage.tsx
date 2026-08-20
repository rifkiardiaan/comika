import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AlertCircle, ArrowLeft, BadgeCheck, BookOpen, Eye, Heart, Loader2, Play, Users } from 'lucide-react'
import Avatar from '../components/Avatar'
import ComicCard from '../components/ComicCard'
import { content } from '../services/content'
import { getApiErrorMessage } from '../utils/errors'
import { coverKeyOf, coverStyle } from '../data/mock'
import { formatNumber } from '../utils/format'
import type { PublicCreator } from '../types'

export default function CreatorPublicPage() {
  const { id } = useParams()
  const [creator, setCreator] = useState<PublicCreator | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchCreator = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await content.creator(id!)
      setCreator(data)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Gagal memuat profil creator.'))
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    if (id) fetchCreator()
  }, [id, fetchCreator])

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-surface-500">
        <Loader2 size={22} className="mr-2 animate-spin" /> Memuat profil creator…
      </div>
    )
  }

  if (error || !creator) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 text-center">
        <AlertCircle size={36} className="text-red-400" />
        <h1 className="mt-4 font-display text-2xl font-bold text-surface-50">Creator Tidak Ditemukan</h1>
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

  const stats = [
    { icon: <BookOpen size={16} className="text-brand-300" />, value: formatNumber(creator.stats.total_comics), label: 'Komik' },
    { icon: <Play size={16} className="text-pink-300" />, value: formatNumber(creator.stats.total_episodes), label: 'Episode' },
    { icon: <Eye size={16} className="text-surface-400" />, value: formatNumber(creator.stats.total_views), label: 'Dibaca' },
    { icon: <Heart size={16} className="text-red-400" />, value: formatNumber(creator.stats.total_likes), label: 'Suka' },
    { icon: <Users size={16} className="text-emerald-400" />, value: formatNumber(creator.stats.follower_count), label: 'Pengikut' },
  ]

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <section className="relative overflow-hidden border-b border-surface-800/70">
        {/* Banner */}
        {creator.banner_url ? (
          <img
            src={creator.banner_url}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-40"
          />
        ) : (
          <div
            className="absolute inset-0 opacity-30"
            style={{ background: coverStyle(coverKeyOf(creator.id)) }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-surface-950/70 to-surface-950" />

        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-end">
            <Avatar name={creator.display_name} avatarUrl={creator.avatar_url} size={112} className="rounded-3xl shadow-2xl shadow-black/50 ring-4 ring-surface-950/60" />
            <div className="text-center sm:text-left">
              <h1 className="flex items-center justify-center gap-2 font-display text-3xl font-bold text-surface-50 sm:justify-start">
                {creator.display_name}
                {creator.is_verified && (
                  <BadgeCheck size={22} className="text-brand-400" aria-label="Creator terverifikasi" />
                )}
              </h1>
              <p className="mt-1 text-sm text-surface-400">@{creator.username}</p>
              {creator.bio && <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-surface-300 sm:mx-0">{creator.bio}</p>}
            </div>
          </div>

          {/* Stats */}
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-5">
            {stats.map((s) => (
              <div key={s.label} className="flex items-center gap-2.5 rounded-xl border border-surface-800 bg-surface-900/70 px-4 py-3 backdrop-blur">
                {s.icon}
                <div>
                  <p className="font-display text-lg font-bold leading-tight text-surface-50">{s.value}</p>
                  <p className="text-[11px] text-surface-500">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comic list */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <h2 className="font-display text-lg font-bold text-surface-50">Komik oleh {creator.display_name}</h2>

        {creator.comics.length === 0 ? (
          <p className="mt-4 rounded-xl border border-dashed border-surface-800 p-6 text-center text-sm text-surface-500">
            Belum ada komik yang terbit.
          </p>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {creator.comics.map((comic) => (
              <ComicCard key={comic.id} comic={comic} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

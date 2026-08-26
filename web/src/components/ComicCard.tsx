import { Link, useNavigate } from 'react-router-dom'
import { Eye, Heart, Star } from 'lucide-react'
import Avatar from './Avatar'
import type { Comic } from '../types'
import { coverEmoji, coverKeyOf, coverStyle } from '../data/mock'
import { formatNumber } from '../utils/format'

interface Props {
  comic: Comic
  compact?: boolean
}

export default function ComicCard({ comic, compact = false }: Props) {
  const navigate = useNavigate()
  const key = coverKeyOf(comic.id)
  return (
    <div
      role="link"
      tabIndex={0}
      onClick={() => navigate(`/comic/${comic.id}`)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          navigate(`/comic/${comic.id}`)
        }
      }}
      className="group block cursor-pointer focus:outline-none"
    >
      <div className="relative overflow-hidden rounded-2xl border border-surface-800 bg-surface-900 shadow-lg transition-all duration-300 group-hover:-translate-y-1.5 group-hover:border-brand-500/60 group-hover:shadow-xl group-hover:shadow-brand-500/10">
        {/* Cover */}
        <div
          className="relative flex aspect-[3/4] items-center justify-center overflow-hidden"
          style={{ background: coverStyle(key) }}
        >
          {comic.cover_url ? (
            <img
              src={comic.cover_url}
              alt={comic.title}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
              loading="lazy"
            />
          ) : (
            <span className="text-5xl drop-shadow-lg transition-transform duration-300 group-hover:scale-110">
              {coverEmoji(key)}
            </span>
          )}
          {/* gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          {/* status badge */}
          {comic.status !== 'ongoing' && (
            <span className="absolute left-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white backdrop-blur">
              {comic.status === 'completed' ? 'Selesai' : 'Hiatus'}
            </span>
          )}
          {/* episode badge */}
          <span className="absolute bottom-2 right-2 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white backdrop-blur">
            {comic.episode_count} eps
          </span>
          {/* rating */}
          <span className="absolute bottom-2 left-2 flex items-center gap-1 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] font-semibold text-amber-300 backdrop-blur">
            <Star size={10} fill="currentColor" /> {comic.rating_avg.toFixed(1)}
          </span>
        </div>

        {/* Info */}
        <div className="space-y-1 p-3">
          <h3 className="line-clamp-1 text-sm font-semibold text-surface-50 transition-colors group-hover:text-brand-300">
            {comic.title}
          </h3>
          {!compact && (
            <>
              <p className="flex items-center gap-1.5 text-xs text-surface-400">
                <Avatar name={comic.creator.name} avatarUrl={comic.creator.avatar_url} size={16} className="rounded-full" />
                <Link
                  to={`/creators/${comic.creator.id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="line-clamp-1 transition-colors hover:text-brand-300"
                >
                  {comic.creator.name}
                </Link>
              </p>
              <div className="flex flex-wrap gap-1 pt-0.5">
                {comic.genres.slice(0, 2).map((gen) => (
                  <span
                    key={gen.id}
                    className="rounded-full bg-surface-800 px-2 py-0.5 text-[10px] text-surface-300"
                  >
                    {gen.name}
                  </span>
                ))}
              </div>
            </>
          )}
          {compact && (
            <div className="flex items-center gap-3 pt-0.5 text-[10px] text-surface-400">
              <span className="flex items-center gap-1">
                <Eye size={11} /> {formatNumber(comic.view_count)}
              </span>
              <span className="flex items-center gap-1">
                <Heart size={11} /> {formatNumber(comic.like_count)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

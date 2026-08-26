import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  AlertCircle,
  ArrowLeft,
  BadgeCheck,
  BookOpen,
  Calendar,
  Coins,
  Crown,
  Eye,
  Gem,
  Heart,
  Loader2,
  MessageCircle,
  Star,
  Users,
} from 'lucide-react'
import Avatar from '../components/Avatar'
import api from '../services/api'
import { auth } from '../services/auth'
import { getApiErrorMessage } from '../utils/errors'
import { formatDate, formatNumber } from '../utils/format'
import type { User } from '../types'

interface PublicUserProfile {
  id: number
  name: string
  username: string
  avatar_url: string | null
  role: string
  is_premium: boolean
  is_vvip: boolean
  created_at: string
  stats: {
    comics_count: number
    comments_count: number
    likes_given: number
  }
}

export default function PublicUserProfilePage() {
  const { id } = useParams()
  const [profile, setProfile] = useState<PublicUserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const currentUser = auth.getStoredUser()

  const fetchProfile = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const { data } = await api.get<{ data: PublicUserProfile }>(`/users/${id}/public-profile`)
      setProfile(data.data)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Gagal memuat profil pengguna.'))
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    if (id) fetchProfile()
  }, [id, fetchProfile])

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-surface-500">
        <Loader2 size={22} className="mr-2 animate-spin" /> Memuat profil…
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 text-center">
        <AlertCircle size={36} className="text-red-400" />
        <h1 className="mt-4 font-display text-2xl font-bold text-surface-50">Pengguna Tidak Ditemukan</h1>
        <p className="mt-2 text-sm text-surface-400">{error}</p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-pink-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-600/25 transition-all hover:brightness-110"
        >
          <ArrowLeft size={16} /> Kembali
        </Link>
      </div>
    )
  }

  const isOwnProfile = currentUser?.id === profile.id

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <section className="relative overflow-hidden border-b border-surface-800/70 bg-gradient-to-br from-brand-900/40 via-surface-950 to-purple-900/30 py-12">
        <div className="pointer-events-none absolute -left-32 top-0 h-64 w-64 rounded-full bg-brand-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-32 bottom-0 h-64 w-64 rounded-full bg-purple-500/20 blur-3xl" />
        
        <div className="relative mx-auto flex max-w-4xl flex-col items-center gap-6 px-4 sm:flex-row sm:items-start sm:px-6">
          {/* Avatar */}
          <div className="relative">
            {profile.is_vvip && (
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 opacity-75 blur animate-pulse" />
            )}
            <div className="relative">
              <Avatar
                name={profile.name}
                avatarUrl={profile.avatar_url}
                size={120}
                className="rounded-full border-4 border-surface-900 shadow-xl"
              />
              {profile.is_vvip && (
                <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-purple-500 text-white shadow-lg">
                  <Gem size={14} />
                </div>
              )}
            </div>
          </div>
          
          {/* Info */}
          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <h1 className="font-display text-3xl font-bold text-surface-50">{profile.name}</h1>
              {profile.is_vvip && (
                <span className="badge-vvip inline-flex items-center gap-1 rounded-full border border-purple-500/50 bg-gradient-to-r from-purple-600/20 via-pink-500/20 to-purple-600/20 px-3 py-1 text-xs font-bold text-purple-200">
                  <Gem size={12} /> VVIP
                </span>
              )}
              {profile.is_premium && !profile.is_vvip && (
                <span className="badge-premium inline-flex items-center gap-1 rounded-full border border-amber-500/40 bg-gradient-to-r from-amber-500/15 to-orange-500/15 px-3 py-1 text-xs font-semibold text-amber-300">
                  <Crown size={12} /> Premium
                </span>
              )}
              {profile.role === 'creator' && (
                <span className="inline-flex items-center gap-1 rounded-full border border-pink-500/40 bg-pink-500/10 px-3 py-1 text-xs font-semibold text-pink-300">
                  <Star size={12} /> Creator
                </span>
              )}
            </div>
            
            <p className="mt-1 text-surface-400">@{profile.username}</p>
            
            <div className="mt-3 flex flex-wrap items-center justify-center gap-4 text-sm text-surface-400 sm:justify-start">
              <span className="flex items-center gap-1.5">
                <Calendar size={14} /> Bergabung {formatDate(profile.created_at)}
              </span>
            </div>
            
            {/* Stats */}
            <div className="mt-6 flex flex-wrap justify-center gap-4 sm:justify-start">
              <div className="flex items-center gap-2 rounded-xl border border-surface-800 bg-surface-900/60 px-4 py-2">
                <BookOpen size={16} className="text-brand-400" />
                <div>
                  <p className="text-lg font-bold text-surface-50">{formatNumber(profile.stats.comics_count)}</p>
                  <p className="text-[10px] text-surface-500">Komik</p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-surface-800 bg-surface-900/60 px-4 py-2">
                <MessageCircle size={16} className="text-pink-400" />
                <div>
                  <p className="text-lg font-bold text-surface-50">{formatNumber(profile.stats.comments_count)}</p>
                  <p className="text-[10px] text-surface-500">Komentar</p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-surface-800 bg-surface-900/60 px-4 py-2">
                <Heart size={16} className="text-red-400" />
                <div>
                  <p className="text-lg font-bold text-surface-50">{formatNumber(profile.stats.likes_given)}</p>
                  <p className="text-[10px] text-surface-500">Suka</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Content */}
      <section className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <div className="rounded-2xl border border-surface-800 bg-surface-900 p-6 text-center">
          <p className="text-sm text-surface-400">
            {isOwnProfile ? (
              <>Ini adalah profil kamu. <Link to="/profile" className="text-brand-400 hover:underline">Edit profil</Link></>
            ) : (
              <>Profil publik dari <span className="font-semibold text-surface-200">{profile.name}</span></>
            )}
          </p>
        </div>
      </section>
    </div>
  )
}

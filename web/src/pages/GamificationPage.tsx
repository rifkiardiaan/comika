import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertCircle,
  Award,
  BookOpen,
  CalendarClock,
  Flame,
  Gem,
  Heart,
  Loader2,
  LogIn,
  MessageSquare,
  Rocket,
  Sparkles,
  Star,
  Trophy,
  Users,
} from 'lucide-react'
import PageHeader from '../components/admin/PageHeader'
import { auth } from '../services/auth'
import { gamification } from '../services/gamification'
import { getApiErrorMessage } from '../utils/errors'
import type { GamificationProfile } from '../types'

export default function GamificationPage() {
  const [user] = useState(() => auth.getStoredUser())
  const [profile, setProfile] = useState<GamificationProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchProfile = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await gamification.profile()
      setProfile(res.data)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Gagal memuat profil gamification.'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (user) fetchProfile()
  }, [user, fetchProfile])

  if (!user) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-500/15 text-brand-300">
          <Trophy size={30} />
        </span>
        <h1 className="mt-5 font-display text-2xl font-bold text-surface-50">Masuk untuk Melihat Prestasi</h1>
        <p className="mt-2 text-sm text-surface-400">
          Kumpulkan XP, naik level, dan buka achievement dengan aktif di COMIKA.
        </p>
        <Link
          to="/login"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-pink-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-600/25 transition-all hover:brightness-110"
        >
          <LogIn size={16} /> Masuk Sekarang
        </Link>
      </div>
    )
  }

  const earnedCount = profile?.achievements.filter((a) => a.earned).length ?? 0
  const totalCount = profile?.achievements.length ?? 0

  return (
    <div className="mx-auto max-w-7xl animate-fade-in px-4 py-10 sm:px-6">
      <PageHeader
        title="Prestasi & Level"
        subtitle="XP, level, reading streak, dan achievement perjalanan membacamu"
      />

      {error && (
        <div className="mb-6 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-300">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {loading && !profile ? (
        <div className="flex items-center justify-center py-24 text-surface-500">
          <Loader2 size={20} className="mr-2 animate-spin" /> Memuat prestasi…
        </div>
      ) : profile ? (
        <div className="space-y-6">
          {/* Level + Streak cards */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Level card */}
            <div className="relative overflow-hidden rounded-2xl border border-surface-800 bg-gradient-to-br from-brand-950 via-surface-900 to-surface-900 p-6 lg:col-span-2">
              <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-brand-500/20 blur-3xl" />
              <div className="relative">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-brand-300">Level</p>
                    <div className="mt-1 flex items-baseline gap-3">
                      <span className="font-display text-5xl font-black text-surface-50">{profile.level}</span>
                      <span className="text-sm text-surface-400">
                        {profile.total_xp.toLocaleString('id-ID')} XP total
                      </span>
                    </div>
                  </div>
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-pink-500 shadow-lg shadow-brand-500/40">
                    <Gem size={26} className="text-white" />
                  </span>
                </div>

                {/* XP progress */}
                <div className="mt-6">
                  <div className="mb-1.5 flex items-center justify-between text-xs">
                    <span className="text-surface-400">
                      {profile.xp_into_level.toLocaleString('id-ID')} XP menuju level {profile.level + 1}
                    </span>
                    <span className="font-semibold text-brand-300">
                      {profile.xp_to_next_level.toLocaleString('id-ID')} XP lagi
                    </span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-surface-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-brand-500 to-pink-500 transition-all duration-700"
                      style={{ width: `${Math.min(100, Math.max(0, profile.level_progress * 100))}%` }}
                    />
                  </div>
                </div>

                <p className="mt-4 text-xs text-surface-500">
                  <Sparkles size={13} className="mr-1 inline text-brand-300" />
                  Baca episode, beri komentar, sukai, dan ikuti komik untuk mengumpulkan XP setiap hari.
                </p>
              </div>
            </div>

            {/* Streak card */}
            <div className="rounded-2xl border border-surface-800 bg-surface-900 p-6">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-orange-300">Reading Streak</p>
                <Flame size={18} className="text-orange-400" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-display text-5xl font-black text-surface-50">{profile.streak.current}</span>
                <span className="text-sm text-surface-400">hari berturut-turut</span>
              </div>
              <p className="mt-2 text-xs text-surface-500">
                Rekor terpanjang: <span className="font-semibold text-orange-300">{profile.streak.longest} hari</span>
              </p>
              <div className="mt-4 flex items-center gap-1.5 text-xs text-surface-400">
                <CalendarClock size={14} className="text-surface-500" />
                {profile.streak.last_read_at
                  ? `Terakhir baca: ${new Date(profile.streak.last_read_at).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}`
                  : 'Belum membaca — mulai hari ini untuk streak pertamamu!'}
              </div>
              <div className="mt-4 rounded-xl border border-orange-500/20 bg-orange-500/5 px-3 py-2 text-[11px] text-orange-200/80">
                Baca minimal satu episode tiap hari untuk menjaga streak-mu.
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {[
              { label: 'Episode Dibaca', value: profile.stats.episodes_read, icon: BookOpen, color: 'text-brand-300' },
              { label: 'Komik Selesai', value: profile.stats.comics_finished, icon: Rocket, color: 'text-pink-300' },
              { label: 'Komentar', value: profile.stats.comments, icon: MessageSquare, color: 'text-emerald-300' },
              { label: 'Suka Diberikan', value: profile.stats.likes, icon: Heart, color: 'text-red-300' },
              { label: 'Komik Diikuti', value: profile.stats.follows, icon: Users, color: 'text-sky-300' },
              { label: 'Achievement', value: earnedCount, icon: Award, color: 'text-amber-300' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div
                key={label}
                className="rounded-2xl border border-surface-800 bg-surface-900 p-4 transition-colors hover:border-surface-700"
              >
                <Icon size={16} className={color} />
                <p className="mt-2 font-display text-2xl font-bold text-surface-50">{value.toLocaleString('id-ID')}</p>
                <p className="text-[11px] text-surface-500">{label}</p>
              </div>
            ))}
          </div>

          {/* Achievements */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-display text-lg font-bold text-surface-50">
                <Trophy size={18} className="text-amber-300" />
                Achievement
              </h2>
              <span className="text-xs text-surface-500">
                {earnedCount} dari {totalCount} terkumpul
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {profile.achievements.map((achievement) => (
                <div
                  key={achievement.code}
                  className={`relative rounded-2xl border p-5 transition-all ${
                    achievement.earned
                      ? 'border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-surface-900 to-surface-900 hover:border-amber-500/50'
                      : 'border-surface-800 bg-surface-900/60 opacity-60 hover:border-surface-700 hover:opacity-80'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <span
                      className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                        achievement.earned
                          ? 'bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30'
                          : 'bg-surface-800 text-surface-600'
                      }`}
                    >
                      <Trophy size={20} />
                    </span>
                    <span className="flex items-center gap-1 rounded-full bg-surface-800 px-2 py-0.5 text-[10px] font-semibold text-amber-300">
                      <Star size={10} fill="currentColor" /> +{achievement.xp_reward} XP
                    </span>
                  </div>

                  <h3 className={`mt-3 text-sm font-bold ${achievement.earned ? 'text-surface-50' : 'text-surface-300'}`}>
                    {achievement.name}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-surface-500">{achievement.description}</p>

                  <p className="mt-3 text-[11px] font-medium text-surface-600">
                    {achievement.earned
                      ? `Terbuka ${new Date(achievement.earned_at!).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}`
                      : 'Belum terbuka'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

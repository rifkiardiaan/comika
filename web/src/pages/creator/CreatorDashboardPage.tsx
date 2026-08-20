import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertCircle,
  ArrowRight,
  Banknote,
  BookOpen,
  Clock,
  Eye,
  LayoutDashboard,
  Loader2,
  Lock,
  MessageSquare,
  Sparkles,
  Star,
  Users,
} from 'lucide-react'
import Avatar from '../../components/Avatar'
import PageHeader from '../../components/admin/PageHeader'
import { StatusBadge } from '../../components/admin/Badge'
import { auth } from '../../services/auth'
import { creator } from '../../services/creator'
import { getApiErrorMessage } from '../../utils/errors'
import { formatDate, formatNumber } from '../../utils/format'
import type { CreatorDashboard } from '../../types'

export default function CreatorDashboardPage() {
  const [user] = useState(() => auth.getStoredUser())
  const [data, setData] = useState<CreatorDashboard | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setData(await creator.dashboard())
    } catch (err) {
      setError(getApiErrorMessage(err, 'Gagal memuat dashboard creator.'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (user?.role === 'creator') fetchData()
  }, [user, fetchData])

  if (!user) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-500/15 text-brand-300">
          <LayoutDashboard size={30} />
        </span>
        <h1 className="mt-5 font-display text-2xl font-bold text-surface-50">Masuk untuk Mengelola Karya</h1>
        <p className="mt-2 text-sm text-surface-400">
          Masuk ke akun creator COMIKA untuk memantau komik, episode, dan analitik Anda.
        </p>
        <Link
          to="/login"
          className="mt-6 rounded-xl bg-gradient-to-r from-brand-600 to-pink-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-600/25 transition-all hover:brightness-110"
        >
          Masuk Sekarang
        </Link>
      </div>
    )
  }

  if (user.role !== 'creator') {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-300">
          <Lock size={30} />
        </span>
        <h1 className="mt-5 font-display text-2xl font-bold text-surface-50">Khusus Creator</h1>
        <p className="mt-2 text-sm text-surface-400">
          Dashboard creator hanya tersedia untuk akun dengan peran creator.
        </p>
        <Link
          to="/"
          className="mt-6 rounded-xl bg-gradient-to-r from-brand-600 to-pink-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-600/25 transition-all hover:brightness-110"
        >
          Kembali ke Beranda
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl animate-fade-in px-4 py-10 sm:px-6">
      <PageHeader
        title="Dashboard Creator"
        subtitle="Ringkasan performa komik dan episode Anda"
        actions={
          <Link
            to="/creator/comics"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-pink-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-600/25 transition-all hover:brightness-110"
          >
            <BookOpen size={16} /> Kelola Komik
          </Link>
        }
      />

      {error && (
        <div className="mb-6 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-300">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* ====== Stat cards ====== */}
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={<BookOpen size={18} className="text-brand-300" />} label="Komik" value={loading ? '…' : String(data?.comics_count ?? 0)} sub={`${data?.published_comics_count ?? 0} terbit`} />
        <StatCard icon={<Clock size={18} className="text-sky-300" />} label="Episode" value={loading ? '…' : String(data?.episodes_count ?? 0)} sub={`${data?.published_episodes_count ?? 0} terbit`} />
        <StatCard icon={<Eye size={18} className="text-emerald-300" />} label="Total Dibaca" value={loading ? '…' : formatNumber(data?.total_views ?? 0)} sub={`${formatNumber(data?.total_likes ?? 0)} suka`} />
        <StatCard icon={<Star size={18} className="text-amber-300" />} label="Rating Rata-rata" value={loading ? '…' : (data?.rating_avg ?? 0).toFixed(1)} sub={`${formatNumber(data?.total_followers ?? 0)} pengikut`} />
      </section>

      {/* ====== Community + earnings row ====== */}
      <section className="mt-4 grid gap-4 sm:grid-cols-3">
        <StatCard icon={<Users size={18} className="text-pink-300" />} label="Pengikut" value={loading ? '…' : formatNumber(data?.total_followers ?? 0)} sub="lintas komik" />
        <StatCard icon={<MessageSquare size={18} className="text-teal-300" />} label="Komentar" value={loading ? '…' : formatNumber(data?.total_comments ?? 0)} sub="dari pembaca" />
        <Link
          to="/creator/earnings"
          className="group relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-900/40 via-surface-900 to-surface-900 p-5 transition-all hover:border-emerald-500/60"
        >
          <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-emerald-500/15 blur-2xl" />
          <p className="flex items-center gap-1.5 text-xs font-medium text-emerald-200">
            <Banknote size={13} /> Total Pendapatan
          </p>
          <p className="mt-2 font-display text-2xl font-bold text-surface-50">
            {loading ? '…' : `Rp${(data?.earnings?.total ?? 0).toLocaleString('id-ID')}`}
          </p>
          <p className="mt-1 text-[11px] text-surface-400">
            <span className="font-semibold text-amber-300">{(data?.earnings?.pending ?? 0).toLocaleString('id-ID')}</span> menunggu ·{' '}
            <span className="font-semibold text-emerald-300">{(data?.earnings?.paid ?? 0).toLocaleString('id-ID')}</span> dibayar
          </p>
          <p className="mt-3 flex items-center gap-1 text-xs font-medium text-emerald-300 transition-transform group-hover:translate-x-0.5">
            Lihat detail <ArrowRight size={12} />
          </p>
        </Link>
      </section>

      {/* ====== Recent episodes + comments ====== */}
      <section className="mt-10 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-surface-800 bg-surface-900">
          <div className="flex items-center justify-between border-b border-surface-800 px-5 py-4">
            <h2 className="flex items-center gap-2 font-display text-base font-bold text-surface-50">
              <Clock size={16} className="text-sky-300" /> Episode Terbaru
            </h2>
            <Link to="/creator/comics" className="text-xs font-medium text-brand-300 hover:text-brand-200">
              Lihat semua
            </Link>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-14 text-surface-500">
              <Loader2 size={18} className="mr-2 animate-spin" /> Memuat…
            </div>
          ) : (data?.recent_episodes?.length ?? 0) === 0 ? (
            <p className="px-5 py-12 text-center text-sm text-surface-500">Belum ada episode. Buat episode pertama Anda!</p>
          ) : (
            <ul className="divide-y divide-surface-800/60">
              {data!.recent_episodes.slice(0, 5).map((ep) => (
                <li key={ep.id} className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-surface-800/30">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-800 font-display text-sm font-bold text-surface-300">
                    {ep.number}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-surface-100">{ep.title}</p>
                    <p className="truncate text-xs text-surface-500">{ep.comic_title}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <StatusBadge status={ep.status} />
                    <span className="flex items-center gap-1 text-xs text-surface-400">
                      <Eye size={12} /> {formatNumber(ep.view_count)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border border-surface-800 bg-surface-900">
          <div className="border-b border-surface-800 px-5 py-4">
            <h2 className="flex items-center gap-2 font-display text-base font-bold text-surface-50">
              <MessageSquare size={16} className="text-teal-300" /> Komentar Terbaru
            </h2>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-14 text-surface-500">
              <Loader2 size={18} className="mr-2 animate-spin" /> Memuat…
            </div>
          ) : (data?.recent_comments?.length ?? 0) === 0 ? (
            <p className="px-5 py-12 text-center text-sm text-surface-500">Belum ada komentar dari pembaca.</p>
          ) : (
            <ul className="divide-y divide-surface-800/60">
              {data!.recent_comments.slice(0, 5).map((c) => (
                <li key={c.id} className="flex items-start gap-3 px-5 py-3.5">
                  <Avatar name={c.user.name} avatarUrl={c.user.avatar_url} size={36} className="rounded-full" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-surface-200">
                      <span className="font-semibold text-surface-100">{c.user.name}</span>{' '}
                      <span className="text-surface-500">pada {c.comic_title}</span>
                    </p>
                    <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-surface-400">{c.content}</p>
                    <p className="mt-1 text-[11px] text-surface-500">{formatDate(c.created_at)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* ====== Quick actions ====== */}
      <section className="mt-10 grid gap-4 sm:grid-cols-3">
        <QuickAction to="/creator/comics" icon={<BookOpen size={18} />} title="Kelola Komik" desc="Buat, edit, dan atur komik Anda" />
        <QuickAction to="/creator/ai" icon={<Sparkles size={18} />} title="Asisten AI" desc="Judul, sinopsis, karakter & outline dengan bantuan AI" />
        <QuickAction to="/creator/earnings" icon={<Banknote size={18} />} title="Penghasilan" desc="Lihat earning & ajukan penarikan" />
      </section>
    </div>
  )
}

function StatCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub: string }) {
  return (
    <div className="rounded-2xl border border-surface-800 bg-surface-900 p-5">
      <p className="flex items-center gap-1.5 text-xs font-medium text-surface-400">
        {icon} {label}
      </p>
      <p className="mt-2 font-display text-2xl font-bold text-surface-50">{value}</p>
      <p className="mt-1 text-[11px] text-surface-500">{sub}</p>
    </div>
  )
}

function QuickAction({ to, icon, title, desc }: { to: string; icon: React.ReactNode; title: string; desc: string }) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-4 rounded-2xl border border-surface-800 bg-surface-900 p-5 transition-all hover:border-brand-500/50 hover:bg-surface-800/60"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-500/15 text-brand-300 transition-colors group-hover:bg-brand-500/25">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-surface-100">{title}</p>
        <p className="truncate text-xs text-surface-400">{desc}</p>
      </div>
      <ArrowRight size={15} className="ml-auto shrink-0 text-surface-500 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-300" />
    </Link>
  )
}

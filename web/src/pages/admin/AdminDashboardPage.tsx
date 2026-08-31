import { useEffect, useState, type ElementType } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertCircle,
  BookOpen,
  Eye,
  Flag,
  Heart,
  Loader2,
  Mail,
  MessageSquare,
  TrendingUp,
  UserPlus,
  Users,
} from 'lucide-react'
import Avatar from '../../components/Avatar'
import PageHeader from '../../components/admin/PageHeader'
import { RoleBadge, StatusBadge } from '../../components/admin/Badge'
import EmptyState from '../../components/admin/EmptyState'
import { admin, getApiErrorMessage } from '../../services/admin'
import { listApplications } from '../../services/creatorApplication'
import type { DashboardStats } from '../../types'
import type { CreatorApplication } from '../../services/creatorApplication'
import { coverEmoji, coverKeyOf, coverStyle } from '../../data/mock'
import { formatDate, formatNumber } from '../../utils/format'

function StatCard({
  label,
  value,
  icon: Icon,
  tone,
  sub,
}: {
  label: string
  value: string | number
  icon: ElementType
  tone: string
  sub?: string
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-surface-800 bg-surface-900 p-5 transition-all hover:-translate-y-0.5 hover:border-brand-500/50">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-surface-500">{label}</p>
          <p className="mt-2 font-display text-3xl font-bold text-surface-50">{value}</p>
          {sub && <p className="mt-1 text-xs text-surface-400">{sub}</p>}
        </div>
        <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${tone}`}>
          <Icon size={20} />
        </span>
      </div>
      <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-brand-500/10 opacity-0 blur-2xl transition-opacity group-hover:opacity-100" />
    </div>
  )
}

const recentListCard = 'overflow-hidden rounded-2xl border border-surface-800 bg-surface-900'

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [error, setError] = useState('')
  const [creatorApps, setCreatorApps] = useState<CreatorApplication[]>([])

  useEffect(() => {
    let alive = true
    admin
      .dashboard()
      .then((d) => alive && setStats(d))
      .catch((err) => alive && setError(getApiErrorMessage(err, 'Gagal memuat statistik dashboard.')))
    return () => {
      alive = false
    }
  }, [])

  useEffect(() => {
    let alive = true
    listApplications({ status: 'pending', per_page: 10 })
      .then((res) => alive && setCreatorApps(res.data))
      .catch(() => {})
    return () => { alive = false }
  }, [])

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-red-500/30 bg-red-500/5 px-6 py-20 text-center">
        <AlertCircle size={32} className="text-red-400" />
        <p className="mt-3 text-sm font-medium text-red-300">{error}</p>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-56 animate-pulse rounded-lg bg-surface-800" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl bg-surface-900" />
          ))}
        </div>
        <div className="flex items-center justify-center py-16 text-surface-500">
          <Loader2 size={20} className="mr-2 animate-spin" /> Memuat data platform…
        </div>
      </div>
    )
  }

  const { users, comics, episodes, comments, reports, engagement, revenue, pending_verification } = stats
  const pendingCreatorApps = creatorApps // already filtered by API to 'pending'

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Dashboard"
        subtitle="Ringkasan kondisi platform COMIKA saat ini"
      />

      {/* Pending creator applications alert */}
      {pendingCreatorApps.length > 0 && (
        <Link
          to="/admin/creator-applications"
          className="mb-4 flex items-center gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/5 px-5 py-4 transition-colors hover:border-amber-500/50 hover:bg-amber-500/10"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/15">
            <UserPlus size={20} className="text-amber-300" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-amber-300">
              {pendingCreatorApps.length} Pengajuan Creator Menunggu Persetujuan
            </p>
            <p className="mt-0.5 text-xs text-surface-400">
              {pendingCreatorApps.map((a) => a.user?.name ?? '—').slice(0, 3).join(', ')}
              {pendingCreatorApps.length > 3 && ` +${pendingCreatorApps.length - 3} lainnya`}
            </p>
          </div>
          <span className="rounded-full bg-amber-500/20 px-3 py-1 text-xs font-bold text-amber-300">
            Tinjau →
          </span>
        </Link>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Pengguna"
          value={users.total.toLocaleString('id-ID')}
          icon={Users}
          tone="bg-brand-500/15 text-brand-300"
          sub={`${users.creators} creator · ${users.admins} admin`}
        />
        <StatCard
          label="Komik"
          value={comics.total.toLocaleString('id-ID')}
          icon={BookOpen}
          tone="bg-sky-500/15 text-sky-300"
          sub={`${comics.published} terbit · ${comics.draft} draft`}
        />
        <StatCard
          label="Episode"
          value={episodes.total.toLocaleString('id-ID')}
          icon={TrendingUp}
          tone="bg-pink-500/15 text-pink-300"
          sub={`${episodes.published} telah terbit`}
        />
        <StatCard
          label="Laporan Masuk"
          value={reports.pending.toLocaleString('id-ID')}
          icon={Flag}
          tone="bg-amber-500/15 text-amber-300"
          sub="menunggu moderasi"
        />
      </div>

      {/* Revenue + pending verification */}
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Pendapatan Platform"
          value={`Rp ${revenue.total.toLocaleString('id-ID')}`}
          icon={TrendingUp}
          tone="bg-emerald-500/15 text-emerald-300"
          sub={`${revenue.total_unlocks} episode terunlock`}
        />
        <StatCard
          label="Pendapatan Bulan Ini"
          value={`Rp ${revenue.monthly.toLocaleString('id-ID')}`}
          icon={TrendingUp}
          tone="bg-sky-500/15 text-sky-300"
          sub="share 40% platform"
        />
        <StatCard
          label="Komik Menunggu Verifikasi"
          value={pending_verification.toLocaleString('id-ID')}
          icon={BookOpen}
          tone="bg-amber-500/15 text-amber-300"
          sub="perlu review admin"
        />
      </div>

      {/* Engagement + comments */}
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total Views" value={formatNumber(engagement.total_views)} icon={Eye} tone="bg-emerald-500/15 text-emerald-300" />
        <StatCard label="Total Likes" value={formatNumber(engagement.total_likes)} icon={Heart} tone="bg-rose-500/15 text-rose-300" />
        <StatCard
          label="Komentar Aktif"
          value={comments.toLocaleString('id-ID')}
          icon={MessageSquare}
          tone="bg-violet-500/15 text-violet-300"
          sub={`${users.new_today} user baru hari ini`}
        />
      </div>

      {/* Recent lists */}
      <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* Pending creator applications */}
        <section className={recentListCard}>
          <div className="flex items-center justify-between border-b border-surface-800 px-5 py-4">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-surface-200">
              <UserPlus size={15} className="text-amber-400" /> Pengajuan Creator
            </h2>
            <Link to="/admin/creator-applications" className="text-xs font-medium text-brand-300 hover:text-brand-200">
              Lihat semua
            </Link>
          </div>
          {pendingCreatorApps.length === 0 ? (
            <div className="p-5"><EmptyState message="Tidak ada pengajuan baru." /></div>
          ) : (
            <ul className="divide-y divide-surface-800/60">
              {pendingCreatorApps.slice(0, 5).map((app) => (
                <li key={app.id} className="flex items-center gap-3 px-5 py-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-300">
                    <UserPlus size={16} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-surface-100">{app.user?.name ?? '—'}</p>
                    <p className="flex items-center gap-1 truncate text-xs text-surface-500">
                      <Mail size={10} /> {app.user?.email ?? '—'} · @{app.user?.username ?? '—'}
                    </p>
                  </div>
                  <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                    Baru
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Recent users */}
        <section className={recentListCard}>
          <div className="flex items-center justify-between border-b border-surface-800 px-5 py-4">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-surface-200">
              <Users size={15} className="text-brand-400" /> User Terbaru
            </h2>
            <Link to="/admin/users" className="text-xs font-medium text-brand-300 hover:text-brand-200">
              Lihat semua
            </Link>
          </div>
          {stats.recent_users.length === 0 ? (
            <div className="p-5"><EmptyState message="Belum ada user." /></div>
          ) : (
            <ul className="divide-y divide-surface-800/60">
              {stats.recent_users.map((u) => (
                <li key={u.id} className="flex items-center gap-3 px-5 py-3">
                  <Avatar name={u.name} avatarUrl={u.avatar_url} size={36} className="rounded-full" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-surface-100">{u.name}</p>
                    <p className="truncate text-xs text-surface-500">@{u.username}</p>
                  </div>
                  <RoleBadge role={u.role} />
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Recent comics */}
        <section className={recentListCard}>
          <div className="flex items-center justify-between border-b border-surface-800 px-5 py-4">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-surface-200">
              <BookOpen size={15} className="text-sky-400" /> Komik Terbaru
            </h2>
            <Link to="/admin/comics" className="text-xs font-medium text-brand-300 hover:text-brand-200">
              Lihat semua
            </Link>
          </div>
          {stats.recent_comics.length === 0 ? (
            <div className="p-5"><EmptyState message="Belum ada komik." /></div>
          ) : (
            <ul className="divide-y divide-surface-800/60">
              {stats.recent_comics.map((c) => (
                <li key={c.id} className="flex items-center gap-3 px-5 py-3">
                  <span
                    className="flex h-10 w-8 shrink-0 items-center justify-center rounded-lg text-sm"
                    style={{ background: coverStyle(coverKeyOf(c.id)) }}
                  >
                    {coverEmoji(coverKeyOf(c.id))}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-surface-100">{c.title}</p>
                    <p className="truncate text-xs text-surface-500">
                      {c.creator_name ?? '—'} · {formatDate(c.created_at)}
                    </p>
                  </div>
                  <StatusBadge status={c.status} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}

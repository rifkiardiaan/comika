import { useCallback, useEffect, useState } from 'react'
import { AlertCircle, BookOpen, Coins, Eye, Loader2, Search, TrendingUp, Users } from 'lucide-react'
import PageHeader from '../../components/admin/PageHeader'
import Pagination from '../../components/admin/Pagination'
import EmptyState from '../../components/admin/EmptyState'
import Avatar from '../../components/Avatar'
import { admin, getApiErrorMessage } from '../../services/admin'
import { coverEmoji, coverKeyOf, coverStyle } from '../../data/mock'
import { formatNumber } from '../../utils/format'

type AccessType = 'free' | 'paid' | 'vvip' | 'premium_locked'

interface ReadingEntry {
  id: number
  user: { id: number; name: string; username: string; avatar_url: string | null; is_vvip: boolean }
  comic: { id: number; title: string; cover_url: string | null }
  episode: { id: number; number: number; title: string; is_premium: boolean; price_coin: number }
  access_type: AccessType
  coins_spent: number
  progress: number
  is_completed: boolean
  last_page: number
  updated_at: string
}

interface ReadingStats {
  total_reads: number
  unique_readers: number
  unique_comics_read: number
  free_reads: number
  paid_reads: number
  vvip_reads: number
  total_coins_spent: number
  top_comics: Array<{ comic_id: number; read_count: number; comic: { id: number; title: string; cover_url: string | null } }>
  top_readers: Array<{ user_id: number; read_count: number; user: { id: number; name: string; username: string; avatar_url: string | null } }>
}

const typeFilters: Array<{ value: string; label: string; icon: string }> = [
  { value: '', label: 'Semua', icon: '📚' },
  { value: 'free', label: 'Gratis', icon: '🆓' },
  { value: 'paid', label: 'Berbayar (Coin)', icon: '💰' },
  { value: 'vvip', label: 'VVIP', icon: '💎' },
]

export default function AdminReadingReportPage() {
  const [entries, setEntries] = useState<ReadingEntry[]>([])
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 })
  const [stats, setStats] = useState<ReadingStats | null>(null)
  const [q, setQ] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [statsLoading, setStatsLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchStats = useCallback(async () => {
    setStatsLoading(true)
    try {
      const data = await admin.readingStats()
      setStats(data)
    } catch {
      // stats opsional
    } finally {
      setStatsLoading(false)
    }
  }, [])

  const fetchEntries = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params: Record<string, unknown> = { page }
      if (q) params.q = q
      if (typeFilter) params.type = typeFilter
      const res = await admin.readingReport(params)
      setEntries(res.data as unknown as ReadingEntry[])
      setMeta(res.meta)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Gagal memuat laporan pembaca.'))
    } finally {
      setLoading(false)
    }
  }, [q, typeFilter, page])

  useEffect(() => { fetchStats() }, [fetchStats])
  useEffect(() => { fetchEntries() }, [fetchEntries])

  const accessBadge = (entry: ReadingEntry) => {
    switch (entry.access_type) {
      case 'free':
        return <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-300">🆓 Gratis</span>
      case 'paid':
        return <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-300">💰 {entry.coins_spent} koin</span>
      case 'vvip':
        return <span className="rounded-full bg-purple-500/15 px-2 py-0.5 text-[10px] font-bold text-purple-300">💎 VVIP</span>
      case 'premium_locked':
        return <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-[10px] font-bold text-red-300">🔒 Terkunci</span>
      default:
        return null
    }
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Laporan Pembaca"
        subtitle="Semua aktivitas baca user — gratis, berbayar (coin), dan VVIP"
      />

      {/* Stats cards */}
      {stats && (
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard icon={<Users size={16} className="text-brand-300" />} label="Total Pembaca" value={formatNumber(stats.unique_readers)} />
          <StatCard icon={<BookOpen size={16} className="text-sky-300" />} label="Total Bacaan" value={formatNumber(stats.total_reads)} />
          <StatCard icon={<Eye size={16} className="text-emerald-300" />} label="Komik Dibaca" value={formatNumber(stats.unique_comics_read)} />
          <StatCard icon={<Coins size={16} className="text-amber-300" />} label="Total Koin Terpakai" value={formatNumber(stats.total_coins_spent)} />
        </div>
      )}

      {/* Breakdown */}
      {stats && (
        <div className="mb-6 grid grid-cols-3 gap-3">
          <BreakdownCard label="🆓 Gratis" value={stats.free_reads} total={stats.total_reads} color="emerald" />
          <BreakdownCard label="💰 Berbayar" value={stats.paid_reads} total={stats.total_reads} color="amber" />
          <BreakdownCard label="💎 VVIP" value={stats.vvip_reads} total={stats.total_reads} color="purple" />
        </div>
      )}

      {/* Top readers & top comics */}
      {stats && (stats.top_readers.length > 0 || stats.top_comics.length > 0) && (
        <div className="mb-6 grid gap-4 sm:grid-cols-2">
          {stats.top_readers.length > 0 && (
            <div className="rounded-2xl border border-surface-800 bg-surface-900 p-4">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-surface-200">
                <TrendingUp size={14} className="text-brand-400" /> Pembaca Paling Aktif
              </h3>
              <div className="space-y-2">
                {stats.top_readers.map((r, i) => (
                  <div key={r.user_id} className="flex items-center gap-3 rounded-lg bg-surface-800/40 px-3 py-2">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-500/20 text-[10px] font-bold text-brand-300">
                      {i + 1}
                    </span>
                    <Avatar name={r.user.name} avatarUrl={r.user.avatar_url} size={28} className="rounded-full" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium text-surface-100">{r.user.name}</p>
                      <p className="truncate text-[10px] text-surface-500">@{r.user.username}</p>
                    </div>
                    <span className="text-xs font-bold text-brand-300">{r.read_count} baca</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {stats.top_comics.length > 0 && (
            <div className="rounded-2xl border border-surface-800 bg-surface-900 p-4">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-surface-200">
                <BookOpen size={14} className="text-sky-400" /> Komik Paling Dibaca
              </h3>
              <div className="space-y-2">
                {stats.top_comics.map((c, i) => (
                  <div key={c.comic_id} className="flex items-center gap-3 rounded-lg bg-surface-800/40 px-3 py-2">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-500/20 text-[10px] font-bold text-sky-300">
                      {i + 1}
                    </span>
                    <span
                      className="flex h-8 w-6 shrink-0 items-center justify-center rounded-md text-xs"
                      style={{ background: c.comic?.cover_url ? undefined : coverStyle(coverKeyOf(c.comic_id)) }}
                    >
                      {c.comic?.cover_url ? null : coverEmoji(coverKeyOf(c.comic_id))}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium text-surface-100">{c.comic?.title ?? '—'}</p>
                    </div>
                    <span className="text-xs font-bold text-sky-300">{c.read_count} baca</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filter */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <form
          onSubmit={(e) => { e.preventDefault(); setPage(1) }}
          className="relative flex-1"
        >
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-surface-500" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari nama user atau judul komik…"
            className="w-full rounded-xl border border-surface-800 bg-surface-900 py-2.5 pl-9 pr-4 text-sm text-surface-100 placeholder:text-surface-500 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
          />
        </form>
        <div className="flex gap-1 overflow-x-auto rounded-xl border border-surface-800 bg-surface-900 p-1">
          {typeFilters.map((f) => (
            <button
              key={f.value}
              onClick={() => { setTypeFilter(f.value); setPage(1) }}
              className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                typeFilter === f.value
                  ? 'bg-brand-500/20 text-brand-300'
                  : 'text-surface-400 hover:text-surface-200'
              }`}
            >
              {f.icon} {f.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-300">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* Reading entries table */}
      <div className="overflow-hidden rounded-2xl border border-surface-800 bg-surface-900">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-surface-500">
            <Loader2 size={20} className="mr-2 animate-spin" /> Memuat data…
          </div>
        ) : entries.length === 0 ? (
          <div className="p-6">
            <EmptyState message="Belum ada aktivitas baca." />
          </div>
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[800px] text-left text-sm">
                <thead>
                  <tr className="border-b border-surface-800 text-xs uppercase tracking-wide text-surface-500">
                    <th className="px-5 py-3 font-medium">User</th>
                    <th className="px-5 py-3 font-medium">Komik</th>
                    <th className="px-5 py-3 font-medium">Episode</th>
                    <th className="px-5 py-3 font-medium">Akses</th>
                    <th className="px-5 py-3 text-center font-medium">Progress</th>
                    <th className="px-5 py-3 text-right font-medium">Terakhir Baca</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-800/60">
                  {entries.map((e) => (
                    <tr key={e.id} className="transition-colors hover:bg-surface-800/30">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          <Avatar name={e.user.name} avatarUrl={e.user.avatar_url} size={32} className="rounded-full" />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-surface-100">{e.user.name}</p>
                            <p className="truncate text-[10px] text-surface-500">@{e.user.username}</p>
                          </div>
                          {e.user.is_vvip && <span className="shrink-0 rounded-full bg-purple-500/15 px-1.5 py-0.5 text-[9px] font-bold text-purple-300">VVIP</span>}
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <span
                            className="flex h-8 w-6 shrink-0 items-center justify-center rounded-md text-[10px]"
                            style={{ background: e.comic.cover_url ? undefined : coverStyle(coverKeyOf(e.comic.id)) }}
                          >
                            {e.comic.cover_url ? null : coverEmoji(coverKeyOf(e.comic.id))}
                          </span>
                          <span className="truncate text-sm text-surface-200">{e.comic.title}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-sm text-surface-300">
                          Eps {e.episode.number}: {e.episode.title}
                        </span>
                      </td>
                      <td className="px-5 py-3">{accessBadge(e)}</td>
                      <td className="px-5 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-surface-800">
                            <div
                              className={`h-full rounded-full ${e.is_completed ? 'bg-emerald-400' : 'bg-brand-400'}`}
                              style={{ width: `${Math.min(e.progress, 100)}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-surface-500">{Math.round(e.progress)}%</span>
                          {e.is_completed && <span className="text-[10px] text-emerald-400">✓</span>}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-right text-xs text-surface-500">
                        {new Date(e.updated_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <div className="divide-y divide-surface-800/60 md:hidden">
              {entries.map((e) => (
                <div key={e.id} className="p-4">
                  <div className="mb-2 flex items-center gap-2.5">
                    <Avatar name={e.user.name} avatarUrl={e.user.avatar_url} size={32} className="rounded-full" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-surface-100">{e.user.name}</p>
                      <p className="truncate text-[10px] text-surface-500">@{e.user.username}</p>
                    </div>
                    {accessBadge(e)}
                  </div>
                  <div className="ml-10">
                    <p className="text-xs text-surface-300">
                      <span className="font-medium text-surface-200">{e.comic.title}</span>
                      {' '}· Eps {e.episode.number}: {e.episode.title}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-800">
                        <div
                          className={`h-full rounded-full ${e.is_completed ? 'bg-emerald-400' : 'bg-brand-400'}`}
                          style={{ width: `${Math.min(e.progress, 100)}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-surface-500">{Math.round(e.progress)}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {!loading && entries.length > 0 && <Pagination meta={meta} onPageChange={setPage} />}
    </div>
  )
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-surface-800 bg-surface-900 p-4">
      <p className="flex items-center gap-1.5 text-xs font-medium text-surface-400">{icon} {label}</p>
      <p className="mt-2 font-display text-xl font-bold text-surface-50">{value}</p>
    </div>
  )
}

function BreakdownCard({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0
  const barColor = color === 'emerald' ? 'bg-emerald-400' : color === 'amber' ? 'bg-amber-400' : 'bg-purple-400'
  return (
    <div className="rounded-2xl border border-surface-800 bg-surface-900 p-4">
      <p className="text-xs font-medium text-surface-400">{label}</p>
      <p className="mt-1 font-display text-lg font-bold text-surface-50">{formatNumber(value)}</p>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-800">
        <div className={`h-full rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-1 text-[10px] text-surface-500">{pct}% dari total</p>
    </div>
  )
}

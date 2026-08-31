import { useCallback, useEffect, useState } from 'react'
import {
  AlertCircle,
  CheckCircle2,
  Crown,
  Gem,
  Loader2,
  Search,
  ShieldCheck,
  Sparkles,
  X,
  XCircle,
  ArrowUp,
} from 'lucide-react'
import Avatar from '../../components/Avatar'
import PageHeader from '../../components/admin/PageHeader'
import { Badge } from '../../components/admin/Badge'
import Pagination from '../../components/admin/Pagination'
import EmptyState from '../../components/admin/EmptyState'
import ConfirmDialog from '../../components/admin/ConfirmDialog'
import { admin, getApiErrorMessage } from '../../services/admin'
import { formatDate } from '../../utils/format'
import type { AdminUser } from '../../types'

const tierOptions = [
  { value: '', label: 'Semua Tier' },
  { value: 'vvip', label: 'VVIP' },
  { value: 'premium', label: 'Premium' },
  { value: 'free', label: 'Free' },
] as const

const grantDayOptions = [
  { value: 7, label: '7 hari (1 minggu)' },
  { value: 30, label: '30 hari (1 bulan)' },
  { value: 90, label: '90 hari (3 bulan)' },
  { value: 180, label: '180 hari (6 bulan)' },
  { value: 365, label: '365 hari (1 tahun)' },
]

export default function AdminVvipPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 })
  const [stats, setStats] = useState({ vvip_active: 0, premium_active: 0, total: 0 })
  const [q, setQ] = useState('')
  const [tier, setTier] = useState<'premium' | 'vvip' | 'free' | ''>('')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  // Grant VVIP modal
  const [grantTarget, setGrantTarget] = useState<AdminUser | null>(null)
  const [grantDays, setGrantDays] = useState(30)
  const [granting, setGranting] = useState(false)

  // Grant Premium modal
  const [grantPremiumTarget, setGrantPremiumTarget] = useState<AdminUser | null>(null)
  const [grantPremiumDays, setGrantPremiumDays] = useState(30)
  const [grantingPremium, setGrantingPremium] = useState(false)

  // Upgrade to VVIP modal
  const [upgradeTarget, setUpgradeTarget] = useState<AdminUser | null>(null)
  const [upgradeDays, setUpgradeDays] = useState(30)
  const [upgrading, setUpgrading] = useState(false)

  // Revoke confirmation
  const [revokeTarget, setRevokeTarget] = useState<AdminUser | null>(null)
  const [revokeType, setRevokeType] = useState<'vvip' | 'premium'>('vvip')
  const [revoking, setRevoking] = useState(false)

  const fetchStats = useCallback(async () => {
    try {
      const data = await admin.subscriberStats()
      setStats(data)
    } catch {
      // ignore
    }
  }, [])

  const fetchSubscribers = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await admin.subscribers({ q: q || undefined, tier: tier || undefined, page })
      setUsers(res.data)
      setMeta(res.meta)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Gagal memuat daftar subscriber.'))
    } finally {
      setLoading(false)
    }
  }, [q, tier, page])

  useEffect(() => {
    fetchStats()
    fetchSubscribers()
  }, [fetchStats, fetchSubscribers])

  const handleGrantVvip = async () => {
    if (!grantTarget) return
    setGranting(true)
    setNotice('')
    try {
      const updated = await admin.grantVvip(grantTarget.id, grantDays)
      setUsers((list) => list.map((u) => (u.id === updated.id ? updated : u)))
      setNotice(`VVIP berhasil diberikan ke ${grantTarget.name} selama ${grantDays} hari.`)
      setGrantTarget(null)
      await fetchStats()
    } catch (err) {
      setError(getApiErrorMessage(err, 'Gagal memberikan VVIP.'))
      setGrantTarget(null)
    } finally {
      setGranting(false)
    }
  }

  const handleGrantPremium = async () => {
    if (!grantPremiumTarget) return
    setGrantingPremium(true)
    setNotice('')
    try {
      const updated = await admin.grantPremium(grantPremiumTarget.id, grantPremiumDays)
      setUsers((list) => list.map((u) => (u.id === updated.id ? updated : u)))
      setNotice(`Premium berhasil diberikan ke ${grantPremiumTarget.name} selama ${grantPremiumDays} hari.`)
      setGrantPremiumTarget(null)
      await fetchStats()
    } catch (err) {
      setError(getApiErrorMessage(err, 'Gagal memberikan Premium.'))
      setGrantPremiumTarget(null)
    } finally {
      setGrantingPremium(false)
    }
  }

  const handleUpgradeToVvip = async () => {
    if (!upgradeTarget) return
    setUpgrading(true)
    setNotice('')
    try {
      const updated = await admin.upgradeToVvip(upgradeTarget.id, upgradeDays)
      setUsers((list) => list.map((u) => (u.id === updated.id ? updated : u)))
      setNotice(`${upgradeTarget.name} berhasil di-upgrade ke VVIP selama ${upgradeDays} hari.`)
      setUpgradeTarget(null)
      await fetchStats()
    } catch (err) {
      setError(getApiErrorMessage(err, 'Gagal upgrade ke VVIP.'))
      setUpgradeTarget(null)
    } finally {
      setUpgrading(false)
    }
  }

  const handleRevoke = async () => {
    if (!revokeTarget) return
    setRevoking(true)
    setNotice('')
    try {
      let updated: AdminUser
      if (revokeType === 'vvip') {
        updated = await admin.revokeVvip(revokeTarget.id)
        setNotice(`VVIP berhasil dicabut dari ${revokeTarget.name}.`)
      } else {
        updated = await admin.revokePremium(revokeTarget.id)
        setNotice(`Premium berhasil dicabut dari ${revokeTarget.name}.`)
      }
      setUsers((list) => list.map((u) => (u.id === updated.id ? updated : u)))
      setRevokeTarget(null)
      await fetchStats()
    } catch (err) {
      setError(getApiErrorMessage(err, 'Gagal mencabut langganan.'))
      setRevokeTarget(null)
    } finally {
      setRevoking(false)
    }
  }

  const resetFilters = () => {
    setQ('')
    setTier('')
    setPage(1)
  }

  const isExpired = (dateStr: string | null) => {
    if (!dateStr) return true
    return new Date(dateStr) < new Date()
  }

  const daysRemaining = (dateStr: string | null) => {
    if (!dateStr) return 0
    const remaining = Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000)
    return Math.max(0, remaining)
  }

  const selectCls =
    'rounded-xl border border-surface-800 bg-surface-900 px-3 py-2 text-sm text-surface-200 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30'

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Manajemen Langganan"
        subtitle="Kelola langganan Premium dan VVIP pengguna — grant, upgrade, revoke, dan pantau status"
        actions={
          <div className="flex items-center gap-2 text-sm text-surface-400">
            <Gem size={16} className="text-purple-400" />
            <span>Total: {stats.total} subscriber</span>
          </div>
        }
      />

      {/* Stats cards */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-purple-500/30 bg-purple-500/5 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/15">
              <Gem size={18} className="text-purple-400" />
            </div>
            <div>
              <p className="text-xs text-surface-400">VVIP Aktif</p>
              <p className="font-display text-xl font-bold text-purple-300">{stats.vvip_active}</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15">
              <Crown size={18} className="text-amber-400" />
            </div>
            <div>
              <p className="text-xs text-surface-400">Premium Aktif</p>
              <p className="font-display text-xl font-bold text-amber-300">{stats.premium_active}</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-surface-800 bg-surface-900/60 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-800">
              <ShieldCheck size={18} className="text-surface-400" />
            </div>
            <div>
              <p className="text-xs text-surface-400">Total Subscriber</p>
              <p className="font-display text-xl font-bold text-surface-200">{stats.total}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            setPage(1)
          }}
          className="relative"
        >
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-surface-500" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari nama, username, atau email…"
            className="w-full rounded-xl border border-surface-800 bg-surface-900 py-2 pl-9 pr-4 text-sm text-surface-100 placeholder:text-surface-500 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 sm:w-72"
          />
        </form>
        <select
          value={tier}
          onChange={(e) => {
            setTier(e.target.value as 'premium' | 'vvip' | 'free' | '')
            setPage(1)
          }}
          className={selectCls}
        >
          {tierOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        {(q || tier) && (
          <button
            onClick={resetFilters}
            className="text-xs font-medium text-surface-400 underline-offset-2 transition-colors hover:text-surface-200 hover:underline"
          >
            Reset filter
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-300">
          <AlertCircle size={16} /> {error}
        </div>
      )}
      {notice && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-300">
          <CheckCircle2 size={16} /> {notice}
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-surface-800 bg-surface-900">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-surface-500">
            <Loader2 size={20} className="mr-2 animate-spin" /> Memuat data…
          </div>
        ) : users.length === 0 ? (
          <div className="p-6">
            <EmptyState message="Tidak ada subscriber yang cocok dengan filter." />
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[800px] text-left text-sm">
                <thead>
                  <tr className="border-b border-surface-800 text-xs uppercase tracking-wide text-surface-500">
                    <th className="px-5 py-3 font-medium">Pengguna</th>
                    <th className="px-5 py-3 font-medium">Tier</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium">Masa Aktif</th>
                    <th className="px-5 py-3 text-right font-medium">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-800/60">
                  {users.map((u) => {
                    const vvipExpired = isExpired(u.vvip_until)
                    const premiumExpired = isExpired(u.premium_until)
                    const isActiveVvip = u.is_vvip && !vvipExpired
                    const isActivePremium = u.is_premium && !u.is_vvip && !premiumExpired

                    return (
                      <tr key={u.id} className="transition-colors hover:bg-surface-800/30">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <Avatar name={u.name} avatarUrl={u.avatar_url} size={36} className="rounded-full" />
                            <div className="min-w-0">
                              <p className="truncate font-medium text-surface-100">{u.name}</p>
                              <p className="truncate text-xs text-surface-500">
                                @{u.username} · {u.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          {isActiveVvip ? (
                            <Badge tone="pink">
                              <Gem size={10} /> VVIP
                            </Badge>
                          ) : isActivePremium ? (
                            <Badge tone="amber">
                              <Crown size={10} /> Premium
                            </Badge>
                          ) : (
                            <Badge tone="slate">Free</Badge>
                          )}
                        </td>
                        <td className="px-5 py-3.5">
                          {isActiveVvip || isActivePremium ? (
                            <Badge tone="green">Aktif</Badge>
                          ) : (u.is_premium || u.is_vvip) ? (
                            <Badge tone="red">Expired</Badge>
                          ) : (
                            <span className="text-xs text-surface-500">—</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="text-xs text-surface-400">
                            {isActiveVvip && u.vvip_until && (
                              <p>
                                VVIP: {formatDate(u.vvip_until)}
                                <span className="ml-1 text-purple-300">
                                  ({daysRemaining(u.vvip_until)}h lagi)
                                </span>
                              </p>
                            )}
                            {isActivePremium && u.premium_until && (
                              <p>
                                Premium: {formatDate(u.premium_until)}
                                <span className="ml-1 text-amber-300">
                                  ({daysRemaining(u.premium_until)}h lagi)
                                </span>
                              </p>
                            )}
                            {!isActiveVvip && !isActivePremium && (
                              <span className="text-surface-600">Tidak aktif</span>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {isActiveVvip ? (
                              <>
                                <button
                                  onClick={() => {
                                    setUpgradeTarget(u)
                                    setUpgradeDays(30)
                                  }}
                                  className="inline-flex items-center gap-1.5 rounded-lg border border-purple-500/40 bg-purple-500/10 px-2.5 py-1.5 text-xs font-medium text-purple-300 transition-colors hover:bg-purple-500/20"
                                  title="Perpanjang VVIP"
                                >
                                  <Sparkles size={13} /> Perpanjang
                                </button>
                                <button
                                  onClick={() => {
                                    setRevokeTarget(u)
                                    setRevokeType('vvip')
                                  }}
                                  className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/40 bg-red-500/10 px-2.5 py-1.5 text-xs font-medium text-red-300 transition-colors hover:bg-red-500/20"
                                  title="Cabut VVIP"
                                >
                                  <XCircle size={13} /> Cabut
                                </button>
                              </>
                            ) : isActivePremium ? (
                              <>
                                <button
                                  onClick={() => {
                                    setUpgradeTarget(u)
                                    setUpgradeDays(30)
                                  }}
                                  className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-2.5 py-1.5 text-xs font-semibold text-white shadow-lg shadow-purple-600/25 transition-all hover:brightness-110"
                                  title="Upgrade ke VVIP"
                                >
                                  <ArrowUp size={13} /> VVIP
                                </button>
                                <button
                                  onClick={() => {
                                    setRevokeTarget(u)
                                    setRevokeType('premium')
                                  }}
                                  className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/40 bg-red-500/10 px-2.5 py-1.5 text-xs font-medium text-red-300 transition-colors hover:bg-red-500/20"
                                  title="Cabut Premium"
                                >
                                  <XCircle size={13} /> Cabut
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => {
                                    setGrantPremiumTarget(u)
                                    setGrantPremiumDays(30)
                                  }}
                                  className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 px-2.5 py-1.5 text-xs font-semibold text-white shadow-lg shadow-amber-500/25 transition-all hover:brightness-110"
                                  title="Berikan Premium"
                                >
                                  <Crown size={13} /> Premium
                                </button>
                                <button
                                  onClick={() => {
                                    setGrantTarget(u)
                                    setGrantDays(30)
                                  }}
                                  className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-2.5 py-1.5 text-xs font-semibold text-white shadow-lg shadow-purple-600/25 transition-all hover:brightness-110"
                                  title="Berikan VVIP"
                                >
                                  <Gem size={13} /> VVIP
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            {/* Mobile Card Layout */}
            <div className="divide-y divide-surface-800/60 md:hidden">
              {users.map((u) => {
                const vvipExpired = isExpired(u.vvip_until)
                const premiumExpired = isExpired(u.premium_until)
                const isActiveVvip = u.is_vvip && !vvipExpired
                const isActivePremium = u.is_premium && !u.is_vvip && !premiumExpired

                return (
                  <div key={u.id} className="p-4">
                    <div className="mb-3 flex items-center gap-3">
                      <Avatar name={u.name} avatarUrl={u.avatar_url} size={40} className="rounded-full" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-surface-100">{u.name}</p>
                        <p className="truncate text-xs text-surface-500">@{u.username}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {isActiveVvip ? (
                          <Badge tone="pink"><Gem size={10} /> VVIP</Badge>
                        ) : isActivePremium ? (
                          <Badge tone="amber"><Crown size={10} /> Premium</Badge>
                        ) : (
                          <Badge tone="slate">Free</Badge>
                        )}
                        {isActiveVvip || isActivePremium ? (
                          <Badge tone="green">Aktif</Badge>
                        ) : (u.is_premium || u.is_vvip) ? (
                          <Badge tone="red">Expired</Badge>
                        ) : null}
                      </div>
                    </div>
                    <div className="mb-3 text-xs text-surface-400">
                      {isActiveVvip && u.vvip_until && (
                        <p>VVIP: {formatDate(u.vvip_until)} <span className="text-purple-300">({daysRemaining(u.vvip_until)}h lagi)</span></p>
                      )}
                      {isActivePremium && u.premium_until && (
                        <p>Premium: {formatDate(u.premium_until)} <span className="text-amber-300">({daysRemaining(u.premium_until)}h lagi)</span></p>
                      )}
                      {!isActiveVvip && !isActivePremium && <span className="text-surface-600">Tidak aktif</span>}
                    </div>
                    <div className="flex justify-end gap-2">
                      {isActiveVvip ? (
                        <>
                          <button
                            onClick={() => {
                              setUpgradeTarget(u)
                              setUpgradeDays(30)
                            }}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-purple-500/40 bg-purple-500/10 px-3 py-2 text-xs font-medium text-purple-300 transition-colors hover:bg-purple-500/20"
                          >
                            <Sparkles size={14} /> Perpanjang
                          </button>
                          <button
                            onClick={() => {
                              setRevokeTarget(u)
                              setRevokeType('vvip')
                            }}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-300 transition-colors hover:bg-red-500/20"
                          >
                            <XCircle size={14} /> Cabut
                          </button>
                        </>
                      ) : isActivePremium ? (
                        <>
                          <button
                            onClick={() => {
                              setUpgradeTarget(u)
                              setUpgradeDays(30)
                            }}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-3 py-2 text-xs font-semibold text-white shadow-lg shadow-purple-600/25 transition-all hover:brightness-110"
                          >
                            <ArrowUp size={14} /> VVIP
                          </button>
                          <button
                            onClick={() => {
                              setRevokeTarget(u)
                              setRevokeType('premium')
                            }}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-300 transition-colors hover:bg-red-500/20"
                          >
                            <XCircle size={14} /> Cabut
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => {
                              setGrantPremiumTarget(u)
                              setGrantPremiumDays(30)
                            }}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-2 text-xs font-semibold text-white shadow-lg shadow-amber-500/25 transition-all hover:brightness-110"
                          >
                            <Crown size={14} /> Premium
                          </button>
                          <button
                            onClick={() => {
                              setGrantTarget(u)
                              setGrantDays(30)
                            }}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-3 py-2 text-xs font-semibold text-white shadow-lg shadow-purple-600/25 transition-all hover:brightness-110"
                          >
                            <Gem size={14} /> VVIP
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>

      {!loading && users.length > 0 && <Pagination meta={meta} onPageChange={setPage} />}

      {/* ====== Modal Grant VVIP ====== */}
      {grantTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={granting ? undefined : () => setGrantTarget(null)} />
          <div className="relative w-full max-w-md animate-slide-up rounded-2xl border border-surface-800 bg-surface-900 p-5 shadow-2xl shadow-black/60 sm:p-6">
            <div className="sticky top-0 z-10 -mx-5 -mt-5 mb-4 flex items-start justify-between gap-4 border-b border-surface-800 bg-surface-900 px-5 py-4 sm:-mx-6 sm:px-6">
              <div>
                <h3 className="flex items-center gap-2 font-display text-lg font-bold text-surface-50">
                  <Gem size={18} className="text-purple-400" /> Berikan VVIP
                </h3>
                <p className="mt-1 text-xs text-surface-500">
                  {grantTarget.name} (@{grantTarget.username})
                </p>
              </div>
              <button
                onClick={() => setGrantTarget(null)}
                disabled={granting}
                className="sticky top-4 z-20 rounded-lg p-2 text-surface-400 transition-colors hover:bg-surface-800 hover:text-surface-50"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-4 rounded-xl border border-purple-500/30 bg-purple-500/10 p-4 text-center">
              <p className="text-xs text-surface-400">User akan mendapatkan akses VVIP</p>
              <div className="mt-2 flex items-center justify-center gap-2 text-purple-300">
                <Gem size={16} />
                <span className="text-sm font-semibold">Semua episode premium terbuka + Bebas iklan</span>
              </div>
            </div>

            <div className="mt-4">
              <label className="mb-1.5 block text-sm font-medium text-surface-200">Durasi VVIP</label>
              <select
                value={grantDays}
                onChange={(e) => setGrantDays(Number(e.target.value))}
                className="w-full rounded-xl border border-surface-800 bg-surface-950 px-4 py-3 text-sm text-surface-100 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
              >
                {grantDayOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                onClick={() => setGrantTarget(null)}
                disabled={granting}
                className="w-full rounded-xl border border-surface-700 px-4 py-2.5 text-sm font-medium text-surface-300 transition-colors hover:bg-surface-800 disabled:opacity-50 sm:w-auto"
              >
                Batal
              </button>
              <button
                onClick={handleGrantVvip}
                disabled={granting}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-600/25 transition-all hover:brightness-110 disabled:opacity-60 sm:w-auto"
              >
                {granting && <Loader2 size={15} className="animate-spin" />}
                {granting ? 'Memproses…' : `Berikan VVIP ${grantDays} Hari`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====== Modal Grant Premium ====== */}
      {grantPremiumTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={grantingPremium ? undefined : () => setGrantPremiumTarget(null)} />
          <div className="relative w-full max-w-md animate-slide-up rounded-2xl border border-surface-800 bg-surface-900 p-5 shadow-2xl shadow-black/60 sm:p-6">
            <div className="sticky top-0 z-10 -mx-5 -mt-5 mb-4 flex items-start justify-between gap-4 border-b border-surface-800 bg-surface-900 px-5 py-4 sm:-mx-6 sm:px-6">
              <div>
                <h3 className="flex items-center gap-2 font-display text-lg font-bold text-surface-50">
                  <Crown size={18} className="text-amber-400" /> Berikan Premium
                </h3>
                <p className="mt-1 text-xs text-surface-500">
                  {grantPremiumTarget.name} (@{grantPremiumTarget.username})
                </p>
              </div>
              <button
                onClick={() => setGrantPremiumTarget(null)}
                disabled={grantingPremium}
                className="sticky top-4 z-20 rounded-lg p-2 text-surface-400 transition-colors hover:bg-surface-800 hover:text-surface-50"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-center">
              <p className="text-xs text-surface-400">User akan mendapatkan akses Premium</p>
              <div className="mt-2 flex items-center justify-center gap-2 text-amber-300">
                <Crown size={16} />
                <span className="text-sm font-semibold">Bebas iklan + Badge Premium + Fitur prioritas</span>
              </div>
            </div>

            <div className="mt-4">
              <label className="mb-1.5 block text-sm font-medium text-surface-200">Durasi Premium</label>
              <select
                value={grantPremiumDays}
                onChange={(e) => setGrantPremiumDays(Number(e.target.value))}
                className="w-full rounded-xl border border-surface-800 bg-surface-950 px-4 py-3 text-sm text-surface-100 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
              >
                {grantDayOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                onClick={() => setGrantPremiumTarget(null)}
                disabled={grantingPremium}
                className="w-full rounded-xl border border-surface-700 px-4 py-2.5 text-sm font-medium text-surface-300 transition-colors hover:bg-surface-800 disabled:opacity-50 sm:w-auto"
              >
                Batal
              </button>
              <button
                onClick={handleGrantPremium}
                disabled={grantingPremium}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-amber-500/25 transition-all hover:brightness-110 disabled:opacity-60 sm:w-auto"
              >
                {grantingPremium && <Loader2 size={15} className="animate-spin" />}
                {grantingPremium ? 'Memproses…' : `Berikan Premium ${grantPremiumDays} Hari`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====== Modal Upgrade to VVIP ====== */}
      {upgradeTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={upgrading ? undefined : () => setUpgradeTarget(null)} />
          <div className="relative w-full max-w-md animate-slide-up rounded-2xl border border-surface-800 bg-surface-900 p-5 shadow-2xl shadow-black/60 sm:p-6">
            <div className="sticky top-0 z-10 -mx-5 -mt-5 mb-4 flex items-start justify-between gap-4 border-b border-surface-800 bg-surface-900 px-5 py-4 sm:-mx-6 sm:px-6">
              <div>
                <h3 className="flex items-center gap-2 font-display text-lg font-bold text-surface-50">
                  <Sparkles size={18} className="text-purple-400" /> Upgrade ke VVIP
                </h3>
                <p className="mt-1 text-xs text-surface-500">
                  {upgradeTarget.name} (@{upgradeTarget.username})
                </p>
              </div>
              <button
                onClick={() => setUpgradeTarget(null)}
                disabled={upgrading}
                className="sticky top-4 z-20 rounded-lg p-2 text-surface-400 transition-colors hover:bg-surface-800 hover:text-surface-50"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-4 rounded-xl border border-purple-500/30 bg-purple-500/10 p-4 text-center">
              <p className="text-xs text-surface-400">
                {upgradeTarget.is_premium && !isExpired(upgradeTarget.premium_until)
                  ? 'Upgrade dari Premium ke VVIP'
                  : 'User akan mendapatkan akses VVIP'}
              </p>
              <div className="mt-2 flex items-center justify-center gap-2 text-purple-300">
                <Gem size={16} />
                <span className="text-sm font-semibold">Semua episode premium terbuka + Bebas iklan</span>
              </div>
            </div>

            <div className="mt-4">
              <label className="mb-1.5 block text-sm font-medium text-surface-200">Durasi VVIP</label>
              <select
                value={upgradeDays}
                onChange={(e) => setUpgradeDays(Number(e.target.value))}
                className="w-full rounded-xl border border-surface-800 bg-surface-950 px-4 py-3 text-sm text-surface-100 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
              >
                {grantDayOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                onClick={() => setUpgradeTarget(null)}
                disabled={upgrading}
                className="w-full rounded-xl border border-surface-700 px-4 py-2.5 text-sm font-medium text-surface-300 transition-colors hover:bg-surface-800 disabled:opacity-50 sm:w-auto"
              >
                Batal
              </button>
              <button
                onClick={handleUpgradeToVvip}
                disabled={upgrading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-600/25 transition-all hover:brightness-110 disabled:opacity-60 sm:w-auto"
              >
                {upgrading && <Loader2 size={15} className="animate-spin" />}
                {upgrading ? 'Memproses…' : `Upgrade ke VVIP ${upgradeDays} Hari`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====== Confirm Revoke ====== */}
      <ConfirmDialog
        open={revokeTarget !== null}
        title={revokeType === 'vvip' ? 'Cabut VVIP' : 'Cabut Premium'}
        description={
          revokeTarget
            ? revokeType === 'vvip'
              ? `VVIP untuk "${revokeTarget.name}" (@${revokeTarget.username}) akan dicabut. User tidak akan lagi bisa mengakses episode premium gratis.`
              : `Premium untuk "${revokeTarget.name}" (@${revokeTarget.username}) akan dicabut. User tidak akan lagi mendapatkan akses premium.`
            : ''
        }
        confirmLabel={revokeType === 'vvip' ? 'Cabut VVIP' : 'Cabut Premium'}
        loading={revoking}
        onConfirm={handleRevoke}
        onCancel={() => setRevokeTarget(null)}
      />
    </div>
  )
}

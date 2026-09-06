import { useCallback, useEffect, useState } from 'react'
import { AlertCircle, CalendarDays, Loader2, RefreshCw, Search } from 'lucide-react'
import Avatar from '../../components/Avatar'
import PageHeader from '../../components/admin/PageHeader'
import { Badge } from '../../components/admin/Badge'
import Pagination from '../../components/admin/Pagination'
import EmptyState from '../../components/admin/EmptyState'
import { admin, getApiErrorMessage } from '../../services/admin'
import type { ActivityLogItem } from '../../types'
import { timeAgo } from '../../utils/format'

interface ActionMeta {
  label: string
  tone: 'brand' | 'green' | 'amber' | 'red' | 'blue' | 'slate'
}

const ACTION_META: Record<string, ActionMeta> = {
  comic_upload: { label: 'Upload Komik', tone: 'blue' },
  comic_verify: { label: 'Verifikasi Komik', tone: 'brand' },
  comic_publish: { label: 'Publish Komik', tone: 'green' },
  comic_block: { label: 'Blokir Komik', tone: 'red' },
  comic_ban: { label: 'Hapus Komik', tone: 'red' },
  episode_submit: { label: 'Kirim Episode', tone: 'blue' },
  episode_publish: { label: 'Publish Episode', tone: 'green' },
  episode_reject: { label: 'Tolak Episode', tone: 'red' },
  episode_delete: { label: 'Hapus Episode', tone: 'red' },
  coin_purchase: { label: 'Beli Koin', tone: 'brand' },
  episode_unlock: { label: 'Unlock Premium', tone: 'amber' },
  subscription: { label: 'Langganan', tone: 'brand' },
  comic_download: { label: 'Download Offline', tone: 'blue' },
  comment_moderate: { label: 'Moderasi Komentar', tone: 'amber' },
  user_role: { label: 'Ubah Role', tone: 'brand' },
  user_ban: { label: 'Blokir Akun', tone: 'red' },
  user_unban: { label: 'Buka Blokir', tone: 'green' },
  user_permanent_ban: { label: 'Ban Permanen', tone: 'red' },
  creator_approve: { label: 'Verifikasi Creator', tone: 'green' },
}

function metaFor(action: string): ActionMeta {
  return ACTION_META[action] ?? { label: action.replace(/_/g, ' '), tone: 'slate' }
}

export default function AdminActivityLogPage() {
  const [logs, setLogs] = useState<ActivityLogItem[]>([])
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 })
  const [availableActions, setAvailableActions] = useState<string[]>([])
  const [q, setQ] = useState('')
  const [action, setAction] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchLogs = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await admin.activities({
        q: q || undefined,
        action: action || undefined,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
        page,
      })
      setLogs(res.data)
      setMeta(res.meta)
      if (availableActions.length === 0 && res.available_actions.length > 0) {
        setAvailableActions(res.available_actions)
      }
    } catch (err) {
      setError(getApiErrorMessage(err, 'Gagal memuat riwayat aktivitas.'))
    } finally {
      setLoading(false)
    }
  }, [q, action, dateFrom, dateTo, page, availableActions.length])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  const applyFilter = () => {
    setPage(1)
  }

  const resetFilters = () => {
    setQ('')
    setAction('')
    setDateFrom('')
    setDateTo('')
    setPage(1)
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Riwayat Aktivitas"
        subtitle="Catatan upload, publish, pembelian, download, dan moderasi di seluruh platform"
      />

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            applyFilter()
          }}
          className="relative"
        >
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-surface-500" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari aksi atau pengguna…"
            className="w-64 max-w-full rounded-xl border border-surface-800 bg-surface-900 py-2 pl-9 pr-4 text-sm text-surface-100 placeholder:text-surface-500 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
          />
        </form>
        <select
          value={action}
          onChange={(e) => {
            setAction(e.target.value)
            setPage(1)
          }}
          className="rounded-xl border border-surface-800 bg-surface-900 px-3 py-2 text-sm text-surface-200 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
        >
          <option value="">Semua Aksi</option>
          {availableActions.map((a) => (
            <option key={a} value={a}>
              {metaFor(a).label}
            </option>
          ))}
        </select>
        <div className="flex items-center gap-2">
          <div className="relative">
            <CalendarDays size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-surface-500" />
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value)
                setPage(1)
              }}
              className="rounded-xl border border-surface-800 bg-surface-900 py-2 pl-9 pr-3 text-sm text-surface-200 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
            />
          </div>
          <span className="text-xs text-surface-500">s/d</span>
          <div className="relative">
            <CalendarDays size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-surface-500" />
            <input
              type="date"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value)
                setPage(1)
              }}
              className="rounded-xl border border-surface-800 bg-surface-900 py-2 pl-9 pr-3 text-sm text-surface-200 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
            />
          </div>
        </div>
        {(q || action || dateFrom || dateTo) && (
          <button
            onClick={resetFilters}
            className="rounded-xl px-3 py-2 text-sm font-medium text-surface-400 transition-colors hover:bg-surface-800 hover:text-surface-200"
          >
            Reset
          </button>
        )}
        <button
          onClick={() => {
            setPage(1)
            fetchLogs()
          }}
          className="ml-auto inline-flex items-center gap-1.5 rounded-xl border border-surface-800 bg-surface-900 px-3 py-2 text-sm text-surface-300 transition-colors hover:bg-surface-800"
        >
          <RefreshCw size={14} /> Muat Ulang
        </button>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-300">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-surface-800 bg-surface-900">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-surface-500">
            <Loader2 size={20} className="mr-2 animate-spin" /> Memuat data…
          </div>
        ) : logs.length === 0 ? (
          <div className="p-6">
            <EmptyState message="Belum ada riwayat aktivitas yang cocok dengan filter." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="border-b border-surface-800 text-xs uppercase tracking-wide text-surface-500">
                  <th className="px-5 py-3 font-medium">Waktu</th>
                  <th className="px-5 py-3 font-medium">Aksi</th>
                  <th className="px-5 py-3 font-medium">Keterangan</th>
                  <th className="px-5 py-3 font-medium">Pelaku</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-800/60">
                {logs.map((log) => {
                  const metaBadge = metaFor(log.action)
                  return (
                    <tr key={log.id} className="align-top transition-colors hover:bg-surface-800/30">
                      <td className="whitespace-nowrap px-5 py-3.5 text-xs text-surface-500">
                        {timeAgo(log.created_at ?? '')}
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge tone={metaBadge.tone}>{metaBadge.label}</Badge>
                      </td>
                      <td className="max-w-xl px-5 py-3.5 leading-relaxed text-surface-200">
                        {log.description ?? <span className="text-surface-600">—</span>}
                        {log.ip_address && (
                          <span className="mt-0.5 block text-[11px] text-surface-600">IP: {log.ip_address}</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5">
                        {log.user ? (
                          <div className="flex items-center gap-2">
                            <Avatar name={log.user.name} avatarUrl={log.user.avatar_url} size={28} className="rounded-full" />
                            <div className="leading-tight">
                              <p className="text-surface-300">{log.user.name}</p>
                              <p className="text-[11px] text-surface-600">@{log.user.username}</p>
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-surface-600">Sistem</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {!loading && logs.length > 0 && <Pagination meta={meta} onPageChange={setPage} />}
    </div>
  )
}

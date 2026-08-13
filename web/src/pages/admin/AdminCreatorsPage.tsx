import { useCallback, useEffect, useState } from 'react'
import { AlertCircle, BadgeCheck, Eye, Loader2, Palette, Search, ShieldCheck } from 'lucide-react'
import PageHeader from '../../components/admin/PageHeader'
import Pagination from '../../components/admin/Pagination'
import EmptyState from '../../components/admin/EmptyState'
import { admin, getApiErrorMessage } from '../../services/admin'
import type { AdminCreator } from '../../types'
import { formatDate, formatNumber } from '../../utils/format'

export default function AdminCreatorsPage() {
  const [creators, setCreators] = useState<AdminCreator[]>([])
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 })
  const [q, setQ] = useState('')
  const [verified, setVerified] = useState<'' | 'true' | 'false'>('')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busyId, setBusyId] = useState<number | null>(null)

  const fetchCreators = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await admin.creators({
        q: q || undefined,
        verified: verified === '' ? undefined : verified === 'true',
        page,
      })
      setCreators(res.data)
      setMeta(res.meta)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Gagal memuat daftar creator.'))
    } finally {
      setLoading(false)
    }
  }, [q, verified, page])

  useEffect(() => {
    fetchCreators()
  }, [fetchCreators])

  const toggleVerify = async (creator: AdminCreator) => {
    setBusyId(creator.id)
    setNotice('')
    try {
      const updated = await admin.verifyCreator(creator.id, !creator.is_verified)
      setCreators((list) => list.map((c) => (c.id === updated.id ? updated : c)))
      setNotice(
        updated.is_verified
          ? `${updated.display_name ?? updated.name} telah diverifikasi.`
          : `Verifikasi ${updated.display_name ?? updated.name} dicabut.`,
      )
    } catch (err) {
      setError(getApiErrorMessage(err, 'Gagal memperbarui verifikasi.'))
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Manajemen Creator"
        subtitle="Verifikasi creator dan pantau aktivitas penerbitan mereka"
      />

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
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
            className="w-72 max-w-full rounded-xl border border-surface-800 bg-surface-900 py-2 pl-9 pr-4 text-sm text-surface-100 placeholder:text-surface-500 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
          />
        </form>
        <select
          value={verified}
          onChange={(e) => {
            setVerified(e.target.value as '' | 'true' | 'false')
            setPage(1)
          }}
          className="rounded-xl border border-surface-800 bg-surface-900 px-3 py-2 text-sm text-surface-200 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
        >
          <option value="">Semua Status</option>
          <option value="true">Sudah Terverifikasi</option>
          <option value="false">Belum Terverifikasi</option>
        </select>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-300">
          <AlertCircle size={16} /> {error}
        </div>
      )}
      {notice && (
        <div className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-300">
          {notice}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-surface-800 bg-surface-900">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-surface-500">
            <Loader2 size={20} className="mr-2 animate-spin" /> Memuat data…
          </div>
        ) : creators.length === 0 ? (
          <div className="p-6">
            <EmptyState message="Belum ada creator yang cocok dengan filter." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="border-b border-surface-800 text-xs uppercase tracking-wide text-surface-500">
                  <th className="px-5 py-3 font-medium">Creator</th>
                  <th className="px-5 py-3 font-medium">Email</th>
                  <th className="px-5 py-3 text-center font-medium">Komik</th>
                  <th className="px-5 py-3 text-center font-medium">Terbit</th>
                  <th className="px-5 py-3 text-right font-medium">Total Views</th>
                  <th className="px-5 py-3 text-right font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-800/60">
                {creators.map((c) => (
                  <tr key={c.id} className="transition-colors hover:bg-surface-800/30">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-indigo-500 text-xs font-bold text-white">
                          {(c.display_name ?? c.name)[0]?.toUpperCase()}
                        </span>
                        <div className="min-w-0">
                          <p className="flex items-center gap-1.5 font-medium text-surface-100">
                            <span className="truncate">{c.display_name ?? c.name}</span>
                            {c.is_verified ? (
                              <BadgeCheck size={15} className="shrink-0 text-sky-400" />
                            ) : (
                              <Palette size={14} className="shrink-0 text-surface-500" />
                            )}
                          </p>
                          <p className="truncate text-xs text-surface-500">
                            @{c.username} · gabung {formatDate(c.created_at)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-surface-400">{c.email}</td>
                    <td className="px-5 py-3.5 text-center text-surface-300">{c.comics_count}</td>
                    <td className="px-5 py-3.5 text-center text-surface-300">{c.published_comics_count}</td>
                    <td className="px-5 py-3.5 text-right">
                      <span className="flex items-center justify-end gap-1.5 text-surface-300">
                        <Eye size={14} className="text-emerald-400" />
                        {formatNumber(c.total_views)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => toggleVerify(c)}
                        disabled={busyId === c.id}
                        className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-50 ${
                          c.is_verified
                            ? 'border border-surface-700 text-surface-300 hover:bg-surface-800'
                            : 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow-lg shadow-sky-600/25 hover:brightness-110'
                        }`}
                      >
                        {busyId === c.id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <ShieldCheck size={14} />
                        )}
                        {c.is_verified ? 'Cabut Verifikasi' : 'Verifikasi'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {!loading && creators.length > 0 && <Pagination meta={meta} onPageChange={setPage} />}

    </div>
  )
}

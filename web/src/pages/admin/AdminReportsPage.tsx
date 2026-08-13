import { useCallback, useEffect, useState } from 'react'
import { AlertCircle, FileText, Flag, Loader2, ShieldCheck, X } from 'lucide-react'
import PageHeader from '../../components/admin/PageHeader'
import { Badge, StatusBadge } from '../../components/admin/Badge'
import Pagination from '../../components/admin/Pagination'
import EmptyState from '../../components/admin/EmptyState'
import { admin, getApiErrorMessage } from '../../services/admin'
import type { AdminReport, ReportStatus } from '../../types'
import { formatDate } from '../../utils/format'

const typeTone: Record<string, string> = {
  comic: 'bg-sky-500/10 text-sky-300 border-sky-500/30',
  episode: 'bg-pink-500/10 text-pink-300 border-pink-500/30',
  comment: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
  user: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
}

export default function AdminReportsPage() {
  const [reports, setReports] = useState<AdminReport[]>([])
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 })
  const [status, setStatus] = useState<'' | ReportStatus>('')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [active, setActive] = useState<AdminReport | null>(null)
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fetchReports = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await admin.reports({ status: status || undefined, page })
      setReports(res.data)
      setMeta(res.meta)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Gagal memuat daftar laporan.'))
    } finally {
      setLoading(false)
    }
  }, [status, page])

  useEffect(() => {
    fetchReports()
  }, [fetchReports])

  const openReport = (report: AdminReport) => {
    setActive(report)
    setNote(report.admin_note ?? '')
  }

  const submit = async (nextStatus: ReportStatus) => {
    if (!active) return
    setSubmitting(true)
    try {
      const updated = await admin.handleReport(active.id, {
        status: nextStatus,
        admin_note: note.trim() || undefined,
      })
      setReports((list) => list.map((r) => (r.id === updated.id ? updated : r)))
      setActive(null)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Gagal memproses laporan.'))
      setActive(null)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Laporan Masuk"
        subtitle="Tinjau laporan pengguna dan ambil tindakan moderasi"
      />

      {/* Filter */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as '' | ReportStatus)
            setPage(1)
          }}
          className="rounded-xl border border-surface-800 bg-surface-900 px-3 py-2 text-sm text-surface-200 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
        >
          <option value="">Semua Status</option>
          <option value="pending">Menunggu</option>
          <option value="resolved">Selesai</option>
          <option value="dismissed">Ditolak</option>
        </select>
        <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-300">
          {reports.filter((r) => r.status === 'pending').length} menunggu di halaman ini
        </span>
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
        ) : reports.length === 0 ? (
          <div className="p-6">
            <EmptyState message="Tidak ada laporan yang cocok dengan filter." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead>
                <tr className="border-b border-surface-800 text-xs uppercase tracking-wide text-surface-500">
                  <th className="px-5 py-3 font-medium">Alasan</th>
                  <th className="px-5 py-3 font-medium">Konten Dilaporkan</th>
                  <th className="px-5 py-3 font-medium">Pelapor</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Tanggal</th>
                  <th className="px-5 py-3 text-right font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-800/60">
                {reports.map((r) => (
                  <tr key={r.id} className="transition-colors hover:bg-surface-800/30">
                    <td className="px-5 py-3.5">
                      <p className="font-medium capitalize text-surface-100">{r.reason}</p>
                      {r.description && (
                        <p className="mt-0.5 line-clamp-1 max-w-48 text-xs text-surface-500">{r.description}</p>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex max-w-52 items-center gap-1.5 truncate rounded-lg border px-2 py-1 text-xs ${typeTone[r.reportable?.type ?? ''] ?? typeTone.user}`}
                      >
                        <Flag size={11} className="shrink-0" />
                        <span className="truncate capitalize">{r.reportable?.type ?? '—'}</span>
                        <span className="truncate font-medium">· {r.reportable?.title ?? '#' + r.reportable_id}</span>
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-surface-400">
                      {r.reporter ? (
                        <div>
                          <p className="text-surface-300">{r.reporter.name}</p>
                          <p className="text-xs text-surface-500">@{r.reporter.username}</p>
                        </div>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex flex-col gap-1">
                        <StatusBadge status={r.status} />
                        {r.handled_by && (
                          <span className="text-[10px] text-surface-500">oleh {r.handled_by.name}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-surface-400">{formatDate(r.created_at)}</td>
                    <td className="px-5 py-3.5 text-right">
                      {r.status === 'pending' ? (
                        <button
                          onClick={() => openReport(r)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-brand-600 to-pink-600 px-3 py-1.5 text-xs font-semibold text-white shadow-lg shadow-brand-600/25 transition-all hover:brightness-110"
                        >
                          <ShieldCheck size={14} /> Proses
                        </button>
                      ) : (
                        <span className="text-xs text-surface-600">
                          {r.handled_at ? formatDate(r.handled_at) : '—'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {!loading && reports.length > 0 && <Pagination meta={meta} onPageChange={setPage} />}

      {/* Handle modal */}
      {active && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={submitting ? undefined : () => setActive(null)} />
          <div className="relative max-h-[90vh] w-full max-w-lg animate-slide-up overflow-y-auto rounded-2xl border border-surface-800 bg-surface-900 p-6 shadow-2xl shadow-black/60">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="flex items-center gap-2 font-display text-lg font-bold text-surface-50">
                  <Flag size={18} className="text-amber-400" />
                  Laporan #{active.id}
                </h3>
                <p className="mt-1 text-xs text-surface-500">
                  Dilaporkan {formatDate(active.created_at)} oleh {active.reporter?.name ?? 'anonim'}
                </p>
              </div>
              <button
                onClick={() => setActive(null)}
                disabled={submitting}
                className="rounded-lg p-1.5 text-surface-400 transition-colors hover:bg-surface-800 hover:text-surface-50"
                aria-label="Tutup"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <div className="rounded-xl border border-surface-800 bg-surface-950 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-lg border px-2 py-0.5 text-xs capitalize ${typeTone[active.reportable?.type ?? ''] ?? typeTone.user}`}>
                    {active.reportable?.type ?? 'Konten'}
                  </span>
                  <Badge tone="amber">Alasan: {active.reason}</Badge>
                </div>
                <p className="mt-3 text-sm font-medium text-surface-200">{active.reportable?.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-surface-400">
                  {active.description || 'Tanpa deskripsi tambahan.'}
                </p>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-surface-200">Catatan Admin (opsional)</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  placeholder="Contoh: konten sudah dihapus, peringatan dikirim ke creator…"
                  className="w-full resize-none rounded-xl border border-surface-800 bg-surface-950 px-4 py-3 text-sm text-surface-100 placeholder:text-surface-500 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                />
              </div>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                onClick={() => submit('dismissed')}
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-surface-700 px-4 py-2 text-sm font-medium text-surface-300 transition-colors hover:bg-surface-800 disabled:opacity-50"
              >
                <X size={15} /> Tolak Laporan
              </button>
              <button
                onClick={() => submit('resolved')}
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-600/25 transition-all hover:brightness-110 disabled:opacity-60"
              >
                {submitting ? <Loader2 size={15} className="animate-spin" /> : <FileText size={15} />}
                {submitting ? 'Memproses…' : 'Selesaikan Laporan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

import { useCallback, useEffect, useState } from 'react'
import { CheckCircle, XCircle, Clock, User, Mail, ExternalLink, AlertCircle, Loader2 } from 'lucide-react'
import PageHeader from '../../components/admin/PageHeader'
import Pagination from '../../components/admin/Pagination'
import ConfirmModal from '../../components/ConfirmModal'
import PromptModal from '../../components/PromptModal'
import { listApplications, approveApplication, rejectApplication } from '../../services/creatorApplication'
import type { CreatorApplication } from '../../services/creatorApplication'

function StatusBadge({ status }: { status: string }) {
  const config = {
    pending: { label: 'Menunggu', color: 'bg-amber-500/15 text-amber-300', icon: Clock },
    approved: { label: 'Disetujui', color: 'bg-green-500/15 text-green-300', icon: CheckCircle },
    rejected: { label: 'Ditolak', color: 'bg-red-500/15 text-red-300', icon: XCircle },
  }
  const c = config[status as keyof typeof config] ?? config.pending
  const Icon = c.icon
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${c.color}`}>
      <Icon size={12} /> {c.label}
    </span>
  )
}

export default function AdminCreatorApplicationsPage() {
  const [applications, setApplications] = useState<CreatorApplication[]>([])
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 })
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [processingId, setProcessingId] = useState<number | null>(null)

  // Modal states
  const [approveTarget, setApproveTarget] = useState<CreatorApplication | null>(null)
  const [rejectTarget, setRejectTarget] = useState<CreatorApplication | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await listApplications({
        status: filter === 'all' ? undefined : filter,
        page,
        per_page: 12,
      })
      setApplications(res.data)
      setMeta(res.meta)
    } catch {
      setError('Gagal memuat data pengajuan.')
    } finally {
      setLoading(false)
    }
  }, [filter, page])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const doApprove = async (id: number) => {
    setProcessingId(id)
    try {
      await approveApplication(id)
      fetchData()
    } catch {
      setError('Gagal menyetujui pengajuan.')
    } finally {
      setProcessingId(null)
    }
  }

  const doReject = async (id: number, note?: string) => {
    setProcessingId(id)
    try {
      await rejectApplication(id, note)
      fetchData()
    } catch {
      setError('Gagal menolak pengajuan.')
    } finally {
      setProcessingId(null)
    }
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Pengajuan Creator"
        subtitle="Tinjau dan setujui pengajuan pembaca yang ingin menjadi creator"
      />

      {/* Filter */}
      <div className="mb-6 flex items-center gap-2">
        {(['all', 'pending', 'approved', 'rejected'] as const).map((f) => (
          <button
            key={f}
            onClick={() => { setFilter(f); setPage(1) }}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              filter === f ? 'bg-brand-600 text-white' : 'bg-surface-800 text-surface-300 hover:bg-surface-700'
            }`}
          >
            {f === 'all' && 'Semua'}
            {f === 'pending' && 'Menunggu'}
            {f === 'approved' && 'Disetujui'}
            {f === 'rejected' && 'Ditolak'}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-300">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center rounded-2xl border border-surface-800 bg-surface-900 py-20">
          <Loader2 size={20} className="animate-spin text-brand-400" />
          <span className="ml-2 text-sm text-surface-400">Memuat data…</span>
        </div>
      ) : applications.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-surface-800 bg-surface-900 py-16">
          <AlertCircle size={40} className="text-surface-600" />
          <p className="mt-3 text-sm text-surface-400">
            {filter === 'pending' ? 'Tidak ada pengajuan baru.' : 'Tidak ada data untuk filter ini.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <div key={app.id} className="overflow-hidden rounded-2xl border border-surface-800 bg-surface-900">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-surface-800 px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-500/15">
                    <User size={18} className="text-brand-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-surface-100">{app.user?.name ?? '—'}</p>
                    <p className="flex items-center gap-1 text-xs text-surface-500">
                      <Mail size={11} /> {app.user?.email ?? '—'} · @{app.user?.username ?? '—'}
                    </p>
                  </div>
                </div>
                <StatusBadge status={app.status} />
              </div>

              {/* Content */}
              <div className="px-5 py-4 space-y-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-surface-500">Bio</p>
                  <p className="mt-1 text-sm text-surface-200">{app.bio}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-surface-500">Motivasi</p>
                  <p className="mt-1 text-sm text-surface-200">{app.reason}</p>
                </div>
                {app.experience && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-surface-500">Pengalaman</p>
                    <p className="mt-1 text-sm text-surface-200">{app.experience}</p>
                  </div>
                )}
                {app.portfolio_url && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-surface-500">Portfolio</p>
                    <a href={app.portfolio_url} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-1 text-sm text-brand-400 hover:text-brand-300">
                      <ExternalLink size={13} /> {app.portfolio_url}
                    </a>
                  </div>
                )}
                {app.review_note && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-surface-500">Catatan Admin</p>
                    <p className="mt-1 text-sm text-surface-300">{app.review_note}</p>
                  </div>
                )}
                <p className="text-[11px] text-surface-600">
                  Diajukan: {new Date(app.created_at).toLocaleString('id-ID')}
                  {app.reviewed_at && ` · Ditinjau: ${new Date(app.reviewed_at).toLocaleString('id-ID')}`}
                </p>
              </div>

              {/* Actions — hanya untuk pending */}
              {app.status === 'pending' && (
                <div className="flex items-center gap-2 border-t border-surface-800 px-5 py-3">
                  <button
                    onClick={() => setApproveTarget(app)}
                    disabled={processingId === app.id}
                    className="flex items-center gap-1.5 rounded-lg bg-green-600 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-green-500 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {processingId === app.id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                    Setujui
                  </button>
                  <button
                    onClick={() => setRejectTarget(app)}
                    disabled={processingId === app.id}
                    className="flex items-center gap-1.5 rounded-lg bg-red-600/80 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {processingId === app.id ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                    Tolak
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {!loading && applications.length > 0 && <Pagination meta={meta} onPageChange={setPage} />}

      {/* Confirm Approve Modal */}
      <ConfirmModal
        open={!!approveTarget}
        title="Setujui Pengajuan?"
        message={`Yakin ingin menyetujui pengajuan dari ${approveTarget?.user?.name ?? 'user ini'}? User akan otomatis menjadi creator.`}
        confirmText="Ya, Setujui"
        variant="success"
        onConfirm={() => {
          if (approveTarget) doApprove(approveTarget.id)
          setApproveTarget(null)
        }}
        onCancel={() => setApproveTarget(null)}
      />

      {/* Prompt Reject Modal */}
      <PromptModal
        open={!!rejectTarget}
        title="Tolak Pengajuan"
        message={`Tolak pengajuan dari ${rejectTarget?.user?.name ?? 'user ini'}? Kamu bisa memberikan alasan penolakan.`}
        placeholder="Alasan penolakan (opsional)..."
        confirmText="Tolak Pengajuan"
        onConfirm={(note) => {
          if (rejectTarget) doReject(rejectTarget.id, note || undefined)
          setRejectTarget(null)
        }}
        onCancel={() => setRejectTarget(null)}
      />
    </div>
  )
}

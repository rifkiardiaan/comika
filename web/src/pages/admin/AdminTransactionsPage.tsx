import { useCallback, useEffect, useState } from 'react'
import {
  AlertCircle,
  Banknote,
  CheckCircle2,
  Clock,
  Coins,
  Landmark,
  Loader2,
  RefreshCw,
  Search,
  ShieldCheck,
  X,
  XCircle,
} from 'lucide-react'
import Avatar from '../../components/Avatar'
import PageHeader from '../../components/admin/PageHeader'
import { Badge } from '../../components/admin/Badge'
import Pagination from '../../components/admin/Pagination'
import EmptyState from '../../components/admin/EmptyState'
import { admin, getApiErrorMessage } from '../../services/admin'
import { formatDate, formatNumber, formatRupiah } from '../../utils/format'
import type {
  AdminTransaction,
  AdminWithdrawal,
  TransactionStatus,
  TransactionType,
  WithdrawalStatus,
} from '../../types'

const tabs = [
  { key: 'transactions', label: 'Transaksi', icon: RefreshCw },
  { key: 'withdrawals', label: 'Penarikan', icon: Landmark },
] as const

type TabKey = (typeof tabs)[number]['key']

const txStatusTone: Record<TransactionStatus, 'green' | 'red' | 'amber' | 'slate'> = {
  success: 'green',
  failed: 'red',
  pending: 'amber',
  refunded: 'slate',
}

const txTypeLabel: Record<TransactionType, string> = {
  coin_purchase: 'Top-Up Koin',
  episode_unlock: 'Unlock Episode',
  earning: 'Earning',
  withdrawal: 'Penarikan',
}

const wdStatusTone: Record<WithdrawalStatus, 'amber' | 'blue' | 'red' | 'green'> = {
  pending: 'amber',
  approved: 'blue',
  rejected: 'red',
  paid: 'green',
}

const wdStatusLabel: Record<WithdrawalStatus, string> = {
  pending: 'Menunggu',
  approved: 'Disetujui',
  rejected: 'Ditolak',
  paid: 'Dibayar',
}

export default function AdminTransactionsPage() {
  const [tab, setTab] = useState<TabKey>('transactions')

  // Transaksi
  const [transactions, setTransactions] = useState<AdminTransaction[]>([])
  const [txMeta, setTxMeta] = useState({ current_page: 1, last_page: 1, total: 0 })
  const [txPage, setTxPage] = useState(1)
  const [txType, setTxType] = useState<'' | TransactionType>('')
  const [txStatus, setTxStatus] = useState<'' | TransactionStatus>('')
  const [txQ, setTxQ] = useState('')

  // Penarikan
  const [withdrawals, setWithdrawals] = useState<AdminWithdrawal[]>([])
  const [wdMeta, setWdMeta] = useState({ current_page: 1, last_page: 1, total: 0 })
  const [wdPage, setWdPage] = useState(1)
  const [wdStatus, setWdStatus] = useState<'' | WithdrawalStatus>('')
  const [wdQ, setWdQ] = useState('')

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  // Modal proses penarikan
  const [activeWd, setActiveWd] = useState<AdminWithdrawal | null>(null)
  const [wdNote, setWdNote] = useState('')
  const [processing, setProcessing] = useState(false)

  const fetchTransactions = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await admin.transactions({
        type: txType || undefined,
        status: txStatus || undefined,
        q: txQ || undefined,
        page: txPage,
      })
      setTransactions(res.data)
      setTxMeta(res.meta)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Gagal memuat transaksi.'))
    } finally {
      setLoading(false)
    }
  }, [txType, txStatus, txQ, txPage])

  const fetchWithdrawals = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await admin.withdrawals({
        status: wdStatus || undefined,
        q: wdQ || undefined,
        page: wdPage,
      })
      setWithdrawals(res.data)
      setWdMeta(res.meta)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Gagal memuat penarikan.'))
    } finally {
      setLoading(false)
    }
  }, [wdStatus, wdQ, wdPage])

  useEffect(() => {
    if (tab === 'transactions') fetchTransactions()
    else fetchWithdrawals()
  }, [tab, fetchTransactions, fetchWithdrawals])

  const openWithdrawal = (w: AdminWithdrawal) => {
    setActiveWd(w)
    setWdNote(w.admin_note ?? '')
  }

  const processWithdrawal = async (status: WithdrawalStatus) => {
    if (!activeWd) return
    setProcessing(true)
    setNotice('')
    try {
      const updated = await admin.handleWithdrawal(activeWd.id, {
        status,
        admin_note: wdNote.trim() || undefined,
      })
      setWithdrawals((list) => list.map((w) => (w.id === updated.id ? updated : w)))
      setNotice(
        status === 'paid'
          ? `Penarikan ${formatRupiah(updated.amount)} ditandai dibayar.`
          : status === 'approved'
            ? 'Penarikan disetujui.'
            : 'Penarikan ditolak.',
      )
      setActiveWd(null)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Gagal memproses penarikan.'))
      setActiveWd(null)
    } finally {
      setProcessing(false)
    }
  }

  const selectCls =
    'rounded-xl border border-surface-800 bg-surface-900 px-3 py-2 text-sm text-surface-200 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30'

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Transaksi & Penarikan"
        subtitle="Pantau arus keuangan platform dan proses penarikan dana creator"
      />

      {/* Tabs */}
      <div className="mb-5 flex gap-2">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => {
              setTab(key)
              setError('')
            }}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all ${
              tab === key
                ? 'bg-gradient-to-r from-brand-600 to-pink-600 text-white shadow-lg shadow-brand-600/25'
                : 'border border-surface-800 bg-surface-900 text-surface-300 hover:border-brand-500/50 hover:text-surface-50'
            }`}
          >
            <Icon size={15} /> {label}
          </button>
        ))}
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

      {tab === 'transactions' ? (
        <>
          {/* Filter transaksi */}
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                setTxPage(1)
              }}
              className="relative"
            >
              <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-surface-500" />
              <input
                value={txQ}
                onChange={(e) => setTxQ(e.target.value)}
                placeholder="Cari referensi / pengguna…"
                className="w-64 max-w-full rounded-xl border border-surface-800 bg-surface-900 py-2 pl-9 pr-4 text-sm text-surface-100 placeholder:text-surface-500 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
              />
            </form>
            <select value={txType} onChange={(e) => { setTxType(e.target.value as '' | TransactionType); setTxPage(1) }} className={selectCls}>
              <option value="">Semua Tipe</option>
              <option value="coin_purchase">Top-Up Koin</option>
              <option value="episode_unlock">Unlock Episode</option>
              <option value="earning">Earning</option>
              <option value="withdrawal">Penarikan</option>
            </select>
            <select value={txStatus} onChange={(e) => { setTxStatus(e.target.value as '' | TransactionStatus); setTxPage(1) }} className={selectCls}>
              <option value="">Semua Status</option>
              <option value="success">Berhasil</option>
              <option value="pending">Menunggu</option>
              <option value="failed">Gagal</option>
              <option value="refunded">Dikembalikan</option>
            </select>
          </div>

          <div className="overflow-hidden rounded-2xl border border-surface-800 bg-surface-900">
            {loading ? (
              <div className="flex items-center justify-center py-20 text-surface-500">
                <Loader2 size={20} className="mr-2 animate-spin" /> Memuat transaksi…
              </div>
            ) : transactions.length === 0 ? (
              <div className="p-6">
                <EmptyState message="Tidak ada transaksi yang cocok dengan filter." />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[880px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-surface-800 text-xs uppercase tracking-wide text-surface-500">
                      <th className="px-5 py-3 font-medium">Referensi</th>
                      <th className="px-5 py-3 font-medium">Pengguna</th>
                      <th className="px-5 py-3 font-medium">Tipe</th>
                      <th className="px-5 py-3 text-right font-medium">Jumlah</th>
                      <th className="px-5 py-3 font-medium">Status</th>
                      <th className="px-5 py-3 font-medium">Tanggal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-800/60">
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="transition-colors hover:bg-surface-800/30">
                        <td className="px-5 py-3.5">
                          <p className="font-mono text-xs text-surface-300">{tx.reference}</p>
                          {tx.episode && (
                            <p className="mt-0.5 max-w-56 truncate text-xs text-surface-500">
                              {tx.episode.comic_title} · Eps {tx.episode.number}
                            </p>
                          )}
                        </td>
                        <td className="px-5 py-3.5">
                          {tx.user ? (
                            <div className="flex items-center gap-2.5">
                              <Avatar name={tx.user.name} avatarUrl={tx.user.avatar_url} size={30} className="rounded-full" />
                              <div>
                                <p className="text-surface-200">{tx.user.name}</p>
                                <p className="text-xs text-surface-500">@{tx.user.username}</p>
                              </div>
                            </div>
                          ) : (
                            <span className="text-surface-500">—</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-surface-300">{txTypeLabel[tx.type]}</td>
                        <td className="px-5 py-3.5 text-right">
                          {tx.type === 'coin_purchase' ? (
                            <span className="flex items-center justify-end gap-1 font-semibold text-amber-300">
                              <Coins size={13} /> {formatNumber(tx.coins)}
                            </span>
                          ) : tx.type === 'episode_unlock' ? (
                            <span className="font-semibold text-brand-300">{formatRupiah(tx.amount)}</span>
                          ) : (
                            <span className="font-semibold text-surface-200">{formatRupiah(tx.amount)}</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5">
                          <Badge tone={txStatusTone[tx.status]}>{tx.status}</Badge>
                        </td>
                        <td className="px-5 py-3.5 text-xs text-surface-400">{formatDate(tx.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          {!loading && transactions.length > 0 && <Pagination meta={txMeta} onPageChange={setTxPage} />}
        </>
      ) : (
        <>
          {/* Filter penarikan */}
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                setWdPage(1)
              }}
              className="relative"
            >
              <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-surface-500" />
              <input
                value={wdQ}
                onChange={(e) => setWdQ(e.target.value)}
                placeholder="Cari nama creator…"
                className="w-64 max-w-full rounded-xl border border-surface-800 bg-surface-900 py-2 pl-9 pr-4 text-sm text-surface-100 placeholder:text-surface-500 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
              />
            </form>
            <select value={wdStatus} onChange={(e) => { setWdStatus(e.target.value as '' | WithdrawalStatus); setWdPage(1) }} className={selectCls}>
              <option value="">Semua Status</option>
              <option value="pending">Menunggu</option>
              <option value="approved">Disetujui</option>
              <option value="rejected">Ditolak</option>
              <option value="paid">Dibayar</option>
            </select>
          </div>

          <div className="overflow-hidden rounded-2xl border border-surface-800 bg-surface-900">
            {loading ? (
              <div className="flex items-center justify-center py-20 text-surface-500">
                <Loader2 size={20} className="mr-2 animate-spin" /> Memuat penarikan…
              </div>
            ) : withdrawals.length === 0 ? (
              <div className="p-6">
                <EmptyState message="Tidak ada penarikan yang cocok dengan filter." />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[880px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-surface-800 text-xs uppercase tracking-wide text-surface-500">
                      <th className="px-5 py-3 font-medium">Creator</th>
                      <th className="px-5 py-3 text-right font-medium">Nominal</th>
                      <th className="px-5 py-3 font-medium">Rekening</th>
                      <th className="px-5 py-3 font-medium">Status</th>
                      <th className="px-5 py-3 font-medium">Diajukan</th>
                      <th className="px-5 py-3 text-right font-medium">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-800/60">
                    {withdrawals.map((w) => (
                      <tr key={w.id} className="transition-colors hover:bg-surface-800/30">
                        <td className="px-5 py-3.5">
                          {w.creator ? (
                            <div className="flex items-center gap-2.5">
                              <Avatar name={w.creator.name} avatarUrl={w.creator.avatar_url} size={30} className="rounded-full" />
                              <div>
                                <p className="text-surface-200">{w.creator.name}</p>
                                <p className="text-xs text-surface-500">@{w.creator.username}</p>
                              </div>
                            </div>
                          ) : (
                            <span className="text-surface-500">—</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-right font-semibold text-emerald-300">{formatRupiah(w.amount)}</td>
                        <td className="px-5 py-3.5">
                          <p className="text-surface-200">{w.bank_name}</p>
                          <p className="text-xs text-surface-500">{w.bank_account} · {w.bank_holder}</p>
                        </td>
                        <td className="px-5 py-3.5">
                          <Badge tone={wdStatusTone[w.status]}>{wdStatusLabel[w.status]}</Badge>
                        </td>
                        <td className="px-5 py-3.5 text-xs text-surface-400">{formatDate(w.created_at)}</td>
                        <td className="px-5 py-3.5 text-right">
                          {w.status === 'pending' ? (
                            <button
                              onClick={() => openWithdrawal(w)}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-brand-600 to-pink-600 px-3 py-1.5 text-xs font-semibold text-white shadow-lg shadow-brand-600/25 transition-all hover:brightness-110"
                            >
                              <ShieldCheck size={14} /> Proses
                            </button>
                          ) : (
                            <span className="text-xs text-surface-600">
                              {w.processed_at ? formatDate(w.processed_at) : '—'}
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
          {!loading && withdrawals.length > 0 && <Pagination meta={wdMeta} onPageChange={setWdPage} />}
        </>
      )}

      {/* ====== Modal proses penarikan ====== */}
      {activeWd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={processing ? undefined : () => setActiveWd(null)} />
          <div className="relative max-h-[90vh] w-full max-w-md animate-slide-up overflow-y-auto rounded-2xl border border-surface-800 bg-surface-900 p-6 shadow-2xl shadow-black/60">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="flex items-center gap-2 font-display text-lg font-bold text-surface-50">
                  <Banknote size={18} className="text-emerald-300" /> Proses Penarikan
                </h3>
                <p className="mt-1 text-xs text-surface-500">
                  {activeWd.creator?.name ?? 'Creator'} · {activeWd.bank_name} {activeWd.bank_account}
                </p>
              </div>
              <button
                onClick={() => setActiveWd(null)}
                disabled={processing}
                className="rounded-lg p-1.5 text-surface-400 transition-colors hover:bg-surface-800 hover:text-surface-50"
                aria-label="Tutup"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-4 rounded-xl border border-surface-800 bg-surface-950 p-4 text-center">
              <p className="text-xs uppercase tracking-wide text-surface-500">Nominal Penarikan</p>
              <p className="mt-1 font-display text-3xl font-bold text-emerald-300">{formatRupiah(activeWd.amount)}</p>
              <p className="mt-1 text-xs text-surface-500">
                ke {activeWd.bank_holder} · {activeWd.bank_account}
              </p>
            </div>

            <div className="mt-4">
              <label className="mb-1.5 block text-sm font-medium text-surface-200">Catatan Admin (opsional)</label>
              <textarea
                value={wdNote}
                onChange={(e) => setWdNote(e.target.value)}
                rows={3}
                placeholder="Contoh: transfer via BCA, bukti terkirim…"
                className="w-full resize-none rounded-xl border border-surface-800 bg-surface-950 px-4 py-3 text-sm text-surface-100 placeholder:text-surface-500 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
              />
            </div>

            <div className="mt-6 space-y-2.5">
              <button
                onClick={() => processWithdrawal('approved')}
                disabled={processing}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-sky-600/25 transition-all hover:brightness-110 disabled:opacity-60"
              >
                {processing ? <Loader2 size={15} className="animate-spin" /> : <Clock size={15} />}
                Setujui — Menunggu Transfer
              </button>
              <button
                onClick={() => processWithdrawal('paid')}
                disabled={processing}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/25 transition-all hover:brightness-110 disabled:opacity-60"
              >
                {processing ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}
                Tandai Dibayar
              </button>
              <button
                onClick={() => processWithdrawal('rejected')}
                disabled={processing}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/40 bg-red-500/10 py-2.5 text-sm font-semibold text-red-300 transition-colors hover:bg-red-500/20 disabled:opacity-60"
              >
                {processing ? <Loader2 size={15} className="animate-spin" /> : <XCircle size={15} />}
                Tolak Penarikan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

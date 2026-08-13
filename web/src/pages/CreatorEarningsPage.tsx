import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertCircle,
  ArrowRight,
  BadgeCheck,
  Banknote,
  CheckCircle2,
  Clock,
  Coins,
  Landmark,
  Loader2,
  Lock,
  LogIn,
  TrendingUp,
  Wallet,
  XCircle,
} from 'lucide-react'
import PageHeader from '../components/admin/PageHeader'
import EmptyState from '../components/admin/EmptyState'
import Pagination from '../components/admin/Pagination'
import { Badge } from '../components/admin/Badge'
import { auth } from '../services/auth'
import { monetization } from '../services/monetization'
import { getApiErrorMessage } from '../utils/errors'
import { formatDate, formatRupiah } from '../utils/format'
import type { CreatorEarning, EarningsSummary, Withdrawal } from '../types'

/** Batas atas nominal penarikan (sama dengan validasi backend). */
const MAX_WITHDRAWAL = 100_000_000

const earningTone: Record<CreatorEarning['status'], 'amber' | 'green'> = {
  pending: 'amber',
  paid: 'green',
}

const withdrawalTone: Record<Withdrawal['status'], 'amber' | 'blue' | 'red' | 'green'> = {
  pending: 'amber',
  approved: 'blue',
  rejected: 'red',
  paid: 'green',
}

const withdrawalLabel: Record<Withdrawal['status'], string> = {
  pending: 'Menunggu',
  approved: 'Disetujui',
  rejected: 'Ditolak',
  paid: 'Dibayar',
}

export default function CreatorEarningsPage() {
  const [user] = useState(() => auth.getStoredUser())
  const [summary, setSummary] = useState<EarningsSummary | null>(null)
  const [earnings, setEarnings] = useState<CreatorEarning[]>([])
  const [earningsMeta, setEarningsMeta] = useState({ current_page: 1, last_page: 1, total: 0 })
  const [earningsPage, setEarningsPage] = useState(1)
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [withdrawalsMeta, setWithdrawalsMeta] = useState({ current_page: 1, last_page: 1, total: 0 })
  const [withdrawalsPage, setWithdrawalsPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  // Form penarikan
  const [amount, setAmount] = useState('')
  const [bankName, setBankName] = useState('')
  const [bankAccount, setBankAccount] = useState('')
  const [bankHolder, setBankHolder] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  const fetchAll = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [earningsRes, withdrawalsRes] = await Promise.all([
        monetization.earnings(earningsPage),
        monetization.withdrawals(withdrawalsPage),
      ])
      setSummary(earningsRes.summary)
      setEarnings(earningsRes.earnings)
      setEarningsMeta(earningsRes.meta)
      setWithdrawals(withdrawalsRes.data)
      setWithdrawalsMeta(withdrawalsRes.meta)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Gagal memuat data penghasilan.'))
    } finally {
      setLoading(false)
    }
  }, [earningsPage, withdrawalsPage])

  useEffect(() => {
    if (user) fetchAll()
  }, [user, fetchAll])

  if (!user) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-500/15 text-brand-300">
          <Banknote size={30} />
        </span>
        <h1 className="mt-5 font-display text-2xl font-bold text-surface-50">Masuk untuk Melihat Penghasilan</h1>
        <p className="mt-2 text-sm text-surface-400">
          Masuk ke akun creator COMIKA untuk memantau pendapatan dan mengajukan penarikan dana.
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

  if (user.role !== 'creator') {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-300">
          <Lock size={30} />
        </span>
        <h1 className="mt-5 font-display text-2xl font-bold text-surface-50">Khusus Creator</h1>
        <p className="mt-2 text-sm text-surface-400">
          Halaman penghasilan & penarikan dana hanya tersedia untuk akun dengan peran creator.
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

  const available = summary?.available ?? 0
  const amountNumber = Number(amount) || 0

  const submitWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    setNotice('')
    if (amountNumber <= 0) {
      setFormError('Nominal penarikan harus lebih dari 0.')
      return
    }
    if (amountNumber > MAX_WITHDRAWAL) {
      setFormError('Nominal penarikan maksimal Rp100.000.000.')
      return
    }
    if (amountNumber > available) {
      setFormError('Nominal melebihi saldo yang tersedia.')
      return
    }
    if (!bankName.trim() || !bankAccount.trim() || !bankHolder.trim()) {
      setFormError('Lengkapi data rekening tujuan terlebih dahulu.')
      return
    }
    setSubmitting(true)
    try {
      await monetization.requestWithdrawal({
        amount: amountNumber,
        bank_name: bankName.trim(),
        bank_account: bankAccount.trim(),
        bank_holder: bankHolder.trim(),
      })
      setNotice('Permintaan penarikan diajukan. Menunggu persetujuan admin.')
      setAmount('')
      await fetchAll()
    } catch (err) {
      setFormError(getApiErrorMessage(err, 'Gagal mengajukan penarikan.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-7xl animate-fade-in px-4 py-10 sm:px-6">
      <PageHeader
        title="Penghasilan & Penarikan"
        subtitle="Pantau pendapatan dari unlock episode premium dan tarik dana ke rekening Anda"
      />

      {error && (
        <div className="mb-6 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-300">
          <AlertCircle size={16} /> {error}
        </div>
      )}
      {notice && (
        <div className="mb-6 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-300">
          <CheckCircle2 size={16} /> {notice}
        </div>
      )}

      {/* ====== Summary cards ====== */}
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <div className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-900/50 via-surface-900 to-surface-900 p-5">
          <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-emerald-500/15 blur-2xl" />
          <p className="flex items-center gap-1.5 text-xs font-medium text-emerald-200">
            <Wallet size={13} /> Saldo Tersedia
          </p>
          <p className="mt-2 font-display text-2xl font-bold text-surface-50">{loading ? '…' : formatRupiah(available)}</p>
          <p className="mt-1 text-[11px] text-surface-400">Bisa ditarik sekarang</p>
        </div>

        <div className="rounded-2xl border border-surface-800 bg-surface-900 p-5">
          <p className="flex items-center gap-1.5 text-xs font-medium text-brand-200">
            <TrendingUp size={13} /> Total Pendapatan
          </p>
          <p className="mt-2 font-display text-2xl font-bold text-surface-50">{loading ? '…' : formatRupiah(summary?.total ?? 0)}</p>
          <p className="mt-1 text-[11px] text-surface-400">Menunggu + dibayar</p>
        </div>

        <div className="rounded-2xl border border-surface-800 bg-surface-900 p-5">
          <p className="flex items-center gap-1.5 text-xs font-medium text-amber-200">
            <Clock size={13} /> Menunggu
          </p>
          <p className="mt-2 font-display text-2xl font-bold text-surface-50">{loading ? '…' : formatRupiah(summary?.pending ?? 0)}</p>
          <p className="mt-1 text-[11px] text-surface-400">Earning belum dibayar</p>
        </div>

        <div className="rounded-2xl border border-surface-800 bg-surface-900 p-5">
          <p className="flex items-center gap-1.5 text-xs font-medium text-emerald-200">
            <CheckCircle2 size={13} /> Dibayar
          </p>
          <p className="mt-2 font-display text-2xl font-bold text-surface-50">{loading ? '…' : formatRupiah(summary?.paid ?? 0)}</p>
          <p className="mt-1 text-[11px] text-surface-400">Sudah masuk rekening</p>
        </div>

        <div className="rounded-2xl border border-surface-800 bg-surface-900 p-5">
          <p className="flex items-center gap-1.5 text-xs font-medium text-sky-200">
            <Landmark size={13} /> Dalam Proses
          </p>
          <p className="mt-2 font-display text-2xl font-bold text-surface-50">
            {loading ? '…' : formatRupiah(summary?.pending_withdrawals ?? 0)}
          </p>
          <p className="mt-1 text-[11px] text-surface-400">Penarikan menunggu/diajukan</p>
        </div>
      </section>

      {/* ====== Withdrawal form + info ====== */}
      <section className="mt-8 grid gap-6 lg:grid-cols-5">
        {/* Form */}
        <div className="lg:col-span-3">
          <div className="rounded-2xl border border-surface-800 bg-surface-900 p-6">
            <h2 className="flex items-center gap-2 font-display text-lg font-bold text-surface-50">
              <Banknote size={18} className="text-emerald-300" /> Ajukan Penarikan Dana
            </h2>
            <p className="mt-1 text-sm text-surface-400">
              Dana masuk ke rekening Anda setelah disetujui admin (1–3 hari kerja).
            </p>

            <form onSubmit={submitWithdrawal} className="mt-5 space-y-4">
              <div>
                <label htmlFor="wd-amount" className="mb-1.5 block text-sm font-medium text-surface-200">Nominal (Rp)</label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-surface-500">Rp</span>
                  <input
                    id="wd-amount"
                    name="amount"
                    type="text"
                    inputMode="numeric"
                    value={amount ? amountNumber.toLocaleString('id-ID') : ''}
                    onChange={(e) => {
                      setAmount(e.target.value.replace(/[^\d]/g, ''))
                      setFormError('')
                    }}
                    placeholder="0"
                    className="w-full rounded-xl border border-surface-800 bg-surface-950 py-3 pl-10 pr-4 text-sm font-semibold text-surface-100 placeholder:text-surface-500 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                  />
                </div>
                <p className="mt-1 text-xs text-surface-500">
                  Saldo tersedia: <span className="font-semibold text-emerald-300">{formatRupiah(available)}</span>
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="wd-bank" className="mb-1.5 block text-sm font-medium text-surface-200">Nama Bank</label>
                  <input
                    id="wd-bank"
                    name="bank_name"
                    value={bankName}
                    onChange={(e) => {
                      setBankName(e.target.value)
                      setFormError('')
                    }}
                    placeholder="BCA, Mandiri, BRI…"
                    className="w-full rounded-xl border border-surface-800 bg-surface-950 px-4 py-3 text-sm text-surface-100 placeholder:text-surface-500 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                  />
                </div>
                <div>
                  <label htmlFor="wd-account" className="mb-1.5 block text-sm font-medium text-surface-200">Nomor Rekening</label>
                  <input
                    id="wd-account"
                    name="bank_account"
                    value={bankAccount}
                    onChange={(e) => {
                      setBankAccount(e.target.value)
                      setFormError('')
                    }}
                    placeholder="1234567890"
                    inputMode="numeric"
                    className="w-full rounded-xl border border-surface-800 bg-surface-950 px-4 py-3 text-sm text-surface-100 placeholder:text-surface-500 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="wd-holder" className="mb-1.5 block text-sm font-medium text-surface-200">Nama Pemilik Rekening</label>
                <input
                  id="wd-holder"
                  name="bank_holder"
                  value={bankHolder}
                  onChange={(e) => {
                    setBankHolder(e.target.value)
                    setFormError('')
                  }}
                  placeholder="Sesuai nama di rekening"
                  className="w-full rounded-xl border border-surface-800 bg-surface-950 px-4 py-3 text-sm text-surface-100 placeholder:text-surface-500 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                />
              </div>

              {formError && (
                <p className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-2.5 text-sm text-red-300">
                  <AlertCircle size={15} /> {formError}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting || available <= 0}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/25 transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:px-8"
              >
                {submitting ? <Loader2 size={16} className="animate-spin" /> : <Banknote size={16} />}
                {submitting ? 'Mengajukan…' : 'Ajukan Penarikan'}
              </button>
              {available <= 0 && !loading && (
                <p className="flex items-center gap-1.5 text-xs text-surface-500">
                  <Coins size={13} /> Belum ada saldo tersedia. Earning muncul saat reader meng-unlock episode premium Anda.
                </p>
              )}
            </form>
          </div>
        </div>

        {/* Info side */}
        <div className="lg:col-span-2">
          <div className="flex h-full flex-col gap-4">
            <div className="rounded-2xl border border-brand-500/25 bg-brand-500/5 p-5 text-sm text-surface-300">
              <h3 className="flex items-center gap-2 font-display text-base font-bold text-brand-200">
                <BadgeCheck size={17} /> Cara kerja
              </h3>
              <ul className="mt-3 space-y-2.5 text-sm">
                <li className="flex gap-2">
                  <span className="text-brand-300">1.</span>
                  Reader meng-unlock episode premium Anda (60% nilai unlock untuk Anda).
                </li>
                <li className="flex gap-2">
                  <span className="text-brand-300">2.</span>
                  Earning masuk status <Badge tone="amber">menunggu</Badge> dan jadi saldo tersedia.
                </li>
                <li className="flex gap-2">
                  <span className="text-brand-300">3.</span>
                  Ajukan penarikan — admin setujui lalu dana dibayar ke rekening Anda.
                </li>
              </ul>
            </div>
            <div className="flex items-start gap-3 rounded-2xl border border-surface-800 bg-surface-900/60 p-5 text-xs text-surface-400">
              <Landmark size={16} className="mt-0.5 shrink-0 text-surface-500" />
              <p>
                Penarikan memakai alur manual admin (MVP). Status <span className="font-medium text-sky-300">Disetujui</span>{' '}
                berarti menunggu transfer, <span className="font-medium text-emerald-300">Dibayar</span> berarti dana sudah
                dikirim.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ====== Earnings history ====== */}
      <section className="mt-10">
        <h2 className="font-display text-xl font-bold text-surface-50">Riwayat Earning</h2>
        <div className="mt-4 overflow-hidden rounded-2xl border border-surface-800 bg-surface-900">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-surface-500">
              <Loader2 size={20} className="mr-2 animate-spin" /> Memuat earning…
            </div>
          ) : earnings.length === 0 ? (
            <div className="p-6">
              <EmptyState message="Belum ada earning. Earning muncul saat reader meng-unlock episode premium Anda." />
            </div>
          ) : (
            <ul className="divide-y divide-surface-800/60">
              {earnings.map((e) => (
                <li key={e.id} className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-surface-800/30">
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                      e.status === 'paid' ? 'bg-emerald-500/15 text-emerald-300' : 'bg-amber-500/15 text-amber-300'
                    }`}
                  >
                    {e.status === 'paid' ? <CheckCircle2 size={18} /> : <Clock size={18} />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-surface-100">
                      {e.episode.comic_title} <span className="font-normal text-surface-400">· Eps {e.episode.number}</span>
                    </p>
                    <p className="text-xs text-surface-500">
                      {formatDate(e.created_at)}
                      {e.reference && <> · {e.reference}</>}
                    </p>
                  </div>
                  <Badge tone={earningTone[e.status]}>{e.status === 'paid' ? 'Dibayar' : 'Menunggu'}</Badge>
                  <p className="shrink-0 text-sm font-semibold text-emerald-300">+{formatRupiah(e.amount)}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
        {!loading && earnings.length > 0 && <Pagination meta={earningsMeta} onPageChange={setEarningsPage} />}
      </section>

      {/* ====== Withdrawals history ====== */}
      <section className="mt-10">
        <h2 className="font-display text-xl font-bold text-surface-50">Riwayat Penarikan</h2>
        <div className="mt-4 overflow-hidden rounded-2xl border border-surface-800 bg-surface-900">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-surface-500">
              <Loader2 size={20} className="mr-2 animate-spin" /> Memuat penarikan…
            </div>
          ) : withdrawals.length === 0 ? (
            <div className="p-6">
              <EmptyState message="Belum ada penarikan. Ajukan penarikan pertama Anda di atas." />
            </div>
          ) : (
            <ul className="divide-y divide-surface-800/60">
              {withdrawals.map((w) => (
                <li key={w.id} className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-surface-800/30">
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                      w.status === 'paid'
                        ? 'bg-emerald-500/15 text-emerald-300'
                        : w.status === 'rejected'
                          ? 'bg-red-500/15 text-red-300'
                          : w.status === 'approved'
                            ? 'bg-sky-500/15 text-sky-300'
                            : 'bg-amber-500/15 text-amber-300'
                    }`}
                  >
                    {w.status === 'paid' ? (
                      <CheckCircle2 size={18} />
                    ) : w.status === 'rejected' ? (
                      <XCircle size={18} />
                    ) : (
                      <Clock size={18} />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-surface-100">
                      {formatRupiah(w.amount)}
                      <span className="ml-2 font-normal text-surface-400">
                        {w.bank_name} · {w.bank_account} ({w.bank_holder})
                      </span>
                    </p>
                    <p className="text-xs text-surface-500">
                      {formatDate(w.created_at)}
                      {w.processed_at && <> · diproses {formatDate(w.processed_at)}</>}
                      {w.admin_note && <span className="text-surface-400"> · {w.admin_note}</span>}
                    </p>
                  </div>
                  <Badge tone={withdrawalTone[w.status]}>{withdrawalLabel[w.status]}</Badge>
                </li>
              ))}
            </ul>
          )}
        </div>
        {!loading && withdrawals.length > 0 && <Pagination meta={withdrawalsMeta} onPageChange={setWithdrawalsPage} />}
      </section>

      {/* ====== Info ====== */}
      <section className="mt-10 flex items-start gap-3 rounded-2xl border border-surface-800 bg-surface-900/50 p-5 text-sm text-surface-400">
        <ArrowRight size={18} className="mt-0.5 shrink-0 text-brand-300" />
        <p>
          Creator menerima <span className="font-semibold text-surface-200">60%</span> dari setiap unlock episode premium.
          Pembayaran penarikan dilakukan manual oleh admin pada rilis MVP ini.
        </p>
      </section>
    </div>
  )
}

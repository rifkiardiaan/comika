import { useCallback, useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  AlertCircle,
  Banknote,
  CheckCircle2,
  Coins,
  CreditCard,
  Landmark,
  Loader2,
  Lock,
  RefreshCw,
  Wallet,
  XCircle,
} from 'lucide-react'
import PageHeader from '../components/admin/PageHeader'
import EmptyState from '../components/admin/EmptyState'
import Pagination from '../components/admin/Pagination'
import { Badge } from '../components/admin/Badge'
import { auth } from '../services/auth'
import { monetization } from '../services/monetization'
import { loadSnapSdk, openSnapPayment, midtrans } from '../services/midtrans'
import { getApiErrorMessage } from '../utils/errors'
import { formatDate, formatRupiah } from '../utils/format'
import type { CoinPackage, EarningsSummary, Transaction, TransactionStatus, TransactionType, WalletSummary } from '../types'

const statusTone: Record<TransactionStatus, 'green' | 'red' | 'amber' | 'slate'> = {
  success: 'green',
  failed: 'red',
  pending: 'amber',
  refunded: 'slate',
}

const typeLabel: Record<TransactionType, string> = {
  coin_purchase: 'Top-Up Koin',
  episode_unlock: 'Unlock Episode',
  earning: 'Earning',
  withdrawal: 'Penarikan',
}

// Client key dari .env (sandbox untuk development)
const MIDTRANS_CLIENT_KEY = import.meta.env.VITE_MIDTRANS_CLIENT_KEY || ''
const MIDTRANS_IS_PRODUCTION = import.meta.env.VITE_MIDTRANS_IS_PRODUCTION === 'true'

export default function WalletPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [user] = useState(() => auth.getStoredUser())
  const [wallet, setWallet] = useState<WalletSummary | null>(null)
  const [packages, setPackages] = useState<CoinPackage[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [txMeta, setTxMeta] = useState({ current_page: 1, last_page: 1, total: 0 })
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  // Purchase state
  const [purchasingId, setPurchasingId] = useState<number | null>(null)

  // Affiliate transfer state
  const [affiliateSummary, setAffiliateSummary] = useState<EarningsSummary | null>(null)
  const [transferAmount, setTransferAmount] = useState('')
  const [transferLoading, setTransferLoading] = useState(false)
  const [transferError, setTransferError] = useState('')
  const [transferNotice, setTransferNotice] = useState('')

  // Load Midtrans Snap SDK
  useEffect(() => {
    if (MIDTRANS_CLIENT_KEY) {
      loadSnapSdk(MIDTRANS_CLIENT_KEY, MIDTRANS_IS_PRODUCTION).catch(() => {
        console.warn('Gagal memuat Midtrans Snap SDK')
      })
    }
  }, [])

  const fetchAll = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [walletData, packagesData, txRes] = await Promise.all([
        monetization.wallet(),
        monetization.packages(),
        monetization.transactions(page),
      ])
      setWallet(walletData)
      setPackages(packagesData)
      setTransactions(txRes.data)
      setTxMeta(txRes.meta)

      // Sinkronkan saldo di data user tersimpan (navbar)
      if (walletData.balance !== user?.coin_balance) {
        auth.setSession(auth.getToken() ?? '', { ...user!, coin_balance: walletData.balance })
      }
    } catch (err) {
      setError(getApiErrorMessage(err, 'Gagal memuat data dompet.'))
    } finally {
      setLoading(false)
    }
  }, [page, user])

  // Handle payment result dari URL params
  useEffect(() => {
    const paymentStatus = searchParams.get('payment')
    if (paymentStatus === 'success') {
      setNotice('Pembayaran berhasil! Koin telah ditambahkan ke dompet Anda.')
      fetchAll()
      setSearchParams({}, { replace: true })
    } else if (paymentStatus === 'pending') {
      setNotice('Pembayaran sedang diproses. Koin akan ditambahkan setelah pembayaran dikonfirmasi.')
      fetchAll()
      setSearchParams({}, { replace: true })
    } else if (paymentStatus === 'error') {
      setError('Pembayaran gagal atau dibatalkan.')
      setSearchParams({}, { replace: true })
    }
  }, [searchParams, setSearchParams, fetchAll])

  // Fetch affiliate summary (only for creators)
  const fetchAffiliateSummary = useCallback(async () => {
    if (user?.role !== 'creator') return
    try {
      const res = await monetization.earnings(1)
      setAffiliateSummary(res.summary)
    } catch {
      // abaikan
    }
  }, [user])

  useEffect(() => {
    if (user) {
      fetchAll()
      fetchAffiliateSummary()
    }
  }, [user, fetchAll, fetchAffiliateSummary])

  if (!user) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-500/15 text-brand-300">
          <Wallet size={30} />
        </span>
        <h1 className="mt-5 font-display text-2xl font-bold text-surface-50">Masuk untuk Mengakses Dompet</h1>
        <p className="mt-2 text-sm text-surface-400">
          Masuk ke akun COMIKA untuk membeli koin dan meng-unlock episode premium.
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

  /**
   * Verifikasi pembayaran ke backend setelah Snap SDK callback.
   * Polls beberapa kali untuk memastikan transaksi diproses.
   */
  const verifyAndRefresh = async (orderId: string, maxRetries = 5) => {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const result = await midtrans.verifyPayment(orderId)
        if (result.coins_credited || result.status === 'success') {
          await fetchAll()
          return true
        }
        if (result.status === 'failed') {
          return false
        }
        // Status masih pending — tunggu sebentar lalu coba lagi
        await new Promise((r) => setTimeout(r, 2000))
      } catch {
        // Error — coba lagi
        await new Promise((r) => setTimeout(r, 2000))
      }
    }
    // Semua retry gagal — tetap refresh data
    await fetchAll()
    return false
  }

  const handlePurchase = async (pkg: CoinPackage) => {
    setPurchasingId(pkg.id)
    setError('')
    setNotice('')

    try {
      // Dapatkan Snap Token dari backend
      const result = await midtrans.getCoinPackageSnapToken(pkg.id)

      if (!MIDTRANS_CLIENT_KEY) {
        // Fallback jika Snap SDK belum dikonfigurasi
        setError('Midtrans belum dikonfigurasi. Hubungi admin.')
        setPurchasingId(null)
        return
      }

      // Buka Midtrans Snap payment popup
      openSnapPayment(result.snap_token, {
        onSuccess: async () => {
          setNotice('Memverifikasi pembayaran...')
          const verified = await verifyAndRefresh(result.order_id)
          if (verified) {
            setNotice(`Pembayaran berhasil! ${pkg.coins.toLocaleString('id-ID')} koin telah ditambahkan ke dompet Anda.`)
          } else {
            setNotice('Pembayaran berhasil diproses. Koin akan ditambahkan segera.')
          }
        },
        onPending: async () => {
          setNotice('Pembayaran sedang diproses. Memverifikasi...')
          const verified = await verifyAndRefresh(result.order_id)
          if (verified) {
            setNotice(`Pembayaran berhasil! ${pkg.coins.toLocaleString('id-ID')} koin telah ditambahkan ke dompet Anda.`)
          } else {
            setNotice('Pembayaran sedang diproses. Koin akan ditambahkan setelah pembayaran dikonfirmasi.')
          }
        },
        onError: () => {
          setError('Pembayaran gagal. Silakan coba lagi.')
        },
        onClose: () => {
          // User tutup popup tanpa bayar — tidak perlu action
        },
      })
    } catch (err) {
      setError(getApiErrorMessage(err, 'Gagal membeli koin.'))
    } finally {
      setPurchasingId(null)
    }
  }

  const handleTransferFromAffiliate = async (e: React.FormEvent) => {
    e.preventDefault()
    setTransferError('')
    setTransferNotice('')

    const amount = Number(transferAmount.replace(/\D/g, '')) || 0

    if (amount <= 0) {
      setTransferError('Nominal harus lebih dari 0.')
      return
    }

    if (amount > (affiliateSummary?.available ?? 0)) {
      setTransferError('Saldo affiliate tidak mencukupi.')
      return
    }

    setTransferLoading(true)
    try {
      const result = await monetization.transferToWallet(amount)
      setTransferNotice(
        `Berhasil transfer ${result.coins_added.toLocaleString('id-ID')} koin dari saldo affiliate ke dompet.`,
      )
      setTransferAmount('')
      await fetchAll()
      await fetchAffiliateSummary()
    } catch (err) {
      setTransferError(getApiErrorMessage(err, 'Gagal transfer dari affiliate.'))
    } finally {
      setTransferLoading(false)
    }
  }

  const transferAmountNumber = Number(transferAmount.replace(/\D/g, '')) || 0
  const transferCoins = Math.floor(transferAmountNumber / 100)

  return (
    <div className="mx-auto max-w-7xl animate-fade-in px-4 py-10 sm:px-6">
      <PageHeader
        title="Dompet Koin"
        subtitle="Kelola saldo koin, top-up, dan riwayat transaksi Anda"
      />

      {/* Balance card */}
      <section className="relative overflow-hidden rounded-3xl border border-brand-500/30 bg-gradient-to-br from-brand-900/60 via-surface-900 to-pink-900/40 p-8">
        <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-brand-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-10 left-24 h-40 w-40 rounded-full bg-pink-500/15 blur-3xl" />

        <div className="relative flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="flex items-center gap-2 text-sm font-medium text-brand-200">
              <Wallet size={16} /> Saldo Koin
            </p>
            <p className="mt-2 flex items-center gap-3 font-display text-5xl font-bold text-surface-50">
              <Coins size={34} className="text-amber-400" />
              {wallet ? wallet.balance.toLocaleString('id-ID') : '…'}
            </p>
            <p className="mt-2 text-xs text-surface-400">
              Gunakan koin untuk membuka episode premium favorit Anda
            </p>
          </div>

          <div className="flex gap-6 text-center sm:text-left">
            <div>
              <p className="font-display text-xl font-bold text-surface-50">
                {wallet ? wallet.unlocks_count.toLocaleString('id-ID') : '…'}
              </p>
              <p className="text-xs text-surface-400">Episode di-unlock</p>
            </div>
            <div>
              <p className="font-display text-xl font-bold text-surface-50">
                {wallet ? wallet.total_spent.toLocaleString('id-ID') : '…'}
              </p>
              <p className="text-xs text-surface-400">Koin terpakai</p>
            </div>
            <div>
              <p className="font-display text-xl font-bold text-surface-50">
                {wallet ? wallet.purchases_count.toLocaleString('id-ID') : '…'}
              </p>
              <p className="text-xs text-surface-400">Top-up</p>
            </div>
          </div>
        </div>
      </section>

      {error && (
        <div className="mt-6 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-300">
          <AlertCircle size={16} /> {error}
        </div>
      )}
      {notice && (
        <div className="mt-6 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-300">
          <CheckCircle2 size={16} /> {notice}
        </div>
      )}

      {/* ====== Top-Up Koin ====== */}
      <section className="mt-10">
        <div className="flex items-center gap-3">
          <h2 className="font-display text-xl font-bold text-surface-50">Top-Up Koin</h2>
          <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400">
            <CreditCard size={10} /> Via Midtrans
          </span>
        </div>
        <p className="mt-1 text-sm text-surface-400">
          Pilih paket koin yang ingin dibeli. Pembayaran diproses melalui Midtrans (transfer bank, e-wallet, dll).
        </p>

        {loading && !packages.length ? (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-44 animate-pulse rounded-2xl bg-surface-900" />
            ))}
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {packages.map((pkg, i) => (
              <div
                key={pkg.id}
                className={`group relative overflow-hidden rounded-2xl border bg-surface-900 p-6 transition-all hover:-translate-y-1 ${
                  i === 1
                    ? 'border-amber-500/50 shadow-lg shadow-amber-500/10'
                    : 'border-surface-800 hover:border-brand-500/50'
                }`}
              >
                {i === 1 && (
                  <span className="absolute right-0 top-0 rounded-bl-xl bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                    Terlaris
                  </span>
                )}
                <p className="flex items-center gap-2 font-display text-3xl font-bold text-surface-50">
                  <Coins size={24} className="text-amber-400" />
                  {pkg.coins.toLocaleString('id-ID')}
                </p>
                <p className="mt-1 text-sm text-surface-400">{pkg.name}</p>
                <p className="mt-4 text-lg font-semibold text-surface-200">{formatRupiah(pkg.price)}</p>
                <button
                  onClick={() => handlePurchase(pkg)}
                  disabled={purchasingId === pkg.id}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 py-2.5 text-sm font-semibold text-white shadow-lg shadow-amber-500/25 transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {purchasingId === pkg.id ? (
                    <>
                      <Loader2 size={15} className="animate-spin" /> Memproses…
                    </>
                  ) : (
                    <>
                      <CreditCard size={15} /> Bayar Sekarang
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ====== Transfer dari Affiliate (Creator Only) ====== */}
      {user.role === 'creator' && (
        <section className="mt-10">
          <h2 className="font-display text-xl font-bold text-surface-50">Top-Up dari Saldo Affiliate</h2>
          <p className="mt-1 text-sm text-surface-400">
            Gunakan penghasilan affiliate Anda untuk membeli koin. 1 koin = Rp 100.
          </p>

          <div className="mt-6 grid gap-6 lg:grid-cols-5">
            {/* Form transfer */}
            <div className="lg:col-span-3">
              <div className="rounded-2xl border border-surface-800 bg-surface-900 p-6">
                <h3 className="flex items-center gap-2 font-display text-base font-bold text-surface-50">
                  <Landmark size={17} className="text-emerald-300" /> Transfer ke Dompet Koin
                </h3>
                <p className="mt-1 text-sm text-surface-400">
                  Saldo affiliate akan dikonversi menjadi koin (Rp 100 = 1 koin).
                </p>

                <form onSubmit={handleTransferFromAffiliate} className="mt-5 space-y-4">
                  <div>
                    <label htmlFor="transfer-amount" className="mb-1.5 block text-sm font-medium text-surface-200">
                      Nominal Transfer (Rp)
                    </label>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-surface-500">Rp</span>
                      <input
                        id="transfer-amount"
                        type="text"
                        inputMode="numeric"
                        value={transferAmount ? transferAmountNumber.toLocaleString('id-ID') : ''}
                        onChange={(e) => {
                          setTransferAmount(e.target.value.replace(/[^\d]/g, ''))
                          setTransferError('')
                        }}
                        placeholder="0"
                        className="w-full rounded-xl border border-surface-800 bg-surface-950 py-3 pl-10 pr-4 text-sm font-semibold text-surface-100 placeholder:text-surface-500 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                      />
                    </div>
                    <p className="mt-1 text-xs text-surface-500">
                      Saldo affiliate tersedia:{' '}
                      <span className="font-semibold text-emerald-300">
                        {formatRupiah(affiliateSummary?.available ?? 0)}
                      </span>
                    </p>
                    {transferCoins > 0 && (
                      <p className="mt-1 text-xs text-amber-300">
                        = {transferCoins.toLocaleString('id-ID')} koin
                      </p>
                    )}
                  </div>

                  {transferError && (
                    <p className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-2.5 text-sm text-red-300">
                      <AlertCircle size={15} /> {transferError}
                    </p>
                  )}

                  {transferNotice && (
                    <p className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-4 py-2.5 text-sm text-emerald-300">
                      <CheckCircle2 size={15} /> {transferNotice}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={transferLoading || transferAmountNumber <= 0}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/25 transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:px-8"
                  >
                    {transferLoading ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Banknote size={16} />
                    )}
                    {transferLoading ? 'Memproses…' : 'Transfer ke Dompet'}
                  </button>
                </form>
              </div>
            </div>

            {/* Info */}
            <div className="lg:col-span-2">
              <div className="flex h-full flex-col gap-4">
                <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/5 p-5 text-sm text-surface-300">
                  <h4 className="flex items-center gap-2 font-display text-base font-bold text-emerald-200">
                    <CheckCircle2 size={17} /> Cara Kerja
                  </h4>
                  <ul className="mt-3 space-y-2.5 text-sm">
                    <li className="flex gap-2">
                      <span className="text-emerald-300">1.</span>
                      Penghasilan affiliate Anda dari unlock episode premium.
                    </li>
                    <li className="flex gap-2">
                      <span className="text-emerald-300">2.</span>
                      Transfer ke dompet koin → saldo affiliate berkurang.
                    </li>
                    <li className="flex gap-2">
                      <span className="text-emerald-300">3.</span>
                      Koin bertambah → bisa dipakai untuk unlock episode premium.
                    </li>
                  </ul>
                </div>
                <div className="flex items-start gap-3 rounded-2xl border border-surface-800 bg-surface-900/60 p-5 text-xs text-surface-400">
                  <AlertCircle size={16} className="mt-0.5 shrink-0 text-surface-500" />
                  <p>
                    Minimal transfer <span className="font-medium text-surface-300">Rp 100</span> (1 koin).
                    Nominal akan dibulatkan ke kelipatan Rp 100.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ====== Riwayat Transaksi ====== */}
      <section className="mt-12">
        <h2 className="font-display text-xl font-bold text-surface-50">Riwayat Transaksi</h2>
        <div className="mt-4 overflow-hidden rounded-2xl border border-surface-800 bg-surface-900">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-surface-500">
              <Loader2 size={20} className="mr-2 animate-spin" /> Memuat transaksi…
            </div>
          ) : transactions.length === 0 ? (
            <div className="p-6">
              <EmptyState message="Belum ada transaksi. Top-up koin untuk memulai." />
            </div>
          ) : (
            <ul className="divide-y divide-surface-800/60">
              {transactions.map((tx) => (
                <li key={tx.id} className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-surface-800/30">
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                      tx.type === 'coin_purchase'
                        ? 'bg-amber-500/15 text-amber-300'
                        : tx.type === 'episode_unlock'
                          ? 'bg-brand-500/15 text-brand-300'
                          : 'bg-surface-800 text-surface-400'
                    }`}
                  >
                    {tx.type === 'coin_purchase' ? (
                      <Coins size={18} />
                    ) : tx.type === 'episode_unlock' ? (
                      <Lock size={18} />
                    ) : (
                      <RefreshCw size={18} />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-surface-100">
                      {typeLabel[tx.type]}
                      {tx.episode && (
                        <span className="font-normal text-surface-400">
                          {' '}
                          · {tx.episode.comic_title} (Eps {tx.episode.number})
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-surface-500">
                      {formatDate(tx.created_at)} · {tx.reference}
                    </p>
                  </div>
                  <Badge tone={statusTone[tx.status]}>
                    {tx.status === 'success' && <CheckCircle2 size={11} />}
                    {tx.status === 'failed' && <XCircle size={11} />}
                    {tx.status === 'pending' && <Loader2 size={11} className="animate-spin" />}
                    {tx.status}
                  </Badge>
                  <p
                    className={`shrink-0 text-sm font-semibold ${
                      tx.type === 'episode_unlock' ? 'text-red-300' : 'text-emerald-300'
                    }`}
                  >
                    {tx.type === 'episode_unlock' ? '−' : '+'}
                    {tx.coins > 0 ? `${tx.coins.toLocaleString('id-ID')} koin` : formatRupiah(tx.amount)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
        {!loading && transactions.length > 0 && <Pagination meta={txMeta} onPageChange={setPage} />}
      </section>
    </div>
  )
}

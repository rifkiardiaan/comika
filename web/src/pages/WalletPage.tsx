import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertCircle,
  CheckCircle2,
  Coins,
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
import { getApiErrorMessage } from '../utils/errors'
import { formatDate, formatRupiah } from '../utils/format'
import type { CoinPackage, Transaction, TransactionStatus, TransactionType, WalletSummary } from '../types'

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

export default function WalletPage() {
  // Stabilkan referensi user agar useEffect tidak terpicu ulang tiap render
  const [user] = useState(() => auth.getStoredUser())
  const [wallet, setWallet] = useState<WalletSummary | null>(null)
  const [packages, setPackages] = useState<CoinPackage[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [txMeta, setTxMeta] = useState({ current_page: 1, last_page: 1, total: 0 })
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice] = useState('')

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

  useEffect(() => {
    if (user) fetchAll()
  }, [user, fetchAll])

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

      {/* Packages */}
      <section className="mt-10">
        <h2 className="font-display text-xl font-bold text-surface-50">Top-Up Koin</h2>
        <p className="mt-1 text-sm text-surface-400">
          Pembelian koin memerlukan pembayaran melalui payment gateway yang tersedia.
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
                  disabled
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-surface-500 bg-surface-800 cursor-not-allowed"
                >
                  <Lock size={15} /> Segera Hadir
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Transactions */}
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

      {/* Info kecil */}
      <section className="mt-10 flex items-start gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5 text-sm text-surface-400">
        <Lock size={18} className="mt-0.5 shrink-0 text-amber-400" />
        <div>
          <p className="font-semibold text-amber-300">Pembayaran Belum Tersedia</p>
          <p className="mt-1">
            Sistem pembayaran real-time sedang dalam pengembangan. Untuk saat ini,
            top-up koin belum dapat dilakukan. Episode premium dapat diakses setelah
            sistem pembayaran terintegrasi.
          </p>
        </div>
      </section>
    </div>
  )
}

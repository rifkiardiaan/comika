import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Crown, Check, Shield, Zap, Loader2, Star, BookOpen, Eye, Gem, Unlock, CreditCard } from 'lucide-react'
import { auth } from '../services/auth'
import { subscription, type SubscriptionPlan, type SubscriptionStatus } from '../services/subscription'
import { loadSnapSdk, openSnapPayment, midtrans } from '../services/midtrans'
import type { User } from '../types'

// Client key dari .env (sandbox untuk development)
const MIDTRANS_CLIENT_KEY = import.meta.env.VITE_MIDTRANS_CLIENT_KEY || ''
const MIDTRANS_IS_PRODUCTION = import.meta.env.VITE_MIDTRANS_IS_PRODUCTION === 'true'

export default function PremiumPage() {
  const [user, setUser] = useState<User | null>(auth.getStoredUser())
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [status, setStatus] = useState<SubscriptionStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [subscribing, setSubscribing] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<string>('vvip_yearly')
  const [activeTab, setActiveTab] = useState<'premium' | 'vvip'>('vvip')
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const sync = () => setUser(auth.getStoredUser())
    window.addEventListener('comika:user', sync)
    return () => window.removeEventListener('comika:user', sync)
  }, [])

  // Load Midtrans Snap SDK
  useEffect(() => {
    if (MIDTRANS_CLIENT_KEY) {
      loadSnapSdk(MIDTRANS_CLIENT_KEY, MIDTRANS_IS_PRODUCTION).catch(() => {
        console.warn('Gagal memuat Midtrans Snap SDK')
      })
    }
  }, [])

  useEffect(() => {
    ;(async () => {
      try {
        const [plansData, statusData] = await Promise.all([
          subscription.plans(),
          user ? subscription.status() : null,
        ])
        setPlans(plansData)
        if (statusData) setStatus(statusData)
      } catch {
        // abaikan
      } finally {
        setLoading(false)
      }
    })()
  }, [user])

  const handleSubscribe = async (planId: string) => {
    if (!user) {
      navigate('/login')
      return
    }

    setSubscribing(true)
    setError('')
    setSuccess('')

    try {
      // Dapatkan Snap Token dari backend
      const result = await midtrans.getSubscriptionSnapToken(planId)

      if (!MIDTRANS_CLIENT_KEY) {
        setError('Midtrans belum dikonfigurasi. Hubungi admin.')
        setSubscribing(false)
        return
      }

      const isVvipPlan = planId.includes('vvip')

      // Buka Midtrans Snap payment popup
      openSnapPayment(result.snap_token, {
        onSuccess: async () => {
          setSuccess(
            isVvipPlan
              ? `🎉 Berhasil berlangganan VVIP! Semua episode premium terbuka selama ${result.days_added} hari.`
              : `🎉 Berhasil berlangganan Premium! Akses premium aktif selama ${result.days_added} hari.`,
          )
          // Refresh status
          const newStatus = await subscription.status()
          setStatus(newStatus)
          // Update user in storage
          const me = await auth.me()
          if (me) setUser(me)
        },
        onPending: () => {
          setSuccess('Pembayaran sedang diproses. Langganan akan aktif setelah pembayaran dikonfirmasi.')
        },
        onError: () => {
          setError('Pembayaran gagal. Silakan coba lagi.')
        },
        onClose: () => {
          // User tutup popup tanpa bayar
        },
      })
    } catch {
      setError('Gagal memproses langganan. Coba lagi.')
    } finally {
      setSubscribing(false)
    }
  }

  const handleCancel = async () => {
    setSubscribing(true)
    try {
      await subscription.cancel()
      const newStatus = await subscription.status()
      setStatus(newStatus)
      setSuccess('Langganan akan berakhir saat masa aktif habis.')
    } catch {
      setError('Gagal membatalkan langganan.')
    } finally {
      setSubscribing(false)
    }
  }

  const premiumFeatures = [
    { icon: Eye, text: 'Bebas iklan saat membaca', color: 'text-brand-400' },
    { icon: Zap, text: 'Akses episode premium lebih cepat', color: 'text-amber-400' },
    { icon: Star, text: 'Badge Premium eksklusif', color: 'text-yellow-400' },
    { icon: BookOpen, text: 'Dukungan langsung ke kreator', color: 'text-pink-400' },
    { icon: Shield, text: 'Akses prioritas fitur baru', color: 'text-green-400' },
  ]

  const vvipFeatures = [
    { icon: Eye, text: 'Bebas iklan saat membaca', color: 'text-brand-400' },
    { icon: Unlock, text: 'Semua episode premium terbuka', color: 'text-amber-400' },
    { icon: Gem, text: 'Badge VVIP eksklusif', color: 'text-purple-400' },
    { icon: Zap, text: 'Akses fitur terbaru lebih dulu', color: 'text-cyan-400' },
    { icon: Star, text: 'Badge Premium eksklusif', color: 'text-yellow-400' },
    { icon: Shield, text: 'Akses prioritas fitur baru', color: 'text-green-400' },
  ]

  const filteredPlans = plans.filter((p) => p.tier === activeTab)

  const isCurrentlyVvip = status?.is_vvip ?? false
  const isCurrentlyPremium = (status?.is_premium ?? false) && !isCurrentlyVvip

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-900/80 via-surface-950 to-pink-900/60 py-16 sm:py-24">
        <div className="pointer-events-none absolute -left-32 top-0 h-64 w-64 rounded-full bg-brand-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-32 bottom-0 h-64 w-64 rounded-full bg-pink-500/20 blur-3xl" />
        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-2xl shadow-amber-500/30">
            <Crown size={40} className="text-white" />
          </div>
          <h1 className="font-display text-3xl font-extrabold text-surface-50 sm:text-5xl">
            COMIKA <span className="bg-gradient-to-r from-amber-300 to-orange-400 bg-clip-text text-transparent">Premium</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-surface-300 sm:text-lg">
            Nikmati pengalaman membaca komik tanpa gangguan iklan dan akses fitur eksklusif lainnya.
          </p>
        </div>
      </section>

      {/* Status badges */}
      {isCurrentlyVvip && (
        <section className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
          <div className="rounded-2xl border border-purple-500/30 bg-purple-500/5 p-6">
            <div className="flex items-center gap-3">
              <Gem size={24} className="text-purple-400" />
              <div>
                <p className="text-sm font-bold text-purple-300">Kamu sudah VVIP! 💎</p>
                <p className="mt-0.5 text-xs text-surface-400">
                  Semua episode premium terbuka
                  {status?.days_remaining !== undefined && ` · ${status.days_remaining} hari lagi`}
                  {status?.expires_at && ` (sampai ${new Date(status.expires_at).toLocaleDateString('id-ID')})`}
                </p>
                <p className="mt-2 text-xs text-purple-400/80">
                  Akun VVIP tidak dapat membeli langganan Premium karena sudah memiliki akses lebih lengkap.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}
      {!isCurrentlyVvip && isCurrentlyPremium && (
        <section className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-6">
            <div className="flex items-center gap-3">
              <Crown size={24} className="text-amber-400" />
              <div>
                <p className="text-sm font-bold text-amber-300">Kamu sudah Premium! 🎉</p>
                <p className="mt-0.5 text-xs text-surface-400">
                  {status?.days_remaining !== undefined && `Masa aktif: ${status.days_remaining} hari lagi`}
                  {status?.expires_at && ` (sampai ${new Date(status.expires_at).toLocaleDateString('id-ID')})`}
                </p>
                <p className="mt-1 text-xs text-purple-300">
                  <Link to="#plans" className="underline hover:text-purple-200">Upgrade ke VVIP</Link> untuk membuka semua episode!
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Tier Tabs */}
      <section className="mx-auto max-w-4xl px-4 pt-12 sm:px-6">
        <div className="flex justify-center">
          <div className="inline-flex rounded-2xl border border-surface-800 bg-surface-900 p-1">
            <button
              onClick={() => setActiveTab('premium')}
              className={`flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold transition-all ${
                activeTab === 'premium'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg'
                  : 'text-surface-400 hover:text-surface-200'
              }`}
            >
              <Crown size={16} /> Premium
              {isCurrentlyVvip && <span className="ml-1 text-[10px] opacity-70">🔒</span>}
            </button>
            <button
              onClick={() => setActiveTab('vvip')}
              className={`flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold transition-all ${
                activeTab === 'vvip'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                  : 'text-surface-400 hover:text-surface-200'
              }`}
            >
              <Gem size={16} /> VVIP
            </button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <h2 className="text-center text-lg font-bold text-surface-50">
          {activeTab === 'premium' ? 'Keuntungan Premium' : 'Keuntungan VVIP'}
        </h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(activeTab === 'premium' ? premiumFeatures : vvipFeatures).map((f, i) => (
            <div key={i} className="flex items-center gap-3 rounded-xl border border-surface-800 bg-surface-900/60 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-800">
                <f.icon size={18} className={f.color} />
              </div>
              <p className="text-sm font-medium text-surface-200">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Plans */}
      <section className="bg-surface-900/40 py-12" id="plans">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <h2 className="text-center text-lg font-bold text-surface-50">
            Pilih Paket {activeTab === 'vvip' ? 'VVIP' : 'Premium'}
          </h2>
          <p className="mt-2 text-center text-sm text-surface-400">
            {activeTab === 'vvip'
              ? 'Semua episode premium terbuka — bayar sekali, akses semua!'
              : 'Bayar sekali, nikmati selama masa aktif'}
          </p>

          {loading ? (
            <div className="mt-8 flex justify-center">
              <Loader2 size={24} className="animate-spin text-brand-400" />
            </div>
          ) : (
            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              {filteredPlans.map((plan) => (
                <div
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`relative cursor-pointer rounded-2xl border-2 p-6 transition-all ${
                    selectedPlan === plan.id
                      ? activeTab === 'vvip'
                        ? 'border-purple-500 bg-purple-500/5 shadow-xl shadow-purple-500/10'
                        : 'border-brand-500 bg-brand-500/5 shadow-xl shadow-brand-500/10'
                      : 'border-surface-800 bg-surface-900 hover:border-surface-700'
                  }`}
                >
                  {plan.savings && (
                    <div className={`absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-xs font-bold text-white shadow-lg ${
                      activeTab === 'vvip'
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                        : 'bg-gradient-to-r from-amber-500 to-orange-500'
                    }`}>
                      {plan.savings}
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{plan.badge}</span>
                    <div>
                      <h3 className="text-lg font-bold text-surface-50">{plan.name}</h3>
                      <p className="text-xs text-surface-400">{plan.description}</p>
                    </div>
                  </div>
                  <div className="mt-6">
                    <span className="text-3xl font-extrabold text-surface-50">{plan.formatted_price}</span>
                    <span className="ml-1 text-sm text-surface-400">/ {plan.duration_days} hari</span>
                  </div>

                  {/* Features list */}
                  <ul className="mt-4 space-y-2">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs text-surface-300">
                        <Check size={12} className={activeTab === 'vvip' ? 'text-purple-400' : 'text-brand-400'} />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {selectedPlan === plan.id && (
                    <div className={`mt-4 flex items-center gap-2 text-sm ${
                      activeTab === 'vvip' ? 'text-purple-300' : 'text-brand-300'
                    }`}>
                      <Check size={16} /> Dipilih
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Subscribe Button */}
          {error && (
            <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}
          {success && (
            <div className="mt-6 rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-300">
              {success}
            </div>
          )}

          {/* Blocked message for VVIP on Premium tab */}
          {isCurrentlyVvip && activeTab === 'premium' && (
            <div className="mt-6 rounded-2xl border border-purple-500/30 bg-purple-500/10 p-6 text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-purple-500/20">
                <Gem size={28} className="text-purple-400" />
              </div>
              <p className="text-sm font-bold text-purple-300">Akun VVIP tidak dapat membeli Premium</p>
              <p className="mt-1 text-xs text-surface-400">
                Kamu sudah memiliki VVIP yang mencakup semua fitur Premium dan lebih banyak lagi.
              </p>
              <button
                onClick={() => setActiveTab('vvip')}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-600/25 transition-all hover:brightness-110"
              >
                <Gem size={14} /> Lihat Paket VVIP
              </button>
            </div>
          )}

          {/* Normal subscribe button */}
          {!(isCurrentlyVvip && activeTab === 'premium') && (
            <div className="mt-8 flex justify-center">
              <button
                onClick={() => handleSubscribe(selectedPlan)}
                disabled={subscribing || loading || (activeTab === 'vvip' ? isCurrentlyVvip : isCurrentlyPremium)}
                className={`flex items-center gap-2 rounded-xl px-8 py-3.5 text-sm font-bold text-white shadow-xl transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60 ${
                  activeTab === 'vvip'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 shadow-purple-600/25'
                    : 'bg-gradient-to-r from-brand-600 to-pink-600 shadow-brand-600/25'
                }`}
              >
                {subscribing ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : activeTab === 'vvip' ? (
                  <Gem size={16} />
                ) : (
                  <Crown size={16} />
                )}
                {subscribing
                  ? 'Memproses…'
                  : activeTab === 'vvip'
                    ? isCurrentlyVvip
                      ? 'Sudah VVIP'
                      : 'Bayar & Aktifkan VVIP'
                    : isCurrentlyPremium
                      ? 'Sudah Premium'
                      : 'Bayar & Aktifkan Premium'}
              </button>
            </div>
          )}
          {!user && (
            <p className="mt-4 text-center text-xs text-surface-500">
              <Link to="/login" className="text-brand-400 hover:text-brand-300">Masuk</Link> atau{' '}
              <Link to="/register" className="text-brand-400 hover:text-brand-300">daftar</Link> terlebih dahulu untuk berlangganan.
            </p>
          )}
          {/* Cancel button: only for premium (not VVIP, since VVIP can't buy premium anyway) */}
          {isCurrentlyPremium && (
            <div className="mt-4 text-center">
              <button
                onClick={handleCancel}
                disabled={subscribing}
                className="text-xs text-surface-500 underline transition-colors hover:text-red-400"
              >
                Batalkan langganan
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Payment Info */}
      <section className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <div className="rounded-2xl border border-surface-800 bg-surface-900/60 p-6">
          <h3 className="flex items-center gap-2 text-sm font-bold text-surface-200">
            <CreditCard size={16} className="text-brand-400" /> Metode Pembayaran
          </h3>
          <p className="mt-2 text-xs text-surface-400">
            Pembayaran diproses melalui <span className="font-semibold text-surface-300">Midtrans</span> — mendukung:
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {['Transfer BCA', 'Transfer Mandiri', 'Transfer BRI', 'Transfer BNI', 'GoPay', 'OVO', 'DANA', 'ShopeePay', 'QRIS'].map((method) => (
              <span key={method} className="rounded-lg bg-surface-800 px-2.5 py-1 text-[10px] font-medium text-surface-300">
                {method}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <h2 className="text-center text-lg font-bold text-surface-50">Pertanyaan Umum</h2>
        <div className="mt-6 space-y-4">
          {[
            {
              q: 'Apa bedanya Premium dan VVIP?',
              a: 'Premium memberikan bebas iklan dan badge eksklusif. VVIP memberikan semua keuntungan Premium PLUS akses ke SEMUA episode berbayar tanpa perlu koin.',
            },
            {
              q: 'Bagaimana cara berlangganan VVIP?',
              a: 'Pilih paket VVIP yang diinginkan di halaman ini, lalu klik "Bayar & Aktifkan VVIP". Kamu akan diarahkan ke halaman pembayaran Midtrans.',
            },
            {
              q: 'Apakah saya tetap perlu koin untuk unlock episode jika sudah VVIP?',
              a: 'Tidak! VVIP memberikan akses GRATIS ke semua episode premium. Tidak perlu mengeluarkan koin lagi.',
            },
            {
              q: 'Bagaimana cara berlangganan?',
              a: 'Pilih paket yang diinginkan, lalu klik tombol bayar. Kamu akan diarahkan ke halaman pembayaran Midtrans untuk memilih metode pembayaran.',
            },
            {
              q: 'Metode pembayaran apa saja yang didukung?',
              a: 'Midtrans mendukung transfer bank (BCA, Mandiri, BRI, BNI), e-wallet (GoPay, OVO, DANA, ShopeePay), dan QRIS.',
            },
            {
              q: 'Bisa dibatalkan kapan saja?',
              a: 'Ya, kamu bisa membatalkan langganan kapan saja. Akses premium/VVIP akan tetap aktif sampai masa habis.',
            },
            {
              q: 'Apakah ada perbedaan antara Bulanan dan Tahunan?',
              a: 'Paket Tahunan lebih hemat dibandingkan Bulanan. Keduanya memiliki fitur yang sama.',
            },
          ].map((faq, i) => (
            <div key={i} className="rounded-xl border border-surface-800 bg-surface-900/60 p-5">
              <p className="text-sm font-semibold text-surface-100">{faq.q}</p>
              <p className="mt-2 text-xs leading-relaxed text-surface-400">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

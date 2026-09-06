import { useState, useEffect } from 'react'
import { X, Crown, Shield, Check, Zap, Star, ArrowRight } from 'lucide-react'

interface AdBannerProps {
  onUpgrade?: () => void
  variant?: 'full' | 'banner'
}

export default function AdBanner({ onUpgrade, variant = 'full' }: AdBannerProps) {
  const [dismissed, setDismissed] = useState(false)
  const [countdown, setCountdown] = useState(5)
  const [upgradeHint, setUpgradeHint] = useState(false)
  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true

  const handleUpgrade = () => {
    if (isOnline) {
      setUpgradeHint(false)
      onUpgrade?.()
    } else {
      // Saat offline (mis. di komik offline) CTA upgrade tidak boleh
      // mengarah ke halaman yang tidak bisa dibuka — beri tahu saja.
      setUpgradeHint(true)
    }
  }

  // Countdown timer untuk tombol skip
  useEffect(() => {
    if (dismissed || variant !== 'full') return
    if (countdown <= 0) return
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [countdown, dismissed, variant])

  if (dismissed) return null

  // Banner mode (kecil)
  if (variant === 'banner') {
    return (
      <div className="relative my-6 overflow-hidden rounded-2xl border border-brand-500/30 bg-gradient-to-r from-brand-900/60 via-purple-900/40 to-pink-900/60 p-5">
        <button
          onClick={() => setDismissed(true)}
          className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-surface-800/80 text-surface-400 transition-colors hover:text-surface-200"
        >
          <X size={12} />
        </button>
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500">
            <Crown size={24} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-surface-50">Hapus Iklan dengan COMIKA Premium</p>
            <p className="mt-0.5 text-xs text-surface-400">Baca komik tanpa gangguan iklan</p>
          </div>
          <button
            onClick={handleUpgrade}
            className="shrink-0 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-amber-500/25 transition-all hover:brightness-110"
          >
            Upgrade
          </button>
        </div>
        {upgradeHint && (
          <p className="mt-3 text-[11px] text-amber-300/90">
            Upgrade tersedia saat kamu online kembali.
          </p>
        )}
      </div>
    )
  }

  // Full page ad
  return (
    <div className="relative my-4 flex min-h-[80vh] flex-col items-center justify-center overflow-hidden rounded-2xl border border-surface-800 bg-surface-900">
      {/* Background gradient */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand-900/40 via-surface-900 to-pink-900/30" />
      <div className="pointer-events-none absolute -left-32 top-0 h-64 w-64 rounded-full bg-brand-500/15 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-64 w-64 rounded-full bg-pink-500/15 blur-3xl" />

      {/* Close button */}
      <button
        onClick={() => setDismissed(true)}
        className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-surface-800/80 text-surface-400 transition-colors hover:text-surface-200"
        title="Tutup iklan"
      >
        <X size={16} />
      </button>

      {/* Ad label */}
      <div className="absolute left-4 top-4 z-10">
        <span className="rounded-lg bg-surface-800/80 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-surface-400">
          Iklan
        </span>
      </div>

      {/* Content */}
      <div className="relative z-10 flex max-w-lg flex-col items-center px-6 text-center">
        {/* Premium icon */}
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-2xl shadow-amber-500/30">
          <Crown size={40} className="text-white" />
        </div>

        <h2 className="font-display text-2xl font-extrabold text-surface-50 sm:text-3xl">
          Hapus Semua Iklan!
        </h2>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-surface-300">
          Nikmati pengalaman membaca komik yang lebih nyaman tanpa gangguan iklan dengan{' '}
          <span className="font-bold text-amber-300">COMIKA Premium</span>.
        </p>

        {/* Benefits */}
        <div className="mt-6 grid grid-cols-2 gap-3 text-left">
          {[
            { icon: Shield, text: 'Bebas iklan', color: 'text-brand-400' },
            { icon: Zap, text: 'Akses lebih cepat', color: 'text-amber-400' },
            { icon: Star, text: 'Badge eksklusif', color: 'text-yellow-400' },
            { icon: Check, text: 'Dukung kreasi', color: 'text-green-400' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 rounded-xl border border-surface-800 bg-surface-800/50 px-3 py-2">
              <item.icon size={14} className={item.color} />
              <span className="text-xs font-medium text-surface-200">{item.text}</span>
            </div>
          ))}
        </div>

        {/* Price */}
        <div className="mt-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-6 py-3">
          <p className="text-xs text-surface-400">Mulai dari</p>
          <p className="font-display text-2xl font-extrabold text-amber-300">Rp 29.000<span className="text-sm font-normal text-surface-400">/bulan</span></p>
        </div>

        {/* CTA Button */}
        <button
          onClick={handleUpgrade}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-8 py-3.5 text-sm font-bold text-white shadow-xl shadow-amber-500/25 transition-all hover:brightness-110"
        >
          Upgrade ke Premium <ArrowRight size={16} />
        </button>

        {/* Skip button */}
        <button
          onClick={() => setDismissed(true)}
          disabled={countdown > 0}
          className="mt-4 text-xs text-surface-500 transition-colors hover:text-surface-300 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {countdown > 0 ? `Lewati dalam ${countdown}s` : 'Lewati Iklan'}
        </button>
        {upgradeHint && (
          <p className="mt-2 text-[11px] text-amber-300/90">
            Upgrade tersedia saat kamu online kembali.
          </p>
        )}
      </div>
    </div>
  )
}

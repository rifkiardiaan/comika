import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Download,
  Shield,
  Smartphone,
  Star,
  Zap,
  ChevronRight,
  BookOpen,
  Coins,
  Crown,
  CheckCircle,
  RefreshCw,
} from 'lucide-react'
import api from '../services/api'

const APK_URL = import.meta.env.VITE_APK_URL || '/api/v1/download/apk'
const VERSION_URL = import.meta.env.VITE_APK_VERSION_URL || '/api/v1/download/version'

interface VersionInfo {
  version: string
  min_android: string
  file_size: number
  file_size_human: string
  available: boolean
  download_url: string
}

export default function DownloadPage() {
  const [downloading, setDownloading] = useState(false)
  const [downloadStarted, setDownloadStarted] = useState(false)
  const [versionInfo, setVersionInfo] = useState<VersionInfo | null>(null)
  const [checkingUpdate, setCheckingUpdate] = useState(true)

  useEffect(() => {
    document.title = 'Download COMIKA — Aplikasi Komik & Webtoon Android'
    checkVersion()
  }, [])

  const checkVersion = async () => {
    setCheckingUpdate(true)
    try {
      const { data } = await api.get<{ data: VersionInfo }>(VERSION_URL)
      setVersionInfo(data.data)
    } catch {
      // Fallback — tetap tampilkan tombol download
      setVersionInfo({
        version: '1.0.0',
        min_android: '7.0',
        file_size: 0,
        file_size_human: '',
        available: true,
        download_url: APK_URL,
      })
    } finally {
      setCheckingUpdate(false)
    }
  }

  const handleDownload = () => {
    setDownloading(true)
    // Paksa browser mengunduh file (bukan membuka halaman) via anchor sementara.
    // Atribut download + header Content-Disposition di server membuat file
    // langsung terunduh secara otomatis tanpa meninggalkan halaman ini.
    try {
      const a = document.createElement('a')
      a.href = APK_URL
      a.download = 'comika.apk'
      a.rel = 'noopener'
      a.style.display = 'none'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    } catch {
      // Fallback: navigasi langsung ke endpoint download
      window.location.href = APK_URL
    }
    setTimeout(() => {
      setDownloading(false)
      setDownloadStarted(true)
    }, 1200)
  }

  const features = [
    {
      icon: BookOpen,
      title: 'Baca Komik Gratis',
      desc: 'Ribuan komik dan webtoon dari creator Indonesia.',
      color: 'text-brand-400',
      bg: 'bg-brand-500/10',
    },
    {
      icon: Coins,
      title: 'Sistem Koin & Wallet',
      desc: 'Beli koin untuk unlock episode premium.',
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
    },
    {
      icon: Crown,
      title: 'Premium & VVIP',
      desc: 'Langganan untuk akses konten eksklusif.',
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
    },
    {
      icon: Zap,
      title: 'Notifikasi Update',
      desc: 'Dapat notifikasi saat komik favorit update.',
      color: 'text-orange-400',
      bg: 'bg-orange-500/10',
    },
  ]

  const steps = [
    { num: 1, text: 'Tekan tombol "Download APK" di atas' },
    { num: 2, text: 'Buka file APK yang sudah terdownload' },
    { num: 3, text: 'Izinkan install dari sumber tidak dikenal (jika diminta)' },
    { num: 4, text: 'Tunggu proses install selesai & buka aplikasi' },
  ]

  return (
    <div className="min-h-screen bg-surface-950">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-600/20 via-transparent to-pink-600/10" />
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-brand-500/5 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-pink-500/5 blur-3xl" />

        <div className="relative mx-auto max-w-5xl px-4 py-20 text-center sm:py-28">
          {/* App Icon */}
          <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-brand-500 to-pink-500 shadow-2xl shadow-brand-500/30 sm:h-28 sm:w-28">
            <img
              src="/assets/comika-logo.jpeg"
              alt="COMIKA Logo"
              className="h-20 w-20 rounded-2xl object-cover sm:h-24 sm:w-24"
              onError={(e) => {
                // Fallback ke huruf C jika gambar gagal dimuat
                const target = e.target as HTMLImageElement
                target.style.display = 'none'
                const fallback = document.createElement('span')
                fallback.className = 'font-display text-4xl font-bold text-white sm:text-5xl'
                fallback.textContent = 'C'
                target.parentElement?.appendChild(fallback)
              }}
            />
          </div>

          <h1 className="font-display text-3xl font-bold text-surface-50 sm:text-5xl">
            Download <span className="bg-gradient-to-r from-brand-400 to-pink-400 bg-clip-text text-transparent">COMIKA</span>
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-base text-surface-400 sm:text-lg">
            Platform komik dan webtoon digital Indonesia. Baca, bagikan, dan monetisasi karya komikmu.
          </p>

          {/* Version info */}
          {versionInfo && (
            <div className="mx-auto mt-6 flex items-center justify-center gap-3 text-sm text-surface-500">
              <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-emerald-400">
                v{versionInfo.version}
              </span>
              {versionInfo.file_size_human && (
                <span className="rounded-full bg-surface-800 px-3 py-1">
                  {versionInfo.file_size_human}
                </span>
              )}
              <span className="rounded-full bg-surface-800 px-3 py-1">
                Android {versionInfo.min_android}+
              </span>
            </div>
          )}

          {/* APK info */}
          <p className="mt-2 text-xs text-surface-500">
            File APK tersedia · Siap diunduh langsung dari server
          </p>

          {/* Download Button */}
          <div className="mt-10 flex flex-col items-center gap-4">
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="group flex items-center gap-3 rounded-2xl bg-gradient-to-r from-brand-600 to-pink-600 px-8 py-4 text-lg font-bold text-white shadow-2xl shadow-brand-600/30 transition-all hover:brightness-110 hover:shadow-brand-500/40 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {downloading ? (
                <>
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Downloading...
                </>
              ) : downloadStarted ? (
                <>
                  <CheckCircle size={22} />
                  Download Dimulai!
                </>
              ) : (
                <>
                  <Download size={22} />
                  Download APK
                </>
              )}
            </button>

            {/* Check update */}
            <button
              onClick={checkVersion}
              disabled={checkingUpdate}
              className="flex items-center gap-1.5 text-xs text-surface-500 transition-colors hover:text-surface-300"
            >
              <RefreshCw size={12} className={checkingUpdate ? 'animate-spin' : ''} />
              {checkingUpdate ? 'Mengecek versi...' : 'Cek update terbaru'}
            </button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-surface-800/60 bg-surface-900/50">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
          <h2 className="font-display text-center text-2xl font-bold text-surface-50 sm:text-3xl">
            Kenapa COMIKA?
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {features.map((f) => (
              <div
                key={f.title}
                className="flex gap-4 rounded-2xl border border-surface-800/60 bg-surface-900 p-5 transition-colors hover:border-surface-700"
              >
                <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${f.bg}`}>
                  <f.icon size={22} className={f.color} />
                </span>
                <div>
                  <h3 className="font-semibold text-surface-100">{f.title}</h3>
                  <p className="mt-1 text-sm text-surface-400">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How to Install */}
      <section className="border-t border-surface-800/60">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
          <h2 className="font-display text-center text-2xl font-bold text-surface-50 sm:text-3xl">
            Cara Install
          </h2>
          <div className="mx-auto mt-10 max-w-lg space-y-4">
            {steps.map((s) => (
              <div
                key={s.num}
                className="flex items-center gap-4 rounded-xl border border-surface-800/60 bg-surface-900 p-4"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-500/15 text-sm font-bold text-brand-400">
                  {s.num}
                </span>
                <p className="text-sm text-surface-300">{s.text}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-center text-sm text-amber-300/80">
            <Shield size={16} className="mx-auto mb-1 text-amber-400" />
            APK ini aman dan bebas virus. Kami tidak mengunggah ke Play Store karena proses review yang lama.
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-surface-800/60 bg-gradient-to-br from-brand-600/10 to-pink-600/5">
        <div className="mx-auto max-w-5xl px-4 py-16 text-center sm:px-6">
          <h2 className="font-display text-2xl font-bold text-surface-50 sm:text-3xl">
            Siap Baca Komik?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-surface-400">
            Download sekarang dan mulai petualangan membaca komikmu!
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-pink-600 px-6 py-3 font-semibold text-white shadow-lg shadow-brand-600/25 transition-all hover:brightness-110 disabled:opacity-60"
            >
              <img src="/assets/comika-logo.jpeg" alt="" className="h-5 w-5 rounded object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
              <Smartphone size={18} />
              Download COMIKA
            </button>
            <Link
              to="/"
              className="flex items-center gap-1 rounded-xl border border-surface-700 px-6 py-3 text-sm font-medium text-surface-300 transition-colors hover:border-surface-600 hover:text-surface-100"
            >
              Buka di Web <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* Phone mockup placeholder */}
      <section className="border-t border-surface-800/60 py-16">
        <div className="mx-auto flex max-w-5xl items-center justify-center gap-8 px-4 sm:px-6">
          <div className="hidden sm:block">
            <div className="flex h-[400px] w-[200px] items-center justify-center rounded-[2rem] border-4 border-surface-700 bg-surface-900 shadow-2xl">
              <div className="text-center">
                <img
                  src="/assets/comika-logo.jpeg"
                  alt="COMIKA"
                  className="mx-auto h-16 w-16 rounded-2xl object-cover shadow-lg"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                    const fallback = document.createElement('div')
                    fallback.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mx-auto text-surface-700"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/></svg>'
                    target.parentElement?.appendChild(fallback)
                  }}
                />
                <p className="mt-3 text-xs text-surface-600">COMIKA App</p>
              </div>
            </div>
          </div>
          <div className="max-w-md">
            <div className="flex items-center gap-1 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={18} fill="currentColor" />
              ))}
            </div>
            <p className="mt-3 text-lg font-medium text-surface-100">
              "Aplikasi komik terbaik! Banyak komik bagus dan update-nya cepat."
            </p>
            <p className="mt-2 text-sm text-surface-500">— Pengguna COMIKA</p>
          </div>
        </div>
      </section>
    </div>
  )
}

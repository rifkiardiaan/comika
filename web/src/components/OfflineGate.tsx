import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Bookmark, RefreshCw, WifiOff } from 'lucide-react'

const OFFLINE_PATHS = ['/komik-offline']

/**
 * Saat perangkat offline, hanya halaman Komik Offline yang bisa dibuka.
 * Halaman lain menampilkan layar "Kamu sedang offline".
 */
export default function OfflineGate({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation()
  const [isOffline, setIsOffline] = useState(() => !navigator.onLine)

  useEffect(() => {
    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (!isOffline) return <>{children}</>

  const allowed = OFFLINE_PATHS.some((p) => pathname.startsWith(p))
  if (allowed) return <>{children}</>

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-3xl border border-surface-800 bg-surface-900 p-10 text-center shadow-2xl">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-300">
          <WifiOff size={30} />
        </span>
        <h1 className="mt-5 font-display text-2xl font-bold text-surface-50">Kamu sedang offline</h1>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-surface-400">
          Tidak ada koneksi internet. Saat offline, kamu hanya bisa membuka halaman{' '}
          <b className="text-surface-200">Komik Offline</b> untuk membaca komik yang sudah diunduh.
        </p>
        <div className="mt-6 flex flex-col items-center gap-3">
          <Link
            to="/komik-offline"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-pink-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-600/25 transition-all hover:brightness-110"
          >
            <Bookmark size={16} /> Buka Komik Offline
          </Link>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-1.5 text-xs text-surface-500 transition-colors hover:text-surface-300"
          >
            <RefreshCw size={13} /> Coba lagi saat koneksi pulih
          </button>
        </div>
      </div>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { Bookmark, WifiOff } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

export default function OfflineBanner() {
  const { pathname } = useLocation()
  const [isOffline, setIsOffline] = useState(!navigator.onLine)

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

  if (!isOffline) return null
  if (pathname.startsWith('/komik-offline')) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-amber-500/30 bg-amber-950/95 px-4 py-3 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-3">
        <WifiOff size={18} className="shrink-0 text-amber-400" />
        <p className="text-sm font-medium text-amber-200">
          Anda sedang offline. Buka{' '}
          <Link
            to="/komik-offline"
            className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-2.5 py-0.5 font-bold text-amber-100 transition-colors hover:bg-amber-500/30"
          >
            <Bookmark size={12} /> Komik Offline
          </Link>{' '}
          untuk membaca komik yang sudah didownload.
        </p>
      </div>
    </div>
  )
}

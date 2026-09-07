import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { X } from 'lucide-react'
import { auth } from '../services/auth'
import { notifications as notificationsApi } from '../services/notifications'
import { notificationDescription, notificationTarget, notificationTitle } from '../utils/notifications'
import { timeAgo } from '../utils/format'
import type { AppNotification } from '../types'
import NotificationIcon from './NotificationIcon'

const POLL_INTERVAL_MS = 30_000
const AUTO_DISMISS_MS = 6_000
const MAX_VISIBLE = 3

/**
 * Popup notifikasi yang muncul otomatis di bagian ATAS layar saat ada
 * notifikasi baru (epoch mobile-friendly: full-width di HP, card di desktop).
 *
 * Cara kerja:
 * - Poll `unread-count` tiap 30 detik (lebih cepat dari lonceng di Navbar).
 * - Saat jumlah unread naik, ambil list terbaru dan tampilkan notifikasi
 *   yang belum dibaca & lebih baru dari baseline sesi sebagai toast.
 * - Poll pertama setelah login hanya menyimpan baseline — popup lama tidak
 *   d spam ulang setiap kali buka app.
 * - Tap toast → tandai dibaca + navigasi ke target notifikasi.
 * - Posisi memakai `env(safe-area-inset-top)` agar tidak tertutup status bar
 *   di aplikasi mobile (WebView COMIKA) maupun perangkat ber-notch.
 */
export default function NotificationPopup() {
  const [toasts, setToasts] = useState<AppNotification[]>([])
  const lastUnreadRef = useRef<number | null>(null)
  const lastSeenAtRef = useRef<string>('')
  const loggedInRef = useRef<boolean>(Boolean(auth.getStoredUser()))
  const navigate = useNavigate()

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const openNotification = (n: AppNotification) => {
    if (!n.read_at) notificationsApi.markRead(n.id).catch(() => {})
    dismiss(n.id)
    navigate(notificationTarget(n))
  }

  const poll = useCallback(async () => {
    const loggedIn = Boolean(auth.getStoredUser())
    const wasLoggedIn = loggedInRef.current
    loggedInRef.current = loggedIn

    // Logout / belum login — reset state.
    if (!loggedIn) {
      lastUnreadRef.current = null
      lastSeenAtRef.current = ''
      setToasts([])
      return
    }

    let unread: number
    try {
      unread = await notificationsApi.unreadCount()
    } catch {
      return // offline / API error — coba lagi di poll berikutnya
    }

    const prev = lastUnreadRef.current
    lastUnreadRef.current = unread

    // Poll pertama setelah login/buka app → simpan baseline saja.
    if (prev === null || !wasLoggedIn) {
      try {
        const res = await notificationsApi.list(1)
        lastSeenAtRef.current = res.data[0]?.created_at ?? ''
      } catch {
        /* abaikan */
      }
      return
    }

    if (unread <= prev) return

    // Ada notifikasi baru → tampilkan sebagai toast di atas layar.
    try {
      const res = await notificationsApi.list(1)
      const baseline = lastSeenAtRef.current
      const fresh = res.data
        .filter((n) => !n.read_at && n.created_at > baseline)
        .slice(0, MAX_VISIBLE)

      if (fresh.length > 0) {
        // List diurutkan terbaru dulu → item pertama adalah baseline baru.
        lastSeenAtRef.current = fresh[0].created_at
        setToasts((prevToasts) => {
          const seen = new Set(prevToasts.map((t) => t.id))
          const next = fresh.filter((f) => !seen.has(f.id))
          return [...next, ...prevToasts].slice(0, MAX_VISIBLE)
        })
      } else {
        // Semua sudah pernah tampil — cukup majukan baseline.
        lastSeenAtRef.current = res.data[0]?.created_at ?? baseline
      }
    } catch {
      /* abaikan */
    }
  }, [])

  useEffect(() => {
    poll()
    const id = setInterval(poll, POLL_INTERVAL_MS)
    // Sinkron saat login/logout (event sama dengan yang dipakai Navbar).
    const sync = () => poll()
    window.addEventListener('comika:user', sync)
    window.addEventListener('storage', sync)
    return () => {
      clearInterval(id)
      window.removeEventListener('comika:user', sync)
      window.removeEventListener('storage', sync)
    }
  }, [poll])

  return (
    <div
      className="pointer-events-none fixed inset-x-0 z-[60] flex flex-col items-center gap-2 px-3 sm:px-4"
      style={{ top: 'env(safe-area-inset-top, 0px)' }}
      role="region"
      aria-label="Notifikasi baru"
    >
      {toasts.map((n) => (
        <ToastItem key={n.id} n={n} onOpen={() => openNotification(n)} onDismiss={() => dismiss(n.id)} />
      ))}
    </div>
  )
}

function ToastItem({
  n,
  onOpen,
  onDismiss,
}: {
  n: AppNotification
  onOpen: () => void
  onDismiss: () => void
}) {
  // Auto-hide per toast — timer baru dimulai saat toast muncul.
  useEffect(() => {
    const t = setTimeout(onDismiss, AUTO_DISMISS_MS)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n.id])

  return (
    <div
      className={`animate-slide-down pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-2xl border bg-surface-900/95 p-3.5 shadow-2xl shadow-black/60 backdrop-blur-md ${
        n.read_at ? 'border-surface-800' : 'border-surface-800 border-l-2 border-l-brand-500'
      }`}
    >
      <NotificationIcon type={n.type} size={18} />
      <button onClick={onOpen} className="min-w-0 flex-1 text-left">
        <span className="flex items-start justify-between gap-2">
          <span className={`truncate text-sm font-semibold ${n.read_at ? 'text-surface-300' : 'text-surface-50'}`}>
            {notificationTitle(n)}
          </span>
          {!n.read_at && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-400" />}
        </span>
        <span className="mt-0.5 line-clamp-2 block text-xs text-surface-400">
          {notificationDescription(n)}
        </span>
        <span className="mt-1 block text-[11px] text-surface-500">{timeAgo(n.created_at)}</span>
      </button>
      <button
        onClick={onDismiss}
        aria-label="Tutup notifikasi"
        className="rounded-full p-1 text-surface-500 transition-colors hover:bg-surface-800 hover:text-surface-200"
      >
        <X size={14} />
      </button>
    </div>
  )
}

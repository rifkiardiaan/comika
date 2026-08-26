import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Bell, BellRing, CheckCheck } from 'lucide-react'
import { notifications as notificationsApi } from '../services/notifications'
import { notificationDescription, notificationTarget, notificationTitle } from '../utils/notifications'
import { timeAgo } from '../utils/format'
import type { AppNotification } from '../types'
import NotificationIcon from './NotificationIcon'

/** Lonceng notifikasi di Navbar: badge jumlah belum dibaca + dropdown. */
export default function NotificationBell() {
  const [unread, setUnread] = useState(0)
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<AppNotification[]>([])
  const [loading, setLoading] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  const refreshCount = () => {
    notificationsApi.unreadCount().then(setUnread).catch(() => {})
  }

  useEffect(() => {
    refreshCount()
    const id = setInterval(refreshCount, 60_000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [])

  const toggle = async () => {
    const next = !open
    setOpen(next)
    if (next) {
      setLoading(true)
      try {
        const res = await notificationsApi.list(1)
        setItems(res.data)
      } catch {
        setItems([])
      }
      setLoading(false)
      refreshCount()
    }
  }

  const handleClickItem = (n: AppNotification) => {
    if (!n.read_at) {
      notificationsApi.markRead(n.id).then(refreshCount).catch(() => {})
      setItems((prev) => prev.map((i) => (i.id === n.id ? { ...i, read_at: new Date().toISOString() } : i)))
    }
    setOpen(false)
    navigate(notificationTarget(n))
  }

  const handleMarkAll = async () => {
    try {
      await notificationsApi.markAllRead()
      setItems((prev) => prev.map((i) => ({ ...i, read_at: i.read_at ?? new Date().toISOString() })))
      refreshCount()
    } catch {
      // abaikan — badge akan tetap tampil
    }
  }

  return (
    <div className="relative overflow-visible" ref={ref}>
      <button
        onClick={toggle}
        aria-label="Notifikasi"
        className="relative flex h-9 w-9 items-center justify-center rounded-full border border-surface-800 bg-surface-900 text-surface-300 transition-colors hover:border-brand-500/50 hover:text-surface-50"
      >
        {unread > 0 ? <BellRing size={16} /> : <Bell size={16} />}
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-[5px] text-[10px] font-bold leading-none text-white shadow-md ring-2 ring-surface-950">
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 max-w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-surface-800 bg-surface-900 shadow-2xl shadow-black/50">
          <div className="flex items-center justify-between border-b border-surface-800 px-4 py-3">
            <p className="text-sm font-semibold text-surface-100">Notifikasi</p>
            {unread > 0 && (
              <button
                onClick={handleMarkAll}
                className="flex items-center gap-1 text-xs font-medium text-brand-300 transition-colors hover:text-brand-200"
              >
                <CheckCheck size={13} /> Tandai semua dibaca
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
              </div>
            ) : items.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <p className="text-sm text-surface-400">Belum ada notifikasi.</p>
              </div>
            ) : (
              items.slice(0, 6).map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleClickItem(n)}
                  className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-800/60"
                >
                  <NotificationIcon type={n.type} />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-start justify-between gap-2">
                      <span
                        className={`truncate text-sm font-semibold ${
                          n.read_at ? 'text-surface-300' : 'text-surface-50'
                        }`}
                      >
                        {notificationTitle(n)}
                      </span>
                      {!n.read_at && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-400" />}
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-surface-400">
                      {notificationDescription(n)}
                    </span>
                    <span className="mt-1 block text-[11px] text-surface-500">{timeAgo(n.created_at)}</span>
                  </span>
                </button>
              ))
            )}
          </div>

          <Link
            to="/notifications"
            onClick={() => setOpen(false)}
            className="block border-t border-surface-800 px-4 py-2.5 text-center text-xs font-semibold text-brand-300 transition-colors hover:bg-surface-800 hover:text-brand-200"
          >
            Lihat semua notifikasi
          </Link>
        </div>
      )}
    </div>
  )
}

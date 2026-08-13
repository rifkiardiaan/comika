import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BellOff, CheckCheck, Trash2 } from 'lucide-react'
import { notifications as notificationsApi } from '../services/notifications'
import { notificationDescription, notificationTarget, notificationTitle } from '../utils/notifications'
import { timeAgo } from '../utils/format'
import type { AppNotification } from '../types'
import NotificationIcon from '../components/NotificationIcon'

export default function NotificationsPage() {
  const [items, setItems] = useState<AppNotification[]>([])
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 })
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const navigate = useNavigate()

  const load = useCallback(async (page: number) => {
    const res = await notificationsApi.list(page)
    setItems((prev) => (page === 1 ? res.data : [...prev, ...res.data]))
    setMeta({
      current_page: res.meta.current_page,
      last_page: res.meta.last_page,
      total: res.meta.total,
    })
  }, [])

  useEffect(() => {
    load(1).finally(() => setLoading(false))
  }, [load])

  const markAllRead = async () => {
    try {
      await notificationsApi.markAllRead()
      setItems((prev) => prev.map((i) => ({ ...i, read_at: i.read_at ?? new Date().toISOString() })))
    } catch {
      // abaikan
    }
  }

  const openNotification = async (n: AppNotification) => {
    if (!n.read_at) {
      notificationsApi.markRead(n.id).catch(() => {})
      setItems((prev) => prev.map((i) => (i.id === n.id ? { ...i, read_at: new Date().toISOString() } : i)))
    }
    navigate(notificationTarget(n))
  }

  const remove = async (e: React.MouseEvent, n: AppNotification) => {
    e.stopPropagation()
    try {
      await notificationsApi.remove(n.id)
      setItems((prev) => prev.filter((i) => i.id !== n.id))
      setMeta((m) => ({ ...m, total: Math.max(0, m.total - 1) }))
    } catch {
      // abaikan
    }
  }

  const loadMore = async () => {
    setLoadingMore(true)
    try {
      await load(meta.current_page + 1)
    } catch {
      // abaikan
    }
    setLoadingMore(false)
  }

  const unreadCount = items.filter((i) => !i.read_at).length

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-surface-50">Notifikasi</h1>
          <p className="mt-1 text-sm text-surface-400">
            {unreadCount > 0
              ? `${unreadCount} belum dibaca dari ${meta.total} total`
              : `${meta.total} notifikasi`}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="flex shrink-0 items-center gap-1.5 rounded-lg border border-brand-500/30 bg-brand-500/10 px-3 py-2 text-sm font-medium text-brand-300 transition-colors hover:bg-brand-500/20"
          >
            <CheckCheck size={15} /> Tandai semua dibaca
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-24">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border border-surface-800 bg-surface-900/50 px-6 py-16 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-800 text-surface-400">
            <BellOff size={24} />
          </span>
          <p className="mt-4 font-semibold text-surface-100">Belum ada notifikasi</p>
          <p className="mt-1 max-w-sm text-sm text-surface-400">
            Episode baru dari komik yang kamu ikuti, balasan komentar, dan info transaksi akan muncul di sini.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-surface-800 bg-surface-900/50">
          {items.map((n) => (
            <div
              key={n.id}
              role="button"
              tabIndex={0}
              onClick={() => openNotification(n)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  openNotification(n)
                }
              }}
              className={`group flex w-full cursor-pointer items-start gap-3 border-b border-surface-800/60 px-4 py-4 text-left transition-colors last:border-b-0 hover:bg-surface-800/40 ${
                n.read_at ? 'opacity-80' : 'bg-surface-900/30'
              }`}
            >
              <NotificationIcon type={n.type} size={18} />
              <span className="min-w-0 flex-1">
                <span className="flex items-start justify-between gap-2">
                  <span className={`text-sm font-semibold ${n.read_at ? 'text-surface-300' : 'text-surface-50'}`}>
                    {notificationTitle(n)}
                  </span>
                  {!n.read_at && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-brand-400" />}
                </span>
                <span className="mt-0.5 block text-xs text-surface-400">{notificationDescription(n)}</span>
                <span className="mt-1 block text-[11px] text-surface-500">{timeAgo(n.created_at)}</span>
              </span>
              <button
                type="button"
                onClick={(e) => remove(e, n)}
                className="mt-0.5 rounded-lg p-1.5 text-surface-600 opacity-0 transition-opacity hover:bg-red-500/10 hover:text-red-400 focus:opacity-100 group-hover:opacity-100"
                aria-label="Hapus notifikasi"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {!loading && meta.current_page < meta.last_page && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="rounded-xl border border-surface-800 bg-surface-900 px-6 py-2.5 text-sm font-semibold text-surface-200 transition-colors hover:border-brand-500/50 disabled:opacity-50"
          >
            {loadingMore ? 'Memuat…' : 'Muat lebih banyak'}
          </button>
        </div>
      )}
    </div>
  )
}

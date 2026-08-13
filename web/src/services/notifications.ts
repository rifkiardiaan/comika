import api from './api'
import type { AppNotification, PaginationMeta } from '../types'

/** Notifikasi in-app (blueprint 24) — dibaca oleh web & mobile. */
export const notifications = {
  async list(page = 1): Promise<{ data: AppNotification[]; meta: PaginationMeta }> {
    const { data } = await api.get<{ data: AppNotification[]; meta: PaginationMeta }>('/me/notifications', {
      params: { page },
    })
    return data
  },

  /** Jumlah notifikasi belum dibaca — untuk badge di lonceng. */
  async unreadCount(): Promise<number> {
    const { data } = await api.get<{ data: { unread_count: number } }>('/me/notifications/unread-count')
    return data.data.unread_count
  },

  async markRead(id: string): Promise<void> {
    await api.put(`/me/notifications/${id}/read`)
  },

  async markAllRead(): Promise<void> {
    await api.post('/me/notifications/read-all')
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/me/notifications/${id}`)
  },
}

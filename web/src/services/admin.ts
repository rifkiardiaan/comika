import api from './api'
import type {
  AdminComic,
  AdminComment,
  AdminCreator,
  AdminReport,
  AdminTransaction,
  AdminUser,
  AdminWithdrawal,
  ComicStatus,
  CommentModerationStatus,
  DashboardStats,
  Genre,
  PaginationMeta,
  ReportStatus,
  Role,
  TransactionStatus,
  TransactionType,
  WithdrawalStatus,
} from '../types'

export { getApiErrorMessage } from '../utils/errors'
export type { ApiErrorData } from '../utils/errors'

interface ListResponse<T> {
  success: boolean
  message: string
  data: T[]
  meta: PaginationMeta
}

export const admin = {
  // ============ Dashboard ============
  async dashboard(): Promise<DashboardStats> {
    const { data } = await api.get<{ data: DashboardStats }>('/admin/dashboard')
    return data.data
  },

  // ============ Users ============
  async users(params: { q?: string; role?: Role; page?: number } = {}): Promise<ListResponse<AdminUser>> {
    const { data } = await api.get<ListResponse<AdminUser>>('/admin/users', { params })
    return data
  },

  async updateUserRole(id: number, role: Role): Promise<AdminUser> {
    const { data } = await api.patch<{ data: AdminUser }>(`/admin/users/${id}/role`, { role })
    return data.data
  },

  async deleteUser(id: number): Promise<void> {
    await api.delete(`/admin/users/${id}`)
  },

  async banUser(id: number, banReason?: string): Promise<AdminUser> {
    const { data } = await api.post<{ data: AdminUser }>(`/admin/users/${id}/ban`, { ban_reason: banReason })
    return data.data
  },

  async unbanUser(id: number): Promise<AdminUser> {
    const { data } = await api.post<{ data: AdminUser }>(`/admin/users/${id}/unban`)
    return data.data
  },

  async permanentBanUser(id: number, banReason: string): Promise<AdminUser> {
    const { data } = await api.post<{ data: AdminUser }>(`/admin/users/${id}/permanent-ban`, { ban_reason: banReason })
    return data.data
  },

  // ============ Creators ============
  async creators(params: { q?: string; verified?: boolean; page?: number } = {}): Promise<ListResponse<AdminCreator>> {
    const { data } = await api.get<ListResponse<AdminCreator>>('/admin/creators', { params })
    return data
  },

  async verifyCreator(id: number, verified: boolean): Promise<AdminCreator> {
    const { data } = await api.patch<{ data: AdminCreator }>(`/admin/creators/${id}/verify`, { verified })
    return data.data
  },

  // ============ Comics ============
  async comics(params: { q?: string; status?: ComicStatus; visibility?: 'all' | 'published' | 'draft'; page?: number } = {}): Promise<ListResponse<AdminComic>> {
    const { data } = await api.get<ListResponse<AdminComic>>('/admin/comics', { params })
    return data
  },

  async updateComicStatus(id: number, status: ComicStatus): Promise<AdminComic> {
    const { data } = await api.patch<{ data: AdminComic }>(`/admin/comics/${id}/status`, { status })
    return data.data
  },

  async deleteComic(id: number): Promise<void> {
    await api.delete(`/admin/comics/${id}`)
  },

  async deleteComicCover(id: number): Promise<AdminComic> {
    const { data } = await api.delete<{ data: AdminComic }>(`/admin/comics/${id}/cover`)
    return data.data
  },

  async publishComic(id: number): Promise<AdminComic> {
    const { data } = await api.post<{ data: AdminComic }>(`/admin/comics/${id}/publish`)
    return data.data
  },

  async verifyComic(id: number, payload: { verification_status: 'approved' | 'rejected'; rejection_reason?: string }): Promise<AdminComic> {
    const { data } = await api.patch<{ data: AdminComic }>(`/admin/comics/${id}/verify`, payload)
    return data.data
  },

  async blockComic(id: number): Promise<AdminComic> {
    const { data } = await api.post<{ data: AdminComic }>(`/admin/comics/${id}/block`)
    return data.data
  },

  async publishEpisode(episodeId: number): Promise<{ id: number; title: string; number: number; status: string }> {
    const { data } = await api.post<{ data: { id: number; title: string; number: number; status: string } }>(`/admin/episodes/${episodeId}/publish`)
    return data.data
  },

  async comicEpisodes(comicId: number): Promise<{ comic: { id: number; title: string }; episodes: Array<{ id: number; number: number; title: string; status: 'draft' | 'published'; is_premium: boolean; price_coin: number; view_count: number; like_count: number; page_count: number; comments_count: number; published_at: string | null }> }> {
    const { data } = await api.get<{ data: { comic: { id: number; title: string }; episodes: Array<{ id: number; number: number; title: string; status: 'draft' | 'published'; is_premium: boolean; price_coin: number; view_count: number; like_count: number; page_count: number; comments_count: number; published_at: string | null }> } }>(`/admin/comics/${comicId}/episodes`)
    return data.data
  },

  async episodePages(episodeId: number): Promise<{ episode: { id: number; number: number; title: string; status: string; is_premium: boolean }; pages: Array<{ id: number; page_number: number; image_url: string }> }> {
    const { data } = await api.get<{ data: { episode: { id: number; number: number; title: string; status: string; is_premium: boolean }; pages: Array<{ id: number; page_number: number; image_url: string }> } }>(`/admin/episodes/${episodeId}/pages`)
    return data.data
  },

  async revenue(): Promise<{ total_revenue: number; monthly_revenue: number; total_coin_revenue: number; revenue_by_comic: Array<{ comic_id: number; comic_title: string; total_creator_earnings: number; total_revenue: number }> }> {
    const { data } = await api.get<{ data: { total_revenue: number; monthly_revenue: number; total_coin_revenue: number; revenue_by_comic: Array<{ comic_id: number; comic_title: string; total_creator_earnings: number; total_revenue: number }> } }>('/admin/revenue')
    return data.data
  },

  // ============ Reading Report ============
  async readingReport(params: { q?: string; type?: string; user_id?: number; comic_id?: number; page?: number; since?: string; per_page?: number } = {}): Promise<ListResponse<{ id: number; user: { id: number; name: string; username: string; avatar_url: string | null; is_vvip: boolean }; comic: { id: number; title: string; cover_url: string | null }; episode: { id: number; number: number; title: string; is_premium: boolean; price_coin: number }; access_type: string; coins_spent: number; progress: number; is_completed: boolean; last_page: number; updated_at: string }>> {
    const { data } = await api.get('/admin/reading/report', { params })
    return data
  },

  async readingStats(): Promise<{ total_reads: number; unique_readers: number; unique_comics_read: number; free_reads: number; paid_reads: number; vvip_reads: number; total_coins_spent: number; last_updated: string | null; top_comics: Array<{ comic_id: number; read_count: number; comic: { id: number; title: string; cover_url: string | null } }>; top_readers: Array<{ user_id: number; read_count: number; user: { id: number; name: string; username: string; avatar_url: string | null } }> }> {
    const { data } = await api.get<{ data: any }>('/admin/reading/stats')
    return data.data
  },

  // ============ Comments ============
  async comments(params: { q?: string; status?: CommentModerationStatus | 'deleted'; page?: number } = {}): Promise<ListResponse<AdminComment>> {
    const { data } = await api.get<ListResponse<AdminComment>>('/admin/comments', { params })
    return data
  },

  async moderateComment(id: number, status: CommentModerationStatus): Promise<AdminComment> {
    const { data } = await api.patch<{ data: AdminComment }>(`/admin/comments/${id}/moderate`, { status })
    return data.data
  },

  async deleteComment(id: number): Promise<void> {
    await api.delete(`/admin/comments/${id}`)
  },

  // ============ Reports ============
  async reports(params: { status?: ReportStatus; page?: number } = {}): Promise<ListResponse<AdminReport>> {
    const { data } = await api.get<ListResponse<AdminReport>>('/admin/reports', { params })
    return data
  },

  async handleReport(id: number, payload: { status: ReportStatus; admin_note?: string }): Promise<AdminReport> {
    const { data } = await api.patch<{ data: AdminReport }>(`/admin/reports/${id}/handle`, payload)
    return data.data
  },

  // ============ Genres ============
  async genres(): Promise<Genre[]> {
    const { data } = await api.get<{ data: Genre[] }>('/genres')
    return data.data
  },

  async createGenre(payload: { name: string; slug?: string }): Promise<Genre> {
    const { data } = await api.post<{ data: Genre }>('/admin/genres', payload)
    return data.data
  },

  async updateGenre(id: number, payload: { name: string; slug?: string }): Promise<Genre> {
    const { data } = await api.put<{ data: Genre }>(`/admin/genres/${id}`, payload)
    return data.data
  },

  async deleteGenre(id: number): Promise<void> {
    await api.delete(`/admin/genres/${id}`)
  },

  // ============ Transactions & Withdrawals (Phase 09) ============
  async transactions(params: {
    type?: TransactionType
    status?: TransactionStatus
    q?: string
    page?: number
  } = {}): Promise<ListResponse<AdminTransaction>> {
    const { data } = await api.get<ListResponse<AdminTransaction>>('/admin/transactions', { params })
    return data
  },

  async withdrawals(params: { status?: WithdrawalStatus; q?: string; page?: number } = {}): Promise<ListResponse<AdminWithdrawal>> {
    const { data } = await api.get<ListResponse<AdminWithdrawal>>('/admin/withdrawals', { params })
    return data
  },

  async handleWithdrawal(
    id: number,
    payload: { status: WithdrawalStatus; admin_note?: string },
  ): Promise<AdminWithdrawal> {
    const { data } = await api.patch<{ data: AdminWithdrawal }>(`/admin/withdrawals/${id}/status`, payload)
    return data.data
  },

  // ============ VVIP Management ============
  async subscriberStats(): Promise<{ vvip_active: number; premium_active: number; total: number }> {
    const { data } = await api.get<{ data: { vvip_active: number; premium_active: number; total: number } }>('/admin/subscriber-stats')
    return data.data
  },

  async subscribers(params: { q?: string; tier?: 'premium' | 'vvip' | 'free'; page?: number } = {}): Promise<ListResponse<AdminUser>> {
    const { data } = await api.get<ListResponse<AdminUser>>('/admin/subscribers', { params })
    return data
  },

  async grantVvip(userId: number, days: number): Promise<AdminUser> {
    const { data } = await api.post<{ data: AdminUser }>(`/admin/users/${userId}/grant-vvip`, { days })
    return data.data
  },

  async revokeVvip(userId: number): Promise<AdminUser> {
    const { data } = await api.post<{ data: AdminUser }>(`/admin/users/${userId}/revoke-vvip`)
    return data.data
  },

  // ============ Premium Management ============
  async grantPremium(userId: number, days: number): Promise<AdminUser> {
    const { data } = await api.post<{ data: AdminUser }>(`/admin/users/${userId}/grant-premium`, { days })
    return data.data
  },

  async revokePremium(userId: number): Promise<AdminUser> {
    const { data } = await api.post<{ data: AdminUser }>(`/admin/users/${userId}/revoke-premium`)
    return data.data
  },

  async upgradeToVvip(userId: number, days: number): Promise<AdminUser> {
    const { data } = await api.post<{ data: AdminUser }>(`/admin/users/${userId}/upgrade-to-vvip`, { days })
    return data.data
  },
}

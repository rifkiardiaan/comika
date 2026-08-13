import api from './api'
import type { BookmarkItem, Comment, FollowItem, PaginationMeta, ReadingHistory } from '../types'

export const community = {
  async toggleBookmark(comicId: number): Promise<{ bookmarked: boolean }> {
    const { data } = await api.post<{ data: { bookmarked: boolean } }>(`/comics/${comicId}/bookmark`)
    return data.data
  },

  async toggleFollow(comicId: number): Promise<{ followed: boolean }> {
    const { data } = await api.post<{ data: { followed: boolean } }>(`/comics/${comicId}/follow`)
    return data.data
  },

  async toggleLike(comicId: number): Promise<{ liked: boolean; like_count: number }> {
    const { data } = await api.post<{ data: { liked: boolean; like_count: number } }>(`/comics/${comicId}/like`)
    return data.data
  },

  /** Riwayat baca user (terbaru dulu) — untuk "Lanjutkan Baca". */
  async history(page = 1): Promise<{ data: ReadingHistory[]; meta: PaginationMeta }> {
    const { data } = await api.get<{ data: ReadingHistory[]; meta: PaginationMeta }>('/reader/history', {
      params: { page },
    })
    return data
  },

  /** Komik yang di-bookmark user. */
  async bookmarks(page = 1): Promise<{ data: BookmarkItem[]; meta: PaginationMeta }> {
    const { data } = await api.get<{ data: BookmarkItem[]; meta: PaginationMeta }>('/me/bookmarks', {
      params: { page },
    })
    return data
  },

  /** Komik yang di-follow user. */
  async follows(page = 1): Promise<{ data: FollowItem[]; meta: PaginationMeta }> {
    const { data } = await api.get<{ data: FollowItem[]; meta: PaginationMeta }>('/me/follows', {
      params: { page },
    })
    return data
  },

  /** Komentar sebuah komik (termasuk balasan). */
  async comments(comicId: number, page = 1): Promise<{ data: Comment[]; meta: PaginationMeta }> {
    const { data } = await api.get<{ data: Comment[]; meta: PaginationMeta }>(`/comics/${comicId}/comments`, {
      params: { page },
    })
    return data
  },

  /** Kirim komentar pada komik. */
  async postComment(comicId: number, payload: { content: string; parent_id?: number }): Promise<Comment> {
    const { data } = await api.post<{ data: Comment }>(`/comics/${comicId}/comments`, payload)
    return data.data
  },
}

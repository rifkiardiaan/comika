import api from './api'
import type {
  ComicAnalytics,
  CreatorComic,
  CreatorDashboard,
  CreatorProfile,
  PaginationMeta,
} from '../types'

export const creator = {
  /** Ringkasan statistik creator dashboard. */
  async dashboard(): Promise<CreatorDashboard> {
    const { data } = await api.get<{ data: CreatorDashboard }>('/creator/dashboard')
    return data.data
  },

  /** Daftar komik milik creator + statistik (termasuk draft). */
  async comics(page = 1): Promise<{ data: CreatorComic[]; meta: PaginationMeta }> {
    const { data } = await api.get<{ data: CreatorComic[]; meta: PaginationMeta }>('/creator/comics', {
      params: { page },
    })
    return data
  },

  /** Detail komik milik creator + episode + statistik. */
  async comic(id: number | string): Promise<CreatorComic> {
    const { data } = await api.get<{ data: CreatorComic }>(`/creator/comics/${id}`)
    return data.data
  },

  /** Ajukan komik ke admin untuk direview (tidak langsung tampil publik). */
  async submitComic(id: number | string): Promise<CreatorComic> {
    const { data } = await api.post<{ data: CreatorComic }>(`/creator/comics/${id}/submit`)
    return data.data
  },

  /** Analytics per komik: ringkasan + breakdown per episode. */
  async analytics(id: number | string): Promise<ComicAnalytics> {
    const { data } = await api.get<{ data: ComicAnalytics }>(`/creator/comics/${id}/analytics`)
    return data.data
  },

  /** Profil creator user yang login (dibuat otomatis jika belum ada). */
  async profile(): Promise<CreatorProfile> {
    const { data } = await api.get<{ data: CreatorProfile }>('/creator/profile')
    return data.data
  },

  /** Update profil creator (display_name, bio, banner). */
  async updateProfile(payload: {
    display_name?: string
    bio?: string
    banner?: File | null
  }): Promise<CreatorProfile> {
    const form = new FormData()
    if (payload.display_name !== undefined) form.append('display_name', payload.display_name)
    if (payload.bio !== undefined) form.append('bio', payload.bio)
    if (payload.banner) form.append('banner', payload.banner)
    // Upload file (banner) via POST + method spoofing agar file benar-benar
    // sampai ke backend (PUT multipart tidak diparse di sebagian server).
    form.append('_method', 'PUT')

    const { data } = await api.post<{ data: CreatorProfile }>('/creator/profile', form)
    return data.data
  },
}

import api from './api'
import type { Comic, ComicDetail, Episode, EpisodeDetail, EpisodePage, Genre, PublicCreator } from '../types'

export const content = {
  /** Daftar komik publik dengan filter & pagination. */
  async comics(params: {
    q?: string
    genre?: string
    sort?: 'popular' | 'rating' | 'newest'
    page?: number
    per_page?: number
  } = {}): Promise<{ data: Comic[]; meta: { current_page: number; last_page: number; total: number } }> {
    const { data } = await api.get<{ data: Comic[]; meta: { current_page: number; last_page: number; total: number } }>(
      '/comics',
      { params },
    )
    return data
  },

  /** Detail komik + episode + user_actions (saat login). */
  async comic(id: number | string): Promise<ComicDetail> {
    const { data } = await api.get<{ data: ComicDetail }>(`/comics/${id}`)
    return data.data
  },

  /** Daftar episode komik (menyertakan is_locked/is_unlocked saat login). */
  async episodes(comicId: number | string): Promise<Episode[]> {
    const { data } = await api.get<{ data: Episode[] }>(`/comics/${comicId}/episodes`)
    return data.data
  },

  /** Detail episode + halaman + navigasi prev/next. */
  async episode(id: number | string): Promise<EpisodeDetail> {
    const { data } = await api.get<{ data: EpisodeDetail }>(`/episodes/${id}`)
    return data.data
  },

  /** Profil creator publik — dari kartu komik / nama creator. */
  async creator(id: number | string): Promise<PublicCreator> {
    const { data } = await api.get<{ data: PublicCreator }>(`/creators/${id}`)
    return data.data
  },

  /** Daftar genre — publik. */
  async genres(): Promise<Genre[]> {
    const { data } = await api.get<{ data: Genre[] }>('/genres')
    return data.data
  },

  // ============ Creator: Comic CRUD ============

  /** Buat komik baru (creator). */
  async createComic(payload: FormData): Promise<Comic> {
    const { data } = await api.post<{ data: Comic }>('/comics', payload)
    return data.data
  },

  /** Update komik milik creator. */
  async updateComic(id: number, payload: FormData): Promise<Comic> {
    // Upload cover via POST + method spoofing agar file benar-benar sampai
    // (PUT multipart tidak diparse di sebagian server).
    payload.append('_method', 'PUT')
    const { data } = await api.post<{ data: Comic }>(`/comics/${id}`, payload)
    return data.data
  },

  /** Hapus komik milik creator (soft delete). */
  async deleteComic(id: number): Promise<void> {
    await api.delete(`/comics/${id}`)
  },

  // ============ Creator: Episode CRUD ============

  /** Buat episode baru pada komik. */
  async createEpisode(
    comicId: number,
    payload: { title: string; number?: number; is_premium?: boolean; price_coin?: number },
  ): Promise<Episode> {
    const { data } = await api.post<{ data: Episode }>(`/comics/${comicId}/episodes`, payload)
    return data.data
  },

  /** Update episode milik creator. */
  async updateEpisode(
    id: number,
    payload: { title?: string; is_premium?: boolean; price_coin?: number },
  ): Promise<Episode> {
    const { data } = await api.put<{ data: Episode }>(`/episodes/${id}`, payload)
    return data.data
  },

  /** Hapus episode (soft delete). */
  async deleteEpisode(id: number): Promise<void> {
    await api.delete(`/episodes/${id}`)
  },

  /** Publikasikan episode. */
  async publishEpisode(id: number): Promise<Episode> {
    const { data } = await api.post<{ data: Episode }>(`/episodes/${id}/publish`)
    return data.data
  },

  // ============ Creator: Halaman episode ============

  /** Unggah halaman episode (banyak sekaligus). */
  async uploadPages(episodeId: number, files: File[]): Promise<EpisodePage[]> {
    const form = new FormData()
    files.forEach((file) => form.append('pages[]', file))
    const { data } = await api.post<{ data: EpisodePage[] }>(`/episodes/${episodeId}/pages`, form)
    return data.data
  },

  /** Hapus halaman episode. */
  async deletePage(pageId: number): Promise<void> {
    await api.delete(`/episodes/pages/${pageId}`)
  },
}

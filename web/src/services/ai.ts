import api from './api'
import type { AiCharacterResult, AiGenresTagsResult, AiOutlineResult, AiSynopsisResult, AiTitleResult } from '../types'

/**
 * AI Assistant (blueprint 27) — alat bantu menulis untuk creator.
 * Backend memakai OpenAI-compatible API bila dikonfigurasi, atau
 * generator rule-based bawaan bila tidak (tetap berfungsi untuk demo).
 */

/** Status konfigurasi AI (untuk menampilkan badge mode di UI). */
async function status(): Promise<{ configured: boolean }> {
  const res = await api.get('/ai/status')
  return { configured: Boolean(res.data.data?.configured) }
}

/** Generate ide judul komik. */
async function titles(payload: {
  topic?: string
  synopsis?: string
  genres?: string[]
  keywords?: string
  count?: number
}): Promise<AiTitleResult> {
  const res = await api.post('/ai/titles', payload)
  return res.data.data
}

/** Generate sinopsis komik. */
async function synopsis(payload: {
  title?: string
  topic?: string
  genres?: string[]
  keywords?: string
}): Promise<AiSynopsisResult> {
  const res = await api.post('/ai/synopsis', payload)
  return res.data.data
}

/** Rekomendasi genre & tag. */
async function genresTags(payload: {
  title?: string
  synopsis?: string
  topic?: string
}): Promise<AiGenresTagsResult> {
  const res = await api.post('/ai/genres-tags', payload)
  return res.data.data
}

/** Generate konsep karakter. */
async function character(payload: {
  role?: string
  genres?: string[]
  topic?: string
}): Promise<AiCharacterResult> {
  const res = await api.post('/ai/character', payload)
  return res.data.data
}

/** Generate outline episode. */
async function outline(payload: {
  title?: string
  synopsis?: string
  genres?: string[]
  count?: number
}): Promise<AiOutlineResult> {
  const res = await api.post('/ai/outline', payload)
  return res.data.data
}

export const ai = { status, titles, synopsis, genresTags, character, outline }

import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  headers: { Accept: 'application/json' },
  timeout: 20000,
})

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('comika_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as (InternalAxiosRequestConfig & { _retryCount?: number }) | undefined

    // Auth expired — clear token
    if (error.response?.status === 401) {
      localStorage.removeItem('comika_token')
    }

    // Don't retry aborted or canceled requests
    if (error.code === 'ERR_CANCELED' || error.name === 'CanceledError') {
      return Promise.reject(error)
    }

    // Jangan retry request yang timeout (ECONNABORTED) — server lambat/hang
    // tidak akan pulih dalam 1-2 detik, dan retry hanya memperparah antrian
    // (terutama pada server single-threaded / beban tinggi).
    if (error.code === 'ECONNABORTED') {
      return Promise.reject(error)
    }

    // Retry on network errors or 5xx (not 4xx validation errors)
    if (
      config &&
      (!error.response || error.response.status >= 500) &&
      config.method === 'get' &&
      (config._retryCount ?? 0) < 2
    ) {
      config._retryCount = (config._retryCount ?? 0) + 1
      await new Promise((r) => setTimeout(r, 1000 * config._retryCount!))
      return api(config)
    }

    return Promise.reject(error)
  },
)

export default api

/**
 * Catat aktivitas "Download Offline" ke backend (feature 13 — Riwayat
 * Aktivitas). Dipanggil fire-and-forget setelah komik berhasil disimpan
 * offline — kegagalan logging tidak memengaruhi alur download.
 */
export async function logOfflineDownload(
  comicId: number,
  episodeCount: number,
  pageCount: number,
): Promise<void> {
  try {
    await api.post(`/comics/${comicId}/download-log`, {
      episode_count: episodeCount,
      page_count: pageCount,
    })
  } catch {
    // Best-effort: abaikan bila gagal (mis. offline setelah download selesai)
  }
}

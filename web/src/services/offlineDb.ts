/* ------------------------------------------------------------------ */
/* COMIKA — Offline storage (IndexedDB)                                */
/* Menyimpan metadata komik + seluruh halaman episode (gambar) agar    */
/* bisa dibaca offline di halaman Komik Offline.                       */
/* ------------------------------------------------------------------ */
import { content } from './content'

export interface StoredPage {
  page_number: number
  blob: Blob
}

export interface StoredEpisode {
  id: number
  number: number
  title: string
  is_premium: boolean
  /** Episode premium yang masih terkunci saat unduh (halaman tidak ikut tersimpan). */
  locked?: boolean
  pages: StoredPage[]
}

export interface OfflineComic {
  key: string
  userId: number
  comicId: number
  savedAt: string
  comic: { id: number; title: string; age_rating?: string | null }
  coverBlob: Blob | null
  episodes: StoredEpisode[]
  totalPages: number
  totalEpisodes: number
  /** Jumlah episode premium yang terkunci (tidak ikut diunduh). */
  skippedLocked?: number
}

export interface DownloadProgress {
  phase: 'fetching' | 'images'
  label: string
  done: number
  total: number
}

const DB_NAME = 'comika-offline'
const STORE = 'comics'

let dbPromise: Promise<IDBDatabase> | null = null

function openDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: 'key' })
        store.createIndex('userId', 'userId', { unique: false })
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
  return dbPromise
}

function txStore(mode: IDBTransactionMode): Promise<IDBObjectStore> {
  return openDb().then(
    (db) => db.transaction(STORE, mode).objectStore(STORE),
  )
}

function reqToPromise<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

const keyOf = (userId: number, comicId: number) => `${userId}:${comicId}`

/** Simpan seluruh data komik offline (satu transaksi). */
export async function dbPutComic(entry: OfflineComic): Promise<void> {
  const store = await txStore('readwrite')
  await new Promise<void>((resolve, reject) => {
    const req = store.put(entry)
    req.onsuccess = () => resolve()
    req.onerror = () => reject(req.error)
  })
}

/** Ambil semua komik offline milik user (diurutkan terbaru). */
export async function dbListComics(userId: number): Promise<OfflineComic[]> {
  const store = await txStore('readonly')
  const index = store.index('userId')
  const rows = await reqToPromise(index.getAll(userId))
  return (rows as OfflineComic[]).sort((a, b) => (a.savedAt < b.savedAt ? 1 : -1))
}

export async function dbGetComic(userId: number, comicId: number): Promise<OfflineComic | undefined> {
  const store = await txStore('readonly')
  return reqToPromise(store.get(keyOf(userId, comicId)))
}

export async function dbIsSaved(userId: number, comicId: number): Promise<boolean> {
  const entry = await dbGetComic(userId, comicId)
  return !!entry
}

export async function dbDeleteComic(userId: number, comicId: number): Promise<void> {
  const store = await txStore('readwrite')
  await new Promise<void>((resolve, reject) => {
    const req = store.delete(keyOf(userId, comicId))
    req.onsuccess = () => resolve()
    req.onerror = () => reject(req.error)
  })
}

/**
 * URL kandidat untuk sebuah gambar. Backend bisa mengembalikan URL dengan
 * host yang salah (mis. APP_URL berisi localhost / domain lama di hosting),
 * sehingga fetch blob gagal walau <img> tampak "ok" (browser menampilkan
 * fallback emoji di reader). Karena API web relatif (/api/v1), host API =
 * host aplikasi → coba jalur yang sama pada origin aplikasi sebagai fallback.
 */
function imageCandidates(url: string): string[] {
  const list: string[] = [url]
  try {
    const parsed = new URL(url, window.location.href)
    if (parsed.origin !== window.location.origin) {
      list.push(`${window.location.origin}${parsed.pathname}${parsed.search}`)
    }
  } catch {
    // URL relatif / tidak valid — coba langsung dari origin aplikasi
    list.push(`${window.location.origin}/${url.replace(/^\/+/, '')}`)
  }
  return [...new Set(list)]
}

async function fetchBlob(url: string): Promise<Blob> {
  let lastErr: unknown = new Error('Gagal mengambil gambar')
  for (const candidate of imageCandidates(url)) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const res = await fetch(candidate, { credentials: 'same-origin', cache: 'force-cache' })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return await res.blob()
      } catch (err) {
        lastErr = err
        // Jeda singkat antar percobaan (jaringan tidak stabil)
        await new Promise((r) => setTimeout(r, 250 * (attempt + 1)))
      }
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error('Gagal mengambil gambar')
}

export interface DownloadOptions {
  userId: number
  comicId: number
  /** Dipanggil saat progres berubah. */
  onProgress?: (p: DownloadProgress) => void
  /** Batalkan unduhan (memberhentikan di halaman berikutnya). */
  signal?: AbortSignal
}

const abortError = () => new DOMException('Aborted', 'AbortError')

/**
 * Unduh episode komik (gambar halaman) yang bisa diakses akun ke IndexedDB.
 * Hanya episode gratis / sudah terbuka (koin dibayar / akun VVIP aktif) yang
 * ikut tersimpan. Episode premium yang masih terkunci dilewati seluruhnya —
 * user harus membuka dengan koin atau berlangganan VVIP terlebih dahulu.
 */
export async function downloadComicOffline(opts: DownloadOptions): Promise<OfflineComic> {
  const { userId, comicId, onProgress, signal } = opts
  if (!signal) throw new Error('signal required')

  const throwIfAborted = () => {
    if (signal.aborted) throw abortError()
  }

  const detail = await content.comic(String(comicId))
  throwIfAborted()

  const episodesMeta = detail.episodes ?? []
  onProgress?.({ phase: 'fetching', label: 'Menyiapkan episode…', done: 0, total: episodesMeta.length })

  const coverBlob = detail.cover_url ? await fetchBlob(detail.cover_url).catch(() => null) : null
  throwIfAborted()

  const episodes: StoredEpisode[] = []
  let totalPages = 0
  let fetchFailed = false
  let pageFetchFailures = 0
  let pagesFromServer = 0
  let lockedPremium = 0 // episode premium terkunci: dilewati seluruhnya (tidak disimpan)

  for (let i = 0; i < episodesMeta.length; i++) {
    const ep = episodesMeta[i]
    throwIfAborted()
    onProgress?.({ phase: 'fetching', label: `Mengunduh Episode ${ep.number}…`, done: i, total: episodesMeta.length })

    // Detail episode dari server menyertakan status akses sesuai akun yang
    // login (is_locked dihitung server: VVIP / sudah unlock koin → terbuka;
    // premium belum dibeli → terkunci & pages dikosongkan).
    let epDetail: Awaited<ReturnType<typeof content.episode>> | null = null
    try {
      epDetail = await content.episode(String(ep.id))
    } catch {
      // Episode gagal diambil (belum terbit / sudah dihapus): jangan simpan entri kosong.
      fetchFailed = true
      continue
    }
    throwIfAborted()

    // Premium terkunci — halaman tidak disediakan server. Episode berbayar
    // hanya boleh disimpan offline setelah dibuka (koin) atau tersedia untuk
    // akun VVIP, jadi episode yang masih terkunci dilewati seluruhnya.
    if (epDetail.is_locked === true) {
      lockedPremium += 1
      continue
    }

    const pages = epDetail.pages ?? []
    pagesFromServer += pages.length
    const storedPages: StoredPage[] = []
    for (const page of pages) {
      throwIfAborted()
      onProgress?.({ phase: 'images', label: `Halaman ${page.page_number} — Episode ${ep.number}`, done: storedPages.length + 1, total: pages.length })
      try {
        const blob = await fetchBlob(page.image_url)
        storedPages.push({ page_number: page.page_number, blob })
        totalPages += 1
      } catch {
        // Halaman gagal diunduh — hitung & lanjut ke halaman lain
        pageFetchFailures += 1
      }
    }

    episodes.push({
      id: ep.id,
      number: ep.number,
      title: ep.title,
      is_premium: !!epDetail.is_premium,
      pages: storedPages,
    })
  }

  throwIfAborted()

  // Jangan pernah simpan entri yang tidak bisa dibaca offline sama sekali —
  // membuat pengguna mengira unduhan sukses padahal tidak ada satu gambar pun.
  if (episodesMeta.length === 0) {
    throw new Error('Komik belum memiliki episode terbit yang bisa diunduh.')
  }
  if (totalPages === 0) {
    // Tidak ada satu halaman pun yang tersimpan & tidak ada episode yang
    // memenuhi syarat → episode berbayar belum dibuka (koin / VVIP).
    if (lockedPremium > 0 && episodes.length === 0) {
      throw new Error(
        'Semua episode komik ini premium dan masih terkunci. Buka episode dengan koin atau aktifkan akun VVIP, lalu coba unduh lagi agar halamannya ikut tersimpan.',
      )
    }
    const reason = fetchFailed
      ? 'Halaman episode gagal diambil dari server (komik mungkin belum diterbitkan atau koneksi terputus).'
      : pageFetchFailures > 0
        ? `Halaman gambar gagal diunduh (0 dari ${pagesFromServer} halaman). Pastikan koneksi internet stabil dan penyimpanan gambar server aktif, lalu coba lagi.`
        : pagesFromServer === 0
          ? 'Server belum mengembalikan halaman untuk episode ini. Pastikan komik sudah disetujui & episode sudah terbit, lalu coba lagi.'
          : 'Episode tidak memiliki halaman yang bisa diunduh. Pastikan komik sudah disetujui & episode sudah terbit, lalu coba lagi.'
    throw new Error(`Unduhan gagal: ${reason}`)
  }

  const entry: OfflineComic = {
    key: keyOf(userId, comicId),
    userId,
    comicId,
    savedAt: new Date().toISOString(),
    comic: { id: detail.id, title: detail.title, age_rating: detail.age_rating },
    coverBlob,
    episodes,
    totalPages,
    totalEpisodes: episodes.length,
    skippedLocked: lockedPremium,
  }

  await dbPutComic(entry)
  return entry
}

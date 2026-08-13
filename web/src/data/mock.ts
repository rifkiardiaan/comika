import type { Comic, CreatorProfile, Episode, EpisodePage, Genre } from '../types'

export const genres: Genre[] = [
  { id: 1, slug: 'action', name: 'Action' },
  { id: 2, slug: 'romance', name: 'Romance' },
  { id: 3, slug: 'fantasy', name: 'Fantasy' },
  { id: 4, slug: 'drama', name: 'Drama' },
  { id: 5, slug: 'comedy', name: 'Komedi' },
  { id: 6, slug: 'horror', name: 'Horor' },
  { id: 7, slug: 'sci-fi', name: 'Sci-Fi' },
  { id: 8, slug: 'slice-of-life', name: 'Slice of Life' },
  { id: 9, slug: 'thriller', name: 'Thriller' },
  { id: 10, slug: 'adventure', name: 'Petualangan' },
]

const g = (ids: number[]) => ids.map((id) => genres.find((x) => x.id === id)!).filter(Boolean)

const covers: Record<string, { from: string; to: string; emoji: string }> = {
  moon: { from: '#1e1b4b', to: '#7c3aed', emoji: '🌙' },
  dragon: { from: '#7f1d1d', to: '#f59e0b', emoji: '🐉' },
  love: { from: '#831843', to: '#ec4899', emoji: '💘' },
  ghost: { from: '#14532d', to: '#22c55e', emoji: '👻' },
  robot: { from: '#0c4a6e', to: '#06b6d4', emoji: '🤖' },
  sword: { from: '#292524', to: '#78716c', emoji: '⚔️' },
  coffee: { from: '#78350f', to: '#f97316', emoji: '☕' },
  detective: { from: '#1e3a8a', to: '#3b82f6', emoji: '🕵️' },
  tower: { from: '#3b0764', to: '#a855f7', emoji: '🗼' },
  fox: { from: '#7c2d12', to: '#ef4444', emoji: '🦊' },
  star: { from: '#134e4a', to: '#14b8a6', emoji: '✨' },
  skull: { from: '#111827', to: '#6b7280', emoji: '💀' },
}

export const coverStyle = (key: string) => {
  const c = covers[key] ?? covers.star
  return `linear-gradient(160deg, ${c.from}, ${c.to})`
}
export const coverEmoji = (key: string) => (covers[key] ?? covers.star).emoji

const comicDefs: Array<{ key: string; title: string; synopsis: string; genreIds: number[]; status: Comic['status']; rating: number; views: number; likes: number }> = [
  { key: 'moon', title: 'Bulan di Ujung Jari', synopsis: 'Seorang pelukis jalanan menemukan kuas ajaib yang bisa menggambar pintu menuju dunia lain. Setiap malam purnama, dunia yang ia lukis menjadi nyata — dan mulai menginginkannya kembali.', genreIds: [3, 1, 8], status: 'ongoing', rating: 4.8, views: 1284000, likes: 45200 },
  { key: 'dragon', title: 'Naga Terakhir', synopsis: 'Setelah 500 tahun bersembunyi, naga terakhir bangkit di era modern. Remaja bernama Bima terpilih menjadi penjaganya — padahal ia hanya ingin lulus SMA dengan tenang.', genreIds: [1, 3, 10], status: 'ongoing', rating: 4.6, views: 982000, likes: 33100 },
  { key: 'love', title: 'Cinta Tak Berbalas', synopsis: 'Setiap hari Laras menulis surat cinta yang tak pernah ia kirim. Suatu hari, semua surat itu menemukan jalannya sendiri — dan sampai ke orang yang salah.', genreIds: [2, 4], status: 'ongoing', rating: 4.5, views: 756000, likes: 28900 },
  { key: 'ghost', title: 'Kost Paranormal', synopsis: 'Kost murah di pinggir kota ternyata dihuni penghuni lain: hantu-hantu baik hati yang butuh bantuan menyelesaikan urusan duniawi mereka. Komedi horor yang menghangatkan hati.', genreIds: [6, 5, 8], status: 'completed', rating: 4.4, views: 642000, likes: 21000 },
  { key: 'robot', title: 'Rekan Buatan', synopsis: 'Di tahun 2147, android generasi terbaru diberi satu misi: menjadi sahabat bagi anak-anak yang kesepian. Tapi apa jadinya jika android itu mulai bertanya tentang perasaannya sendiri?', genreIds: [7, 4], status: 'ongoing', rating: 4.7, views: 1105000, likes: 39800 },
  { key: 'sword', title: 'Pedang Senja', synopsis: 'Dunia di ambang kegelapan abadi. Satu-satunya harapan adalah pedang legendaris yang hanya bisa diangkat oleh mereka yang tak punya apa-apa untuk dilindungi.', genreIds: [1, 3, 9], status: 'hiatus', rating: 4.3, views: 523000, likes: 17400 },
  { key: 'coffee', title: 'Secangkir Kenangan', synopsis: 'Kedai kopi kecil di sudut kota menyimpan rahasia: setiap cangkir yang disajikan bisa mengembalikan satu kenangan pelanggannya. Cerita slice-of-life tentang cinta, kehilangan, dan harapan.', genreIds: [8, 2, 4], status: 'completed', rating: 4.9, views: 890000, likes: 41200 },
  { key: 'detective', title: 'Kasus Nol', synopsis: 'Detektif muda yang skeptis dipaksa bekerja sama dengan paranormal jenius untuk memecahkan "kasus nol" — pembunuhan yang terjadi sebelum korban lahir.', genreIds: [9, 6, 7], status: 'ongoing', rating: 4.6, views: 668000, likes: 22500 },
  { key: 'tower', title: 'Menara Tanpa Puncak', synopsis: 'Menara misterius muncul di tengah kota setiap 100 tahun. Seorang pendaki bernama Sakura masuk sendirian untuk menemukan jawaban di lantai teratas — yang tak pernah ada.', genreIds: [3, 9, 10], status: 'ongoing', rating: 4.7, views: 745000, likes: 26800 },
  { key: 'fox', title: 'Si Rubah Juga', synopsis: 'Rubah berbulu sembilan yang bisa berubah wujud memutuskan menjadi YouTuber agar bisa membeli mahkota surgawi. Petualangan konyol dengan sentuhan mitologi.', genreIds: [5, 3], status: 'ongoing', rating: 4.2, views: 334000, likes: 11900 },
  { key: 'star', title: 'Jatuh dari Bintang', synopsis: 'Bintang jatuh yang menjelma gadis kecil menumpang hidup di rumah seorang penyendiri. Ia mencoba memahami dunia manusia — dan manusia belajar merindukan langit.', genreIds: [8, 2, 3], status: 'ongoing', rating: 4.5, views: 587000, likes: 20300 },
  { key: 'skull', title: 'Tengkorak Tertawa', synopsis: 'Setiap orang yang menerima tengkorak ukiran misterius akan tertawa tanpa henti selama 24 jam. Seorang reporter mengejar asal usulnya — dan menemukan dirinya sebagai target berikutnya.', genreIds: [6, 9], status: 'hiatus', rating: 4.1, views: 289000, likes: 9800 },
]

// Key cover per komik (disimpan per definisi, bukan dari slug berbahasa Indonesia)
const coverKeys = comicDefs.map((c) => c.key)

export const coverKeyOf = (comicId: number): string => coverKeys[comicId - 1] ?? 'star'

export const mockComics: Comic[] = comicDefs.map((c, i) => ({
  id: i + 1,
  title: c.title,
  slug: c.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
  synopsis: c.synopsis,
  cover_url: null,
  status: c.status,
  age_rating: 'remaja',
  rating_avg: c.rating,
  rating_count: Math.floor(c.likes / 3),
  like_count: c.likes,
  view_count: c.views,
  creator: { id: (i % 4) + 1, name: ['Studio Kertas', 'Malam Karya', 'Tinta Utara', 'Cerita Hujan'][i % 4] },
  genres: g(c.genreIds),
  episode_count: 12 + ((i * 7) % 60),
  created_at: '2026-01-01T00:00:00.000Z',
}))

export const mockCreators: CreatorProfile[] = [
  { id: 1, user_id: 1, display_name: 'Studio Kertas', bio: 'Studio kecil dari Yogyakarta yang percaya setiap halaman punya cerita.', banner_url: null, is_verified: true, created_at: '', updated_at: '' },
  { id: 2, user_id: 2, display_name: 'Malam Karya', bio: 'Menggambar lebih baik di malam hari. Terima kasih sudah mampir.', banner_url: null, is_verified: true, created_at: '', updated_at: '' },
  { id: 3, user_id: 3, display_name: 'Tinta Utara', bio: 'Komik aksi dengan tinta setebal hujan di Jakarta.', banner_url: null, is_verified: false, created_at: '', updated_at: '' },
  { id: 4, user_id: 4, display_name: 'Cerita Hujan', bio: 'Cerita-cerita hangat untuk hari yang dingin.', banner_url: null, is_verified: true, created_at: '', updated_at: '' },
]

export const mockEpisodes = (comicId: number): Episode[] =>
  Array.from({ length: 24 }, (_, i) => ({
    id: comicId * 100 + i + 1,
    comic_id: comicId,
    title: `Episode ${i + 1}: ${['Awal Perjalanan', 'Jejak yang Hilang', 'Pertemuan Tak Terduga', 'Rahasia Terbongkar', 'Badai Datang', 'Pilihan Sulit', 'Bayangan Lama', 'Kebangkitan', 'Persahabatan Baru', 'Ujian Berat'][i % 10]}`,
    number: i + 1,
    status: 'published',
    is_premium: i >= 5,
    price_coin: i >= 5 ? 50 : 0,
    view_count: Math.floor(Math.random() * 40000) + 5000,
    like_count: Math.floor(Math.random() * 4000) + 200,
    published_at: new Date(2026, 0, 1 + i * 3).toISOString(),
    created_at: new Date(2026, 0, 1 + i * 3).toISOString(),
  }))

export const mockPages = (episodeId: number): EpisodePage[] =>
  Array.from({ length: 12 }, (_, i) => ({
    id: episodeId * 100 + i,
    episode_id: episodeId,
    page_number: i + 1,
    image_url: `${episodeId}-p${i + 1}`,
  }))

export const mockComments = [
  { id: 1, user: { id: 5, name: 'Rina Puspita', avatar_url: null }, content: 'Plot twist-nya bikin merinding! Auto ikut terus 😭🔥', like_count: 128, created_at: '2026-07-30T10:00:00.000Z' },
  { id: 2, user: { id: 6, name: 'Agus Komik', avatar_url: null }, content: 'Gambarnya makin bagus tiap episode. Creator-nya konsisten banget.', like_count: 87, created_at: '2026-07-31T14:30:00.000Z' },
  { id: 3, user: { id: 7, name: 'Dewi Lestari', avatar_url: null }, content: 'Akhirnya episode baru! Tungguannya kebayar lunas 🙏', like_count: 54, created_at: '2026-08-01T09:15:00.000Z' },
]

# Konvensi API COMIKA

## Umum

- Prefix: `/api/v1`
- REST convention, Laravel API Resources untuk serialisasi
- Pagination: `per_page`, `page` (Laravel LengthAwarePaginator)
- Auth: `Authorization: Bearer <token>` (Sanctum)
- Rate limiting: 60 req/menit per user/IP

## Format Respons

**Sukses**
```json
{ "success": true, "message": "Success", "data": {} }
```

**Error**
```json
{ "success": false, "message": "Error", "errors": {} }
```

## Modul (Roadmap)

| Modul | Endpoint utama |
|-------|---------------|
| `auth` | register, login, logout, me |

## Autentikasi (Phase 03 — ✅ Selesai)

| Method | Endpoint | Auth | Keterangan |
|--------|----------|------|------------|
| POST | `/api/v1/auth/register` | ❌ | Daftar akun (role reader) + buat wallet, throttle 5/mnt |
| POST | `/api/v1/auth/login` | ❌ | Login, balikan token Bearer, throttle 5/mnt |
| POST | `/api/v1/auth/logout` | ✅ | Cabut token aktif |
| GET | `/api/v1/auth/me` | ✅ | Profil user yang login |

**Respons login/register:** `{ success, message, data: { user, token, token_type } }`

- Token: Sanctum personal access token, berlaku 30 hari, multi-perangkat.
- Password di-hash otomatis (cast `hashed`), minimal 8 karakter + konfirmasi.
- Email & username unique; email dinormalisasi lowercase; user soft-deleted tidak memblokir re-registrasi.
- Error konsisten: `{ success: false, message, errors }` (validasi 422, unauth 401, not found 404, server 500).
| `comics` | list, detail, create, update, delete |
| `episodes` | list, detail, create, update, delete, publish |
| `genres` | list |

## Comic Core (Phase 04 — ✅ Selesai)

| Method | Endpoint | Auth | Keterangan |
|--------|----------|------|------------|
| GET | `/api/v1/genres` | ❌ | Daftar genre |
| GET | `/api/v1/comics` | ❌ | List komik (filter: `q`, `genre`, `sort=popular\|rating\|newest`) + pagination `meta` |
| GET | `/api/v1/comics/{comic}` | ❌ | Detail komik + episode published |
| GET | `/api/v1/comics/{comic}/episodes` | ❌* | List episode (publik: published; pemilik: semua) |
| GET | `/api/v1/episodes/{episode}` | ❌* | Detail episode + halaman (draft hanya untuk pemilik) |
| POST | `/api/v1/comics` | 🔒 creator | Buat komik (cover upload, genres) |
| PUT/PATCH | `/api/v1/comics/{comic}` | 🔒 pemilik | Update komik |
| DELETE | `/api/v1/comics/{comic}` | 🔒 pemilik | Soft delete komik |
| POST | `/api/v1/comics/{comic}/episodes` | 🔒 pemilik | Buat episode (nomor unik per komik) |
| PUT/PATCH | `/api/v1/episodes/{episode}` | 🔒 pemilik | Update episode |
| DELETE | `/api/v1/episodes/{episode}` | 🔒 pemilik | Soft delete episode |
| POST | `/api/v1/episodes/{episode}/publish` | 🔒 pemilik | Publish (wajib ≥1 halaman) |
| POST | `/api/v1/episodes/{episode}/pages` | 🔒 pemilik | Upload halaman (max 60 file, 3MB/file) |
| DELETE | `/api/v1/episodes/pages/{page}` | 🔒 pemilik | Hapus halaman |

**Aturan:**
- Otorisasi: middleware `creator` (role) + Policy (kepemilikan) — `{success:false, message, errors}` untuk 403.
- File tersimpan di `storage/app/public/comic-covers` & `comic-pages/{episode_id}` — DB hanya menyimpan path.
- Validasi upload: image, mimes jpeg/png/webp, ukuran terbatas, nama file unik (Laravel `store()`).
- Slug unik otomatis dari judul (fallback `untitled` untuk judul simbol).
- Episode pertama otomatis gratis (bukan premium).

## Reader (Phase 05 — ✅ Selesai)

| Method | Endpoint | Auth | Keterangan |
|--------|----------|------|------------|
| GET | `/api/v1/reader/history` | ✅ | Riwayat baca user (terbaru dulu) + pagination `meta` |
| POST | `/api/v1/reader/progress` | ✅ | Rekam/perbarui progress baca (upsert per user+episode) |

**Body `POST /reader/progress`:** `episode_id` (wajib), `last_page` (wajib, min 1), `progress` (opsional, 0–100), `is_completed` (opsional).

**Fitur pelengkap reader:**
- `GET /comics/{comic}` menyertakan `user_progress` saat login — untuk tombol **Lanjutkan Baca** (episode terakhir, halaman, persen, selesai/belum).
- `GET /episodes/{episode}` menyertakan `prev`/`next` (id, number, title) untuk navigasi antar episode; draft hanya untuk pemilik.
- View count episode + komik bertambah **sekali per user per episode** (saat baris progress pertama dibuat) — anti spam refresh.
- `last_page` di-clamp ke jumlah halaman; melewati halaman terakhir otomatis menandai `is_completed: true`.
- Riwayat diurutkan `updated_at` desc, tie-break `id` desc (terbaru dulu).

## Community (Phase 06 — ✅ Selesai)

| Method | Endpoint | Auth | Keterangan |
|--------|----------|------|------------|
| POST | `/api/v1/comics/{comic}/bookmark` | ✅ | Toggle bookmark → `{ bookmarked }` |
| GET | `/api/v1/me/bookmarks` | ✅ | Daftar komik di-bookmark + pagination `meta` |
| POST | `/api/v1/comics/{comic}/follow` | ✅ | Toggle follow → `{ followed }` |
| GET | `/api/v1/me/follows` | ✅ | Daftar komik di-follow + pagination |
| POST | `/api/v1/comics/{comic}/like` | ✅ | Toggle like komik → `{ liked, like_count }` |
| POST | `/api/v1/episodes/{episode}/like` | ✅ | Toggle like episode (published saja) |
| POST | `/api/v1/comments/{comment}/like` | ✅ | Toggle like komentar |
| POST | `/api/v1/comics/{comic}/rating` | ✅ | Upsert rating 1–5 → rating + `rating_avg` + `rating_count` |
| GET | `/api/v1/comics/{comic}/comments` | ❌ | List komentar komik (top-level + balasan), paginated |
| GET | `/api/v1/episodes/{episode}/comments` | ❌ | List komentar episode |
| POST | `/api/v1/comics/{comic}/comments` | ✅ | Kirim komentar / balasan (`parent_id`), throttle 30/mnt |
| POST | `/api/v1/episodes/{episode}/comments` | ✅ | Komentar episode (published) |
| PUT/PATCH | `/api/v1/comments/{comment}` | ✅ pemilik | Ubah komentar sendiri |
| DELETE | `/api/v1/comments/{comment}` | ✅ pemilik | Hapus komentar + balasannya |

**Aturan:**
- Detail komik (`GET /comics/{comic}`) menyertakan `user_actions` `{ is_bookmarked, is_followed, is_liked, user_rating }` saat login.
- Balasan komentar hanya 1 level (reply ke reply ditolak 422); parent harus komentar aktif di komik/konteks yang sama.
- `like_count` komik/episode/komentar disinkronkan otomatis saat toggle; counter tidak bisa negatif.
- `rating_avg` & `rating_count` dihitung ulang otomatis setiap ada rating (upsert per user+komik).
- Otorisasi komentar: Policy (pemilik/admin) → 403 format konsisten.

## Creator (Phase 07 — ✅ Selesai)

| Method | Endpoint | Auth | Keterangan |
|--------|----------|------|------------|
| GET | `/api/v1/creator/profile` | 🔒 creator | Profil creator (auto-create jika belum ada) |
| PUT | `/api/v1/creator/profile` | 🔒 creator | Update profil (`display_name`, `bio`, `banner` upload ≤2MB) |
| GET | `/api/v1/creator/dashboard` | 🔒 creator | Ringkasan statistik: komik, episode, views, likes, followers, komentar, rating_avg, earnings, episode & komentar terbaru |
| GET | `/api/v1/creator/comics` | 🔒 creator | Daftar komik sendiri (termasuk draft) + statistik per komik |
| GET | `/api/v1/creator/comics/{comic}` | 🔒 pemilik | Detail komik sendiri + episode (draft ikut) + statistik |
| GET | `/api/v1/creator/comics/{comic}/analytics` | 🔒 pemilik | Analytics komik: ringkasan + breakdown per episode (views, likes, comments, page_count) |

**Aturan:**
- Semua endpoint butuh role `creator` (middleware) + kepemilikan (Policy `ComicPolicy`).
- Banner tersimpan di `storage/app/public/creator-banners`.
- `rating_avg` di dashboard = rata-rata rating komik yang punya rating.
- Earnings (pending/paid) dibaca dari tabel `creator_earnings` — diisi penuh di Phase 09 (Monetization).
| `reader` | history, progress, bookmark, like, follow, rating |
| `comments` | list, create, update, delete |
| `creator` | dashboard, comics, episodes, analytics, earnings |
| `admin` | dashboard, users, creators, comics, reports, transactions, withdrawals |

## Monetization (Phase 09 — 🔄 Backend ✅)

| Method | Endpoint | Auth | Keterangan |
|--------|----------|------|------------|
| GET | `/api/v1/coin-packages` | ❌ | Daftar paket koin aktif |
| POST | `/api/v1/coin-packages/{package}/purchase` | ✅ | Beli paket koin (MVP: pembayaran disimulasikan sukses) |
| GET | `/api/v1/me/wallet` | ✅ | Ringkasan dompet: balance, total koin terpakai, jumlah unlock |
| GET | `/api/v1/me/transactions` | ✅ | Riwayat transaksi user + pagination `meta` |
| GET | `/api/v1/me/unlocks` | ✅ | Daftar episode premium yang sudah di-unlock |
| POST | `/api/v1/episodes/{episode}/unlock` | ✅ | Unlock episode premium (idempotent; 201 baru / 200 sudah) |
| GET | `/api/v1/creator/earnings` | 🔒 creator | Ringkasan earning (pending/paid/available) + riwayat |
| GET | `/api/v1/creator/withdrawals` | 🔒 creator | Daftar penarikan dana sendiri |
| POST | `/api/v1/creator/withdrawals` | 🔒 creator | Ajukan penarikan (`amount`, `bank_name`, `bank_account`, `bank_holder`) |
| GET | `/api/v1/admin/transactions` | 🔒 admin | Semua transaksi platform (filter `type`, `status`, `q`) |
| GET | `/api/v1/admin/withdrawals` | 🔒 admin | Semua penarikan (pending didahulukan) |
| PATCH | `/api/v1/admin/withdrawals/{withdrawal}/status` | 🔒 admin | `approved` / `rejected` / `paid` + `admin_note` |

**Aturan finansial:**
- Semua operasi koin & uang berjalan dalam **database transaction**; `wallets.coin_balance` adalah sumber kebenaran saldo (kolom `users.coin_balance` disinkronkan otomatis).
- Referensi transaksi unik & immutable (`PUR-…`/`UNL-…`/`WDL-…`) — cegah pemrosesan ganda.
- Server menghitung semua nominal; saldo client tidak dipercaya.
- 1 koin bernilai nominal **Rp 100**; creator menerima **60%** nilai unlock (konstanta `MonetizationService`).
- Unlock episode premium **idempotent**: unlock ulang tidak dikenai biaya.
- **Gate premium**: `GET /episodes/{episode}` untuk episode premium tanpa unlock → `is_locked: true` + `pages: []` (halaman tidak dibocorkan). Pemilik komik & episode gratis selalu `is_unlocked: true`.
- Daftar episode (`GET /comics/{comic}/episodes`) menyertakan `is_unlocked`/`is_locked` per episode saat user login.
- Penarikan dibatasi saldo `available` = earning pending − withdrawal pending/approved.
- Saat admin menandai withdrawal `paid`, earning pending creator ditandai paid (FIFO hingga nominal terpenuhi) dan transaksi withdrawal menjadi `success`.
- **MVP tanpa payment gateway**: `POST /coin-packages/{package}/purchase` mencatat `payment_method: mock` (simulasi verifikasi instan) — siap di-swap ke payment provider abstraction.

## Aturan

- Business logic kompleks → **Service layer**, bukan di Controller.
- Validasi → **Form Request**.
- Otorisasi → **Policies + Middleware role**.
- Jangan percaya role dari frontend.
- Creator hanya dapat mengubah data miliknya.

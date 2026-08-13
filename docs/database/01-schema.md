# Skema Database COMIKA

Database: **MySQL** (`comika`) — charset `utf8mb4`.

## Daftar Tabel

### Inti
| Tabel | Keterangan |
|-------|-----------|
| `users` | Pengguna (reader/creator/admin), + `username`, `role`, `avatar_url`, `coin_balance`, soft delete |
| `creator_profiles` | Profil creator (1:1 dengan users) |
| `genres` | Genre komik (10 genre seeder) |
| `comics` | Komik (milik creator) |
| `comic_genres` | Pivot many-to-many comics ↔ genres |
| `episodes` | Episode per komik, `is_premium`, `price_coin` |
| `episode_pages` | Halaman episode (path file, bukan binary) |

### Komunitas
| Tabel | Keterangan |
|-------|-----------|
| `comments` | Komentar (bisa reply via `parent_id`) |
| `likes` | Polymorphic like (comic/episode/comment) |
| `bookmarks` | Simpan komik |
| `reading_histories` | Riwayat & progress baca |
| `follows` | Mengikuti komik |
| `ratings` | Rating 1–5 per komik (unique per user+comic) |
| `notifications` | Notifikasi database |
| `reports` | Laporan (polymorphic reportable) |

### Monetisasi
| Tabel | Keterangan |
|-------|-----------|
| `wallets` | Saldo koin user (1:1) |
| `coin_packages` | Paket koin yang dijual |
| `transactions` | Transaksi finansial (`reference` unique) |
| `episode_unlocks` | Pembelian unlock episode premium |
| `creator_earnings` | Penghasilan creator per episode |
| `withdrawals` | Penarikan dana creator |

### Gamifikasi (post-MVP)
| Tabel | Keterangan |
|-------|-----------|
| `user_xp` | XP & level user |
| `achievements` | Definisi achievement |
| `user_achievements` | Achievement yang didapat user |
| `reading_streaks` | Streak baca harian |

## Aturan

- Semua tabel menggunakan foreign key + timestamps.
- Soft delete pada data yang butuh recovery (`users`, `comics`, `episodes`, `comments`).
- Database **tidak menyimpan binary image** — hanya path (`cover_url`, `image_url`).
- Operasi finansial memakai **database transaction**.
- Migrasi berjalan dengan `php artisan migrate:fresh --seed`.

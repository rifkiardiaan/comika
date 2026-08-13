# COMIKA 📚

**COMIKA** adalah platform komik & webtoon digital — baca, terbitkan, kelola, dan monetisasi komik/webtoon. Dibangun berdasarkan *master blueprint* di `ai.md` dengan arsitektur **Modular Monolith REST API** (Laravel) + **React** (web) + **Flutter** (mobile) + **MySQL**.

> ✅ Status: **MVP + Post-MVP + Production Selesai** — seluruh fase 1–12 tuntas (MVP, gamification, security audit & panduan deploy).

## Arsitektur

```
├── backend/      # Laravel 10 REST API (PHP 8.1) + MySQL
├── web/          # React 19 + TypeScript + Vite + Tailwind CSS v4
├── mobile/       # Flutter (Android / iOS / Web)
├── docs/         # Dokumentasi arsitektur, database, API, produk, deployment
├── prompts/      # Prompt JSON untuk AI/vibe coding
└── scripts/      # Skrip bantu development
```

## Stack Teknologi

| Layer     | Teknologi                                          |
|-----------|-----------------------------------------------------|
| Backend   | Laravel 10, PHP 8.1, Sanctum, REST API `/api/v1`   |
| Database  | MySQL 8, Eloquent ORM, migrasi + factory + seeder  |
| Web       | React 19, TypeScript, Vite, Tailwind CSS v4        |
| Mobile    | Flutter, feature-based architecture                |

## Menjalankan Backend

```bash
cd backend
composer install
cp .env.example .env        # isi kredensial MySQL
php artisan key:generate
php artisan migrate:fresh --seed
php artisan serve            # http://127.0.0.1:8000
```

Test API: `GET http://127.0.0.1:8000/api/v1/health`

Akun demo (seeder):
- **Admin**: `admin@comika.test` / `password`
- **Creator**: salah satu dari 3 creator seeder (`password`)
- **Reader**: `budi@comika.test` / `password`

Halaman auth: `/login`, `/register`, `/forgot-password`, `/reset-password`, `/verify-email`, `/profile` (profil akun, avatar, ganti password)

## Menjalankan Web

```bash
cd web
npm install
npm run dev                  # http://localhost:5173
```

Vite mem-proxy `/api` ke `http://127.0.0.1:8000` (lihat `vite.config.ts`).

## Menjalankan Mobile

```bash
cd mobile
flutter pub get
flutter run
```

> Ganti `ApiConstants.baseUrl` sesuai target (emulator `10.0.2.2`, device fisik gunakan IP LAN).

## Roadmap Pengembangan

| Fase | Nama            | Status   |
|------|-----------------|----------|
| 01   | Foundation      | ✅ Selesai |
| 02   | Database        | ✅ Selesai |
| 03   | Authentication  | ✅ Selesai |
| 04   | Comic Core      | ✅ Selesai |
| 05   | Reader          | ✅ Selesai |
| 06   | Community       | ✅ Selesai |
| 07   | Creator         | ✅ Selesai |
| 08   | Admin           | ✅ Selesai |
| 09   | Monetization    | ✅ Selesai (backend + wallet/unlock/earnings web) |
| 10   | Mobile          | ✅ Selesai (auth, home, discover, detail, reader, library, wallet, profile, notifikasi) |
| 11   | Post MVP        | ✅ Gamification (XP, level, streak, achievement) + ✅ Notifikasi in-app — AI assistant & push notification 🔜 |
| 12   | Production      | ✅ Security audit (headers, CORS, env hardening) + panduan deploy shared hosting |

## Fitur Web yang Sudah Tersedia

- **Reader**: Beranda (data API), Jelajahi (genre + sort), Pencarian, Detail Komik + komentar real,
  Reader vertikal, Riwayat Baca, Perpustakaan (follow/bookmark/history), Dompet Koin, Prestasi & Level
  (XP, reading streak, achievement), Notifikasi (lonceng + halaman)
- **Creator**: Dashboard statistik, Kelola Komik (CRUD + cover), Kelola Episode (buat, unggah halaman,
  publish), Analitik per komik, Earning & Penarikan Dana
- **Admin**: Dashboard, Pengguna, Creator, Komik, Komentar, Laporan, Genre, Transaksi & Penarikan

## Autentikasi Production (Email Verification & Password Reset)

- **Verifikasi email**: register otomatis mengirim email ber-link signed (berlaku 60 menit);
  endpoint `POST /auth/email/verification-notification` untuk kirim ulang (throttled);
  banner peringatan tampil di web untuk user yang belum verifikasi
- **Lupa password**: `POST /auth/forgot-password` (anti user-enumeration, selalu balas sukses)
  → email ber-link reset; `POST /auth/reset-password` untuk atur ulang (mencabut semua token lama)
- **Ganti password** (halaman Profil): `PUT /auth/me/password` — verifikasi password saat ini,
  sesi di perangkat lain otomatis keluar
- **Profil akun**: `PUT /auth/me/profile` — ubah nama tampilan & upload avatar (file lama otomatis dihapus);
  avatar tampil di Navbar, kartu identitas, dan komentar
- `FRONTEND_URL` di `.env` mengarahkan link email ke halaman web; saat dev, email ditulis ke
  `storage/logs/laravel.log` (`MAIL_MAILER=log`); production isi SMTP hosting

## Keamanan & Deployment (Phase 12)

- Middleware `SecurityHeaders` (nosniff, anti-clickjacking, referrer & permissions policy, HSTS via HTTPS)
- CORS dikendalikan env (`CORS_ALLOWED_ORIGINS`) — daftar eksplisit di production
- `.env.example` production-ready (backend + web) — panduan lengkap: `docs/deployment/01-shared-hosting.md`
- Checklist keamanan hasil audit: `docs/deployment/02-security-checklist.md`

Detail lengkap: lihat `ai.md` (master blueprint) dan `docs/`.

## Gamification (Phase 11)

XP diberikan untuk aktivitas pembaca: **login harian (+20)**, **baca episode baru (+10)**, **komentar (+5)**, **like (+3)**, **follow (+5)**. Level naik mengikuti kurva `100 × level × (level−1) / 2`. Reading streak dihitung dari hari baca berturut-turut, dan **12 achievement** (baca, komentar, like, follow, streak, level) memberi reward XP sekali saja. Semua event ter-hook otomatis di backend — tanpa konfigurasi tambahan di web/mobile.

Endpoint: `GET /api/v1/me/gamification` (auth) → level, XP, progress, streak, statistik & daftar achievement.

## Notifikasi In-App (Blueprint 24)

Notifikasi berbasis database (tanpa WebSocket/push — sesuai aturan infrastruktur MVP) dikirim otomatis:

- **Episode baru** → semua follower komik saat creator publish episode
- **Status komik diubah admin** → creator pemilik komik
- **Balasan komentar** → penulis komentar induk (tidak untuk membalas diri sendiri)
- **Pembelian koin** → pembeli
- **Status penarikan dana diubah admin** → creator

Endpoint (auth): `GET /me/notifications` (paginated), `GET /me/notifications/unread-count`,
`PUT /me/notifications/{id}/read`, `POST /me/notifications/read-all`, `DELETE /me/notifications/{id}`.

Tampilan: lonceng dengan badge jumlah belum dibaca + dropdown di Navbar web, halaman `/notifications`,
dan layar Notifikasi di aplikasi mobile.

## Prinsip

- **Incremental** — jangan melompati fase.
- **MVP tanpa infrastruktur berat** — tidak butuh Redis/S3/VPS/Docker untuk MVP.
- **Kompatibel shared hosting** — deploy tanpa VPS.

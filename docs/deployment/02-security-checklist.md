# Security Audit & Checklist — COMIKA (Phase 12)

Hasil audit keamanan sebelum production. Setiap item diberi status **Aman** (sudah diterapkan
di kode) atau **Wajib saat deploy** (konfigurasi server/hosting).

---

## 1. Autentikasi & Otorisasi

| Kontrol | Status | Keterangan |
|---------|--------|------------|
| Password hashed | ✅ Aman | Laravel `'password' => 'hashed'` cast (bcrypt default) |
| Token API expirable | ✅ Aman | Sanctum `expiration = 60 * 24 * 30` (30 hari) |
| Multi-perangkat tanpa pertukaran token | ✅ Aman | Token lama tidak dihapus saat login baru |
| Rate limit login/register | ✅ Aman | `throttle:5,1` (5 percobaan/menit) |
| Rate limit komentar | ✅ Aman | `throttle:30,1` (30 komentar/menit) |
| Rate limit API global | ✅ Aman | 60 request/menit per user/IP (`RateLimiter::for('api')`) |
| Role guard admin & creator | ✅ Aman | Middleware `EnsureUserIsAdmin` / `EnsureUserIsCreator` (403 + JSON) |
| Otorisasi sumber daya | ✅ Aman | Policies: `ComicPolicy`, `EpisodePolicy`, `CommentPolicy` |
| CSRF | ✅ Aman | Token API (Bearer) tanpa cookie — tidak rentan CSRF klasik |

## 2. Input & Validasi

| Kontrol | Status | Keterangan |
|---------|--------|------------|
| Validasi Form Request | ✅ Aman | Semua endpoint pakai `FormRequest` |
| Upload hanya gambar | ✅ Aman | `image`, `mimes:jpeg,png,webp`, maks 3MB (halaman) / 2MB (cover) |
| Batch upload dibatasi | ✅ Aman | `pages` array min 1, max 60 |
| Anti-mass-assignment | ✅ Aman | Eloquent `$fillable` (tidak ada `$guarded=[]`) |
| SQL injection | ✅ Aman | Eloquent query builder / parameter binding |
| XSS di konten | ⚠️ Catatan | Komentar dirender sebagai teks di web (React escaping otomatis). **Jangan** pakai `dangerouslySetInnerHTML` pada konten user |

## 3. Header & Transport

| Kontrol | Status | Keterangan |
|---------|--------|------------|
| Security headers | ✅ Aman | Middleware `SecurityHeaders` (global): `nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy`, HSTS saat HTTPS |
| Deteksi HTTPS di belakang proxy | ✅ Aman | `TrustProxies` memercayai proxy hosting (`TRUSTED_PROXIES`, default `*`) → `isSecure()` benar → HSTS & URL HTTPS valid |
| Host-header poisoning | ✅ Aman | `TrustHosts` aktif (production): izinkan `APP_URL` + subdomain, atau `TRUSTED_HOSTS` eksplisit |
| HTTPS | 🔒 Wajib deploy | Aktifkan di hosting + redirect HTTP→HTTPS |
| HSTS | 🔒 Wajib deploy | Terkirim otomatis bila HTTPS + `APP_ENV=production` (tanpa `includeSubDomains` agar subdomain dev tidak terkunci) |
| CORS origin terbatas | 🔒 Wajib deploy | Set `CORS_ALLOWED_ORIGINS` eksplisit (dev boleh `*`); wajib `config:cache` ulang setelah ubah |

## 4. Konfigurasi & Secret

| Kontrol | Status | Keterangan |
|---------|--------|------------|
| `APP_DEBUG=false` | 🔒 Wajib deploy | Jangan pernah true di production (bocor stack trace & env) |
| `APP_KEY` unik | 🔒 Wajib deploy | `php artisan key:generate`; jangan pakai key dari repo |
| `.env` tidak publik | 🔒 Wajib deploy | Letakkan backend di luar document root, atau blokir via `.htaccess` (lihat 01-shared-hosting.md) |
| `.env` di gitignore | ✅ Aman | backend & web sudah di-ignore |
| Log tidak publik | ✅ Aman | `storage/logs` di luar document root (Pola A) |

## 5. Daftar perbaikan yang dilakukan di fase ini

1. **`SecurityHeaders` middleware** ditambahkan ke stack global — semua respons API kini
   membawa header keamanan standar (clickjacking, MIME sniffing, referrer leak, fitur browser).
2. **`TrustProxies` & `TrustHosts` diaktifkan** — deteksi HTTPS benar di belakang proxy shared
   hosting (HSTS & URL absolut valid), plus proteksi host-header poisoning di production.
3. **CORS dikendalikan env** — `config/cors.php` membaca `CORS_ALLOWED_ORIGINS` sehingga
   production bisa membatasi origin tanpa mengubah kode.
4. **`.env.example` production-ready** — nilai default aman (`MAIL_MAILER=log`,
   `CORS_ALLOWED_ORIGINS=*` untuk dev, `TRUSTED_PROXIES=*`, `TRUSTED_HOSTS` opsional),
   komentar panduan production.
5. **`web/.env.example`** dibuat (`VITE_API_URL`) agar build production tidak bergantung tebakan.
6. **Dokumen deployment lengkap** (`docs/deployment/01-shared-hosting.md`) — pola folder,
   `.htaccess` proteksi, SPA routing, skema domain, PHP upload limits, troubleshooting.

## 6. Rekomendasi lanjutan (di luar scope MVP)

- **HTTPS & HSTS**: gunakan cert gratis (Let's Encrypt via hosting/cPanel); verifikasi HSTS terkirim.
- **Host allow-list**: set `TRUSTED_HOSTS` eksplisit bila API juga dipanggil via IP atau domain ekstra.
- **Backup otomatis**: cron `mysqldump` harian + retensi 7 hari.
- **Monitoring**: cek `storage/logs/laravel.log` terjadwal; alert bila error 500 naik.
- **VPS migration path**: saat trafik naik → Redis untuk cache/queue, S3-compatible untuk storage,
  worker queue untuk earning reconciliation & notification email.
- **2FA & email verification**: saat fitur payment/payout asli (bukan simulasi) diaktifkan.
- **Rate limit login lebih ketat** bila terindikasi brute force (mis. lockout per email).

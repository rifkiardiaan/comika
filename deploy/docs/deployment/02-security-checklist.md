# Security Audit & Checklist — COMIKA (Phase 12 + Audit Ulang)

Hasil audit keamanan menyeluruh terhadap serangan luar (SQL injection, CORS, XSS, DoS/DDoS,
MITM, URL interpretation, session hijacking, brute force). Status **Aman** = sudah diterapkan
di kode, **Wajib saat deploy** = konfigurasi server/hosting.

---

## 1. Autentikasi & Otorisasi

| Kontrol | Status | Keterangan |
|---------|--------|------------|
| Password hashed | ✅ Aman | Laravel `'password' => 'hashed'` cast (bcrypt default) |
| Token API expirable | ✅ Aman | Sanctum `expiration = 60 * 24 * 30` (30 hari) |
| Multi-perangkat tanpa pertukaran token | ✅ Aman | Token lama tidak dihapus saat login baru |
| Logout & ganti password cabut token | ✅ Aman | Logout hapus token aktif; ganti password cabut semua token lain |
| Rate limit login/register | ✅ Aman | `throttle:5,1` (5 percobaan/menit) |
| Rate limit forgot/reset password | ✅ Aman | `throttle:5,1` keduanya |
| Rate limit komentar | ✅ Aman | `throttle:30,1` (30 komentar/menit) |
| Rate limit verifikasi kode | ✅ Aman | `throttle:10,1` (anti brute-force kode) |
| Rate limit kirim ulang email | ✅ Aman | `throttle:3,1` |
| Rate limit API global | ✅ Aman | 60 request/menit per user/IP (`RateLimiter::for('api')`) |
| Role guard admin & creator | ✅ Aman | Middleware `EnsureUserIsAdmin` / `EnsureUserIsCreator` (403 + JSON) |
| Otorisasi sumber daya | ✅ Aman | Policies: `ComicPolicy`, `EpisodePolicy`, `CommentPolicy` (kepemilikan/admin) |
| IDOR notifikasi | ✅ Aman | `assertOwnedBy` — user lain dapat 404 (bukan data bocor) |
| Anti user-enumeration | ✅ Aman | Forgot-password selalu balas sukses (ada/tidaknya email tidak bocor) |
| CSRF | ✅ Aman | Token API (Bearer) tanpa cookie — tidak rentan CSRF klasik |

## 2. Input & Validasi

| Kontrol | Status | Keterangan |
|---------|--------|------------|
| Validasi Form Request | ✅ Aman | Semua endpoint pakai `FormRequest` |
| Upload hanya gambar | ✅ Aman | `image`, `mimes:jpeg,png,webp`, maks 3MB (halaman) / 2MB (cover/banner/avatar) |
| Batch upload dibatasi | ✅ Aman | `pages` array min 1, max 60 |
| Anti-mass-assignment | ✅ Aman | Eloquent `$fillable` (tidak ada `$guarded=[]`) |
| **SQL injection** | ✅ Aman | Semua query via Eloquent/query builder dengan parameter binding. `selectRaw`/`orderByRaw` hanya memakai string statis atau binding `?` — tidak ada interpolasi input user |
| Sort parameter aman | ✅ Aman | `sort` hanya menerima whitelist (`popular|rating|newest`) — tidak ada interpolasi |
| **XSS di konten** | ✅ Aman | Komentar/sinopsis dirender sebagai teks (React escaping otomatis). Tidak ada `dangerouslySetInnerHTML` di web; tidak ada `{!! !!}` di Blade. **Jangan** tambahkan `dangerouslySetInnerHTML` pada konten user |

## 3. Header, Transport & MITM

| Kontrol | Status | Keterangan |
|---------|--------|------------|
| Security headers | ✅ Aman | Middleware `SecurityHeaders` (global): `nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy` |
| **CSP (Content-Security-Policy)** | ✅ Aman | Baru ditambahkan: `default-src 'none'; frame-ancestors 'none'; base-uri 'none'` — pertahanan berlapis XSS (API murni JSON) |
| **Cache-Control no-store** | ✅ Aman | Baru ditambahkan untuk semua request API — mencegah data privat dibocorkan via cache browser/proxy |
| HSTS saat HTTPS | ✅ Aman | Terkirim otomatis bila `APP_ENV=production` + `isSecure()` (max-age 31536000) |
| Deteksi HTTPS di belakang proxy | ✅ Aman | `TrustProxies` (`TRUSTED_PROXIES`, default `*`) |
| Host-header poisoning | ✅ Aman | `TrustHosts` aktif di production (`TRUSTED_HOSTS` atau `APP_URL` + subdomain) |
| **HTTPS (MITM)** | 🔒 Wajib deploy | Aktifkan di hosting + redirect HTTP→HTTPS. **Jangan** pernah akses production via HTTP |
| `SESSION_SECURE_COOKIE=true` | 🔒 Wajib deploy | Set true di production agar session cookie hanya lewat HTTPS |
| CORS origin terbatas | 🔒 Wajib deploy | `CORS_ALLOWED_ORIGINS` eksplisit (dev boleh `*`); `supports_credentials=false` (token Bearer, bukan cookie) |

## 4. DoS / DDoS

| Kontrol | Status | Keterangan |
|---------|--------|------------|
| **Pagination dibatasi** | ✅ Aman | **Baru**: middleware `ClampPagination` membatasi `per_page` ke 1–100 di semua endpoint — cegah `per_page=999999999` (query & memori meledak) |
| Rate limit API global | ✅ Aman | 60 req/menit per user/IP |
| Throttle endpoint sensitif | ✅ Aman | Login/register/reset 5/mnt, komentar 30/mnt, verify-code 10/mnt, resend 3/mnt |
| Upload size dibatasi | ✅ Aman | Per file ≤3MB, batch ≤60 file; `post_max_size` diatur saat deploy |
| Request size dibatasi | ✅ Aman | Middleware `ValidatePostSize` (default Laravel) |

> DDoS skala besar (amplifikasi) tetap perlu proteksi di level hosting/CDN (WAF, rate limit IP,
> Cloudflare). Aplikasi sudah tahan terhadap penyalahgunaan parameter/logika.

## 5. URL Interpretation & Redirect

| Kontrol | Status | Keterangan |
|---------|--------|------------|
| Open redirect | ✅ Aman | Semua redirect internal (ke `RouteServiceProvider::HOME`). Tidak ada redirect dari input user |
| Signed URL verifikasi email | ✅ Aman | `URL::temporarySignedRoute` (expires 60 menit) + validasi hash `hash_equals` |
| Path traversal upload | ✅ Aman | Laravel `store()` — nama file acak, path dari server, tidak pernah dari user |
| Route model binding | ✅ Aman | Binding by ID + Policy kepemilikan |

## 6. Session Hijacking & Data Exposure

| Kontrol | Status | Keterangan |
|---------|--------|------------|
| Session cookie httpOnly | ✅ Aman | `http_only=true`, `same_site=lax` (config default) |
| Session cookie secure | 🔒 Wajib deploy | `SESSION_SECURE_COOKIE=true` di production |
| Token tidak bocor di respons | ✅ Aman | Token hanya di respons login/register; tidak direturn ulang |
| Email & data privat tidak bocor | ✅ Aman | `UserResource` hanya di endpoint `auth/me`; resource publik (komentar, komik) hanya menampilkan id/name/username/avatar |
| Error tidak membocorkan detail | ✅ Aman | `APP_DEBUG=false` → error 500 JSON generik tanpa stack trace (`Handler`) |
| Password tidak di-flash/log | ✅ Aman | `dontFlash` = password & konfirmasi |

## 7. Konfigurasi & Secret

| Kontrol | Status | Keterangan |
|---------|--------|------------|
| `APP_DEBUG=false` | 🔒 Wajib deploy | Jangan pernah true di production |
| `APP_KEY` unik | 🔒 Wajib deploy | `php artisan key:generate` |
| `.env` tidak publik | 🔒 Wajib deploy | Di luar document root (Pola A) atau blokir `.htaccess` (Pola B) |
| `.env` di gitignore | ✅ Aman | backend & web sudah di-ignore |
| Log tidak publik | ✅ Aman | `storage/logs` di luar document root |

---

## 8. Ringkasan perbaikan dari audit ulang ini

1. **Middleware `ClampPagination`** ditambahkan ke grup `api` — `per_page` dibatasi 1–100.
   Menutup celah DoS via pagination tak terbatas di 20+ endpoint.
2. **Header `Content-Security-Policy`** ditambahkan di `SecurityHeaders` —
   `default-src 'none'; frame-ancestors 'none'; base-uri 'none'` (API murni JSON).
3. **Header `Cache-Control: no-store`** ditambahkan untuk semua request API — cegah data
   privat tercache di browser/proxy bersama.
4. **`SESSION_SECURE_COOKIE`** ditambahkan ke `.env.example` (wajib true di production).
5. **Test keamanan** (`SecurityMiddlewareTest`) — memverifikasi header keamanan & clamp pagination.

## 9. Rekomendasi lanjutan (di luar scope MVP)

- **HTTPS & HSTS**: cert gratis (Let's Encrypt via hosting/cPanel); verifikasi HSTS terkirim.
- **Lockout per email** bila terindikasi brute force lanjutan (saat ini throttle per IP cukup).
- **2FA** saat fitur payment/payout asli (bukan simulasi) diaktifkan.
- **Backup otomatis**: cron `mysqldump` harian + retensi 7 hari.
- **Monitoring**: cek `storage/logs/laravel.log` terjadwal; alert bila error 500 naik.
- **WAF/CDN** di depan domain production untuk mitigasi DDoS skala besar.
- **VPS migration path**: Redis untuk cache/queue, S3-compatible untuk storage, worker queue.

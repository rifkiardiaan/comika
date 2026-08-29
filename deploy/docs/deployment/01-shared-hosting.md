# Deployment Shared Hosting — Panduan Lengkap

Deployment COMIKA berjalan **tanpa VPS, Redis, S3, atau Docker** (lihat blueprint & arsitektur).
Semua kebutuhan infrastruktur sudah dikurangi ke minimum: file storage lokal, cache file, queue sinkron.

**Prasyarat hosting:**
- PHP ≥ 8.1 (Laravel 10) dengan ekstensi: `pdo_mysql`, `mbstring`, `xml`, `ctype`, `json`, `openssl`, `tokenizer`, `curl`, `fileinfo`, `gd` (untuk upload gambar)
- MySQL 5.7+ / MariaDB 10.3+
- Composer (minimal untuk instalasi awal; bisa via SSH atau upload `vendor/`)
- HTTPS aktif (wajib — HSTS & security headers hanya aktif lewat HTTPS)
- **PHP upload limits memadai** (halaman episode: hingga 60 file × 3MB): atur di php.ini / panel hosting:
  ```ini
  upload_max_filesize = 16M
  post_max_size = 128M
  max_execution_time = 120
  ```

---

## 1. Backend (Laravel API)

### 1.1 Siapkan package untuk di-upload

Jalankan di lokal (foldermu `backend/`):

```bash
cd backend
composer install --no-dev --optimize-autoloader --no-scripts
php artisan key:generate
```

> `--no-dev` membuang paket dev; `--no-scripts` menunda skrip pasca-instal agar bisa dijalankan di server
> (beberapa hosting memblokir eksekusi skrip saat unzip). **Wajib** jalankan `php artisan package:discover`
> di server setelah upload — tanpa itu manifest paket tidak ter-generate dan aplikasi bisa gagal boot.

### 1.2 Upload ke hosting

Ada dua pola umum — pilih salah satu:

**Pola A (direkomendasikan): backend di subfolder di luar document root**

```
~/domains/comika.app/
├── backend/        ← seluruh isi backend/ (kode + vendor/)
└── public_html/    ← document root
    ├── index.php   ← SALIN dari backend/public/index.php
    ├── .htaccess   ← SALIN dari backend/public/.htaccess
    └── storage/    ← symlink ke ../backend/storage/app/public
```

Edit `public_html/index.php` agar memuat autoload dari `../backend/`:

```php
require __DIR__.'/../backend/vendor/autoload.php';
$app = require_once __DIR__.'/../backend/bootstrap/app.php';
```

**Pola B: backend langsung di document root** (hanya jika hosting tidak punya akses luar root):

```
~/public_html/
├── index.php       ← backend/public/index.php (relative path otomatis benar)
├── .htaccess
├── app/ vendor/ routes/ ...  ← seluruh backend/
└── storage/        ← symlink ke app/public
```

> **Keamanan wajib:** `.env` dan folder sensitif (`storage/`, `vendor/`) tidak boleh diakses publik.
> Di Pola A aman otomatis. Di Pola B pastikan `.htaccess` root berikut aktif (berada di `public_html/`):

```apache
# Protect sensitive files & directories
<FilesMatch "^\.env">
    Require all denied
</FilesMatch>
RewriteRule ^(\.env|storage|vendor|database|config|routes|bootstrap|cache) - [F,L]
Options -Indexes
```

### 1.3 Konfigurasi `.env` production

```env
APP_NAME=COMIKA
APP_ENV=production
APP_KEY=<dari key:generate>
APP_DEBUG=false
APP_URL=https://comika.app
LOG_LEVEL=warning

DB_CONNECTION=mysql
DB_HOST=127.0.0.1          # sesuai kredensial hosting (bisa 127.0.0.1 atau hostname khusus)
DB_PORT=3306
DB_DATABASE=<nama_db>
DB_USERNAME=<user_db>
DB_PASSWORD=<password_db>

# Origin yang boleh memanggil API — daftar eksplisit, bukan '*'
CORS_ALLOWED_ORIGINS=https://comika.app

# Deteksi HTTPS di belakang proxy hosting + proteksi host-header
TRUSTED_PROXIES=*
# TRUSTED_HOSTS=comika.app,api.comika.app   # opsional, default = APP_URL + subdomain

BROADCAST_DRIVER=log
CACHE_DRIVER=file
FILESYSTEM_DISK=local
QUEUE_CONNECTION=sync
SESSION_DRIVER=file

MAIL_MAILER=smtp
MAIL_HOST=<smtp_hosting>
MAIL_PORT=587
MAIL_USERNAME=<email>
MAIL_PASSWORD=<password>
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="noreply@comika.app"
MAIL_FROM_NAME="COMIKA"

# URL web — dipakai untuk link verifikasi email & reset password
FRONTEND_URL=https://comika.app
```

> Jika API dipanggil dari subdomain berbeda (mis. web di `comika.app`, API di `api.comika.app`),
> tambahkan `api.comika.app` ke `CORS_ALLOWED_ORIGINS`.

### 1.4 Jalankan migrasi & optimasi

```bash
cd ~/domains/comika.app/backend

# Bangun manifest paket (wajib karena composer install tadi pakai --no-scripts)
php artisan package:discover

# Migrasi (jangan lupa buat database dulu di panel hosting)
php artisan migrate --force

# Optimasi production
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Symlink storage (agar cover & halaman komik bisa diakses via /storage)
php artisan storage:link
# Catatan: di Pola A, symlink manual di public_html/ (langkah 1.2) yang dipakai
# — php artisan storage:link hanya membuat symlink di backend/public/storage.

# Pastikan writable
chmod -R 775 storage bootstrap/cache
```

### 1.5 Test

```bash
curl -s https://comika.app/api/v1/health
# → {"success":true,"message":"COMIKA API is running",...}
```

---

## 2. Web (React + Vite)

### 2.1 Build di lokal

```bash
cd web
cp .env.example .env
# isi VITE_API_URL — lihat 2.2

npm install
npm run build        # hasil di web/dist/
```

### 2.2 `VITE_API_URL`

- **Backend di subdomain** (mis. `api.comika.app`): `VITE_API_URL=https://api.comika.app/api/v1`
- **Backend di domain sama** (mis. `/api` proxy): `VITE_API_URL=/api/v1`

> Nilai ini ter-*bake* saat build — jika berubah, wajib build ulang.

### 2.3 Upload & SPA routing

Upload isi `web/dist/` ke document root web (bisa `public_html/` jika domain web saja,
atau subfolder `web/` jika bersama backend di Pola A).

Pastikan rewrite semua request ke `index.html` (SPA). Tambahkan `.htaccess`:

```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /
    # Jangan rewrite file & folder yang benar-benar ada
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule . /index.html [L]
</IfModule>
```

### 2.4 Test

Buka `https://comika.app/` → beranda render → login → baca komik → detail → reader.

---

## 3. Mobile (Flutter)

### 3.1 Set base URL production

`mobile/lib/core/constants/api_constants.dart`:

```dart
static const String baseUrl = 'https://comika.app/api/v1'; // atau api.comika.app
```

### 3.2 Build release

```bash
cd mobile
flutter build apk --release                  # Android APK
flutter build appbundle --release            # Android App Bundle (Play Store)
flutter build web --release                  # Opsional: versi web Flutter
```

> Jika build iOS: `flutter build ipa --release` (butuh macOS + Xcode + signing).

### 3.3 Upload ke App Store / distribusi

- **Google Play**: konsol Play Console → buat aplikasi → upload App Bundle.
- **iOS**: App Store Connect → upload IPA.
- **Android langsung**: bagikan APK (aktifkan "install from unknown sources").

---

## 4. Skema domain yang disarankan

| Komponen | Domain |
|----------|--------|
| Web (React) | `https://comika.app` |
| API (Laravel) | `https://comika.app/api/v1` (Pola A) **atau** `https://api.comika.app` |
| Storage file | `https://comika.app/storage/...` |

Bila backend di subdomain, tetap satu database — tidak ada perubahan kode selain `CORS_ALLOWED_ORIGINS` & `VITE_API_URL`.

---

## 5. Checklist akhir (sebelum live)

- [ ] HTTPS aktif di seluruh domain (certificate valid, redirect HTTP→HTTPS)
- [ ] `APP_ENV=production`, `APP_DEBUG=false`
- [ ] `APP_KEY` unik (bukan dari repo)
- [ ] `.env` tidak dapat diakses publik (blokir `.htaccess` / di luar root)
- [ ] `CORS_ALLOWED_ORIGINS` berisi domain web eksplisit (bukan `*`)
- [ ] `config:cache` + `route:cache` + `view:cache` dijalankan
- [ ] `php artisan storage:link` & folder storage writable
- [ ] SPA routing web benar (refresh halaman dalam tidak 404)
- [ ] `OPTIONS` preflight CORS berjalan (buka DevTools → Network)
- [ ] Security headers terlihat di respons API (`X-Content-Type-Options: nosniff`, dst.)
- [ ] HSTS terkirim saat HTTPS (`curl -I https://... | grep -i strict`) — pastikan `TRUSTED_PROXIES` benar
- [ ] Rate limiting aktif (60 req/menit per IP, 5 percobaan login/menit)
- [ ] SMTP aktif & email verifikasi/reset terkirim (cek folder inbox/spam)
- [ ] Smoke test lengkap: register → verifikasi email → login → baca → komentar → like → follow → top-up koin → unlock episode → forgot/reset password → dashboard creator
- [ ] Backup database dijadwalkan (panel hosting atau cron `mysqldump`)

---

## 6. Troubleshooting umum

| Gejala | Penyebab umum | Solusi |
|--------|----------------|--------|
| 500 error, layar kosong | `APP_DEBUG=false` menyembunyikan detail | Cek `storage/logs/laravel.log` |
| `/storage/...` 404 | `storage:link` belum dijalankan | Jalankan `php artisan storage:link` |
| API 419 / CSRF | Request ke route web bukan API | Gunakan prefix `/api/v1` |
| CORS blocked | Origin tidak di whitelist | Perbarui `CORS_ALLOWED_ORIGINS` + `config:cache` |
| Refresh halaman 404 | SPA rewrite belum ada | Tambah `.htaccess` rewrite ke `index.html` |
| Upload gambar gagal | Ekstensi `gd`/`fileinfo` nonaktif | Aktifkan di panel PHP hosting |
| Upload gambar gagal / HTTP 413 | `post_max_size`/`upload_max_filesize` terlalu kecil | Naikkan keduanya di php.ini/panel (lihat prasyarat) |
| Semua request CORS diblokir | `CORS_ALLOWED_ORIGINS` kosong → daftar origin kosong | Isi daftar origin, lalu `php artisan config:cache` |
| Error saat boot setelah deploy | Manifest paket kosong (`--no-scripts`) | Jalankan `php artisan package:discover` lalu `php artisan optimize` |
| Login gagal berulang | Rate limit 5/menit | Tunggu 1 menit |

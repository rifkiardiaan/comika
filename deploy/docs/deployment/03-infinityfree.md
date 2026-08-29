# Deployment ke InfinityFree — comika.free.nf

Panduan lengkap deploy COMIKA ke **InfinityFree** (free PHP/MySQL shared hosting).

---

## Arsitektur Deploy

```
comika.free.nf (public_html/ 或 htdocs/)
├── .htaccess               ← Root routing (SPA + API proxy)
├── index.html              ← React SPA (from web/dist/)
├── favicon.svg             ← from web/dist/
├── sw.js                   ← Service worker (from web/dist/)
├── assets/                 ← React build assets (from web/dist/assets/)
│   ├── index-xxx.css
│   └── index-xxx.js
├── probe.html              ← from web/dist/ (opsional)
│
└── app/                    ← Laravel backend (SEMUA file backend/)
    ├── artisan
    ├── composer.json
    ├── composer.lock
    ├── vendor/             ← Hasil composer install --no-dev
    ├── bootstrap/
    ├── config/
    ├── database/
    ├── routes/
    ├── storage/
    ├── app/
    ├── .env                ← Production .env (dibuat di server)
    └── public/
        ├── index.php       ← Laravel entry point (tidak diakses langsung)
        └── .htaccess       ← Laravel .htaccess
```

**Alasan:**
- Frontend (React) served langsung dari root domain
- Backend (Laravel) di subfolder `app/` — tidak diakses publik
- API diakses via `/api/v1/*` → di-forward ke `app/public/index.php`
- Uploaded files diakses via `/storage/*` → di-forward ke `app/storage/app/public/`

---

## Prasyarat

1. **Akun InfinityFree** — daftar di https://infinityfree.com
2. **Buat domain** di InfinityFree panel → dapat `comika.free.nf`
   - Account: `if0_42760113`
   - Directory: `htdocs`
3. **Buat MySQL database** di panel InfinityFree → catat:
   - Database name: `if0_42760113_comika`
   - Database user: `if0_42760113`
   - Database password: (sesuai panel)
   - Database host: **`sql310.infinityfree.com`** (cek panel MySQL Databases)
4. **PHP ≥ 8.1** dengan ekstensi: `pdo_mysql`, `mbstring`, `xml`, `ctype`, `json`, `openssl`, `tokenizer`, `curl`, `fileinfo`, `gd`
5. **Upload limit** minimal 16MB (atur di panel PHP jika perlu)

---

## Langkah 1: Siapkan Backend di Lokal

```bash
cd backend

# Install dependencies (no dev, optimize autoloader)
composer install --no-dev --optimize-autoloader

# Generate APP_KEY
php artisan key:generate

# Clear config (agar bersih saat upload)
php artisan config:clear
php artisan route:clear
php artisan view:clear
```

---

## Langkah 2: Build Frontend

```bash
cd web

# Set API URL (sama domain, path-based)
echo "VITE_API_URL=/api/v1" > .env

# Install & build
npm install
npm run build

# Hasil ada di web/dist/
```

---

## Langkah 3: Upload ke InfinityFree

### 3a. Via File Manager (Panel InfinityFree)

1. Login ke InfinityFree Control Panel
2. Buka **File Manager** untuk domain `comika.free.nf`
3. Upload ke `public_html/` (atau `htdocs/`):

**Root files (dari web/dist/):**
```
index.html
favicon.svg
sw.js
probe.html (opsional)
assets/index-xxx.css
assets/index-xxx.js
```

**Backend (folder `app/`):**
- Upload seluruh isi folder `backend/` → rename jadi `app/` di server
- Pastikan `app/vendor/` ikut ter-upload ( hasil `composer install --no-dev`)

### 3b. Via FTP (opsional, lebih cepat untuk file besar)

```bash
# FTP client (FileZilla, WinSCP, etc.)
# Host: ftpupload.net (atau sesuai panel)
# User: if0_42760113 (dari panel)
# Password: (dari panel)
# Port: 21

# Upload:
# - web/dist/* → /htdocs/
# - backend/* → /htdocs/app/
```

---

## Langkah 4: Upload Root .htaccess

Buat file `.htaccess` di **root `public_html/` atau `htdocs/`**:

```apache
<IfModule mod_rewrite.c>
    Options -MultiViews -Indexes
    RewriteEngine On
    RewriteBase /

    # Handle Authorization Header (penting untuk Sanctum Bearer token)
    RewriteCond %{HTTP:Authorization} .
    RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]

    # ---------------------------------------------------------------
    # API routes → Laravel backend (app/public/index.php)
    # Semua request /api/* diteruskan ke Laravel
    # ---------------------------------------------------------------
    RewriteRule ^api/(.*)$ app/public/index.php [L,QSA]

    # ---------------------------------------------------------------
    # Uploaded files → Laravel storage (cover, avatar, halaman episode)
    # /storage/comics/covers/comic-1.svg → app/storage/app/public/comics/covers/comic-1.svg
    # ---------------------------------------------------------------
    RewriteCond %{DOCUMENT_ROOT}/app/storage/app/public/$1 -f
    RewriteRule ^storage/(.*)$ app/storage/app/public/$1 [L]

    # ---------------------------------------------------------------
    # SPA fallback — semua request yang bukan file/folder asli
    # diarahkan ke index.html (React Router)
    # ---------------------------------------------------------------
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule . /index.html [L]
</IfModule>

# ---------------------------------------------------------------
# Protect sensitive files dari akses publik
# ---------------------------------------------------------------
<FilesMatch "^\.env">
    Require all denied
</FilesMatch>

# Blokir akses ke folder Laravel yang sensitif
RewriteRule ^(app/(config|database|routes|bootstrap|tests)|\.env|\.env\.example|\.git) - [F,L]

# Disable directory listing
Options -Indexes
```

---

## Langkah 5: Buat .env di Server

Buka File Manager → buka `app/.env` → edit:

```env
APP_NAME=COMIKA
APP_ENV=production
APP_KEY=<isi dari php artisan key:generate, format: base64:xxxxx>
APP_DEBUG=false
APP_URL=https://comika.free.nf
FRONTEND_URL=https://comika.free.nf

LOG_CHANNEL=stack
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=error

DB_CONNECTION=mysql
DB_HOST=sql310.infinityfree.com
DB_PORT=3306
DB_DATABASE=if0_42760113_comika
DB_USERNAME=if0_42760113
DB_PASSWORD=password_kamu

CORS_ALLOWED_ORIGINS=https://comika.free.nf

TRUSTED_PROXIES=*
TRUSTED_HOSTS=comika.free.nf

BROADCAST_DRIVER=log
CACHE_DRIVER=file
FILESYSTEM_DISK=local
QUEUE_CONNECTION=sync
SESSION_DRIVER=file
SESSION_LIFETIME=120
SESSION_SECURE_COOKIE=true

MAIL_MAILER=log
MAIL_HOST=127.0.0.1
MAIL_PORT=2525
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
MAIL_FROM_ADDRESS="noreply@comika.free.nf"
MAIL_FROM_NAME="COMIKA"

VAPID_SUBJECT=mailto:noreply@comika.free.nf
VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
```

> **Penting:** `APP_KEY` harus dari `php artisan key:generate` lokal. Copy hasilnya.

---

## Langkah 6: Jalankan Migrasi

Jika InfinityFree punya **SSH access**:
```bash
cd ~/domains/comika.free.nf/public_html/app
php artisan migrate --force
```

Jika **tidak ada SSH** (hanya File Manager):
- Upload file `routes/console.php` atau gunakan script migrasi via browser
- Alternatif: jalankan migrasi lokal lalu dump SQL → import di phpMyAdmin

**Cara manual via phpMyAdmin:**
```bash
# Lokal: export database
mysqldump -u root -p comika > comika_dump.sql

# Di phpMyAdmin InfinityFree:
# 1. Buka phpMyAdmin dari panel
# 2. Select database
# 3. Import → upload comika_dump.sql
```

---

## Langkah 7: Optimasi Production

Jalankan di SSH (jika tersedia):

```bash
cd public_html/app

php artisan config:cache
php artisan route:cache

# Storage link untuk uploaded files
# Note: di InfinityFree, symlink mungkin tidak work
# Alternatif: copy storage ke public_html/storage/
```

**Jika symlink tidak work (common di shared hosting):**
```bash
# Alih-alih php artisan storage:link, copy langsung:
cp -r public_html/app/storage/app/public/* public_html/storage/
# Atau buat folder storage di root dan copy manually
```

---

## Langkah 8: Setup Storage Files

Agar uploaded files (cover, avatar, halaman) bisa diakses:

### Opsi A: Copy (recommended untuk shared hosting)
```bash
# Buat folder storage di root
mkdir -p public_html/storage

# Copy isi storage
cp -r public_html/app/storage/app/public/* public_html/storage/
```

### Opsi B: Symbolic Link (jika hosting support)
```bash
cd public_html
ln -s app/storage/app/public storage
```

### Opsi C: Edit .htaccess (sudah di-handle)
Root `.htaccess` sudah mengarahkan `/storage/*` ke `app/storage/app/public/` secara langsung.
**Ini adalah opsi default yang sudah dikonfigurasi.**

---

## Langkah 9: Test Deploy

1. **Health check:**
   ```
   https://comika.free.nf/api/v1/health
   ```
   → Harus return JSON: `{"success":true,"message":"COMIKA API is running",...}`

2. **Frontend:**
   ```
   https://comika.free.nf/
   ```
   → Halaman utama COMIKA harus render

3. **SPA routing:**
   ```
   https://comika.free.nf/login
   https://comika.free.nf/discover
   ```
   → Tidak 404, harus tetap render React app

4. **API test:**
   ```
   https://comika.free.nf/api/v1/genres
   https://comika.free.nf/api/v1/comics
   ```
   → Return JSON data

5. **Storage test:**
   ```
   https://comika.free.nf/storage/comics/covers/comic-1.svg
   ```
   → Jika ada file, harus serve gambar

---

## Troubleshooting

| Gejala | Penyebab | Solusi |
|--------|----------|--------|
| **500 Error** | `APP_DEBUG=false` sembunyikan detail | Cek `app/storage/logs/laravel.log` via File Manager |
| **/api/* 404** | `.htaccess` root tidak ada atau salah | Pastikan `.htaccess` root ada dengan rules API |
| **/storage/* 404** | Storage link/copy belum dijalankan | Copy `app/storage/app/public/*` ke `public_html/storage/` |
| **SPA refresh 404** | Rewrite ke `index.html` tidak ada | Pastikan `.htaccess` root ada dengan SPA fallback |
| **CORS blocked** | `CORS_ALLOWED_ORIGINS` salah | Set ke `https://comika.free.nf` + `config:cache` |
| **Login gagal** | `SESSION_SECURE_COOKIE` false | Set `true` di `.env` |
| **Database connection** | Host/credentials salah | Cek panel InfinityFree → MySQL Database → Hostname (contoh: `sql310.infinityfree.com`). **Bukan** `127.0.0.1` atau `sql.epizy.com` untuk akun baru. |
| **PHP version error** | PHP < 8.1 | Aktifkan PHP 8.1+ di panel PHP InfinityFree |
| **Upload gagal** | `upload_max_filesize` terlalu kecil | Naikkan di php.ini/panel ke 16M |

---

## Catatan Khusus InfinityFree

1. **Tidak ada SSH** (free tier) — semua operasi via File Manager / phpMyAdmin
2. **Symlink mungkin tidak work** — gunakan opsi copy untuk storage
3. **PHP execution time** terbatas — jalankan migrasi di lokal lalu dump SQL
4. **Storage terbatas** — hapus file yang tidak perlu
5. **Bandwidth** — InfinityFree free tier punya limit; gunakan CDN (Cloudflare) jika traffic tinggi

---

## Checklist Akhir

- [ ] `.htaccess` root ada dengan rules API + SPA
- [ ] `app/.env` configured dengan `APP_ENV=production`, `APP_DEBUG=false`
- [ ] `APP_KEY` unik (bukan default)
- [ ] Database migrated (semua table ada)
- [ ] `app/storage/app/public/` bisa diakses via `/storage/`
- [ ] `https://comika.free.nf/` → frontend render
- [ ] `https://comika.free.nf/api/v1/health` → JSON response
- [ ] Login / Register bisa
- [ ] CORS berfungsi (cek DevTools → Network → OPTIONS request)
- [ ] HTTPS aktif (redirect HTTP → HTTPS)

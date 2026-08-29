# 🚀 Deploy Backend ke InfinityFree — Checklist

## ⚠️ Masalah yang Ditemukan

File `.env` di server **tercampur** — ada 2 konfigurasi (local + production) yang di-concat. Laravel menggunakan **konfigurasi pertama** yang ditemukan, sehingga backend mencoba koneksi ke `127.0.0.1` (localhost) bukan `sql310.infinityfree.com`.

---

## 📋 Langkah-langkah Fix

### 1. Buka File Manager InfinityFree

1. Login ke InfinityFree Control Panel
2. Klik **File Manager** untuk domain `comika.free.nf`
3. Navigasi ke `public_html/app/`
4. Buka file `.env` untuk diedit

### 2. Ganti Seluruh Isi `.env`

**HAPUS SEMUA isi file `.env`**, lalu paste yang berikut:

```env
APP_NAME=COMIKA
APP_ENV=production
APP_KEY=base64:NiYJv8hOoMnHWQO4GiJwIyLaK3QdR5LVa0eUiTSyFCU=
APP_DEBUG=false
APP_URL=https://comika.free.nf
FRONTEND_URL=https://comika.free.nf

LOG_CHANNEL=stack
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=error

DB_CONNECTION=mysql
DB_HOST=sql310.infinityfree.com
DB_PORT=3306
DB_DATABASE=if0_42760113_komika
DB_USERNAME=if0_42760113
DB_PASSWORD=t9nrXR1j21oxcF
DB_STRICT=false

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
MAIL_FROM_NAME="${APP_NAME}"

VAPID_SUBJECT=mailto:noreply@comika.free.nf
VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
```

**Simpan file `.env`**

### 3. Import Database

1. Buka **phpMyAdmin** dari panel InfinityFree
2. Pilih database `if0_42760113_komika`
3. Klik tab **Import**
4. Upload file `deploy/comika_dump.sql`
5. Klik **Go** / **Import**

### 4. Setup Storage Folder

1. Di File Manager, buka `public_html/`
2. Buat folder baru bernama `storage`
3. Upload isi folder `public_html/app/storage/app/public/*` ke `public_html/storage/`
   - Atau copy file manual via File Manager

### 5. Test Backend

Buka browser, akses URL berikut:

```
https://comika.free.nf/api/v1/health
```

**Expected response:**
```json
{
  "success": true,
  "message": "COMIKA API is running",
  "data": {
    "version": "v1",
    "time": "2026-08-29T..."
  }
}
```

### 6. Test Login/Register

Buka frontend di `https://comika.free.nf/`

1. Klik **Daftar** / **Register**
2. Isi form dan submit
3. Jika berhasil, backend sudah terhubung! ✅

---

## 🔧 Troubleshooting

### Jika `/api/v1/health` return 500 Error

1. Buka File Manager → `public_html/app/storage/logs/laravel.log`
2. Cek error message di log
3. Kemungkinan besar: `.env` belum disimpan atau config belum di-cache

### Jika `/api/v1/health` return 404

1. Pastikan file `.htaccess` ada di `public_html/`
2. Pastikan isi `.htaccess` benar (lihat `deploy/infinityfree/.htaccess`)

### Jika Database Connection Error

1. Cek panel InfinityFree → **MySQL Databases**
2. Pastikan:
   - Database name: `if0_42760113_komika`
   - Database user: `if0_42760113`
   - Password: sesuai panel
   - Host: `sql310.infinityfree.com` (bukan `127.0.0.1`)

### Jika CORS Error

1. Pastikan `CORS_ALLOWED_ORIGINS=https://comika.free.nf` di `.env`
2. Jalankan di terminal (jika ada SSH):
   ```bash
   cd public_html/app
   php artisan config:clear
   php artisan config:cache
   ```

---

## ✅ Checklist Akhir

- [ ] `.env` sudah diganti dengan konfigurasi production
- [ ] Database sudah di-import via phpMyAdmin
- [ ] Folder `storage` sudah dibuat di `public_html/`
- [ ] `https://comika.free.nf/api/v1/health` return JSON
- [ ] Register/Login bisa

---

## 📝 Catatan

- **APP_KEY sudah ada** (`base64:NiYJv8hOoMnHWQO4GiJwIyLaK3QdR5LVa0eUiTSyFCU=`) — tidak perlu generate lagi
- **Database sudah ada** di `if0_42760113_komika` — tinggal import
- **Password database**: `t9nrXR1j21oxcF` (dari `env-for-server.txt`)

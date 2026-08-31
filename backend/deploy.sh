#!/bin/bash
# ============================================================
# COMIKA Backend — Deploy Script untuk InfinityFree
# ============================================================
# Jalankan dari root backend/:
#   cd backend && bash deploy.sh
#
# Hasil: backend/deploy.zip siap di-upload ke InfinityFree
# ============================================================

set -e

echo "🚀 COMIKA Backend — Deployment Builder"
echo "======================================="

# 1. Bersihkan build sebelumnya
echo "🗑️  Membersihkan build sebelumnya..."
rm -rf deploy deploy.zip

# 2. Buat folder deploy
echo "📁 Membuat folder deploy..."
mkdir -p deploy

# 3. Copy file-file yang diperlukan
echo "📋 Menyalin file..."
cp -r app deploy/
cp -r bootstrap deploy/
cp -r config deploy/
cp -r database deploy/
cp -r resources deploy/
cp -r routes deploy/
cp -r vendor deploy/
cp artisan deploy/
cp composer.json deploy/
cp composer.lock deploy/

# 4. Copy public files ke root deploy (karena htdocs = document root)
echo "🌐 Menyiapkan public entry point..."
cp public/index.php deploy/
cp public/.htaccess deploy/
cp public/favicon.svg deploy/ 2>/dev/null || true

# 5. Copy storage yang sudah ada
echo "📦 Menyalin storage..."
cp -r storage deploy/

# 6. Buat .env production dari template
echo "⚙️  Membuat .env production..."
cat > deploy/.env << 'ENVEOF'
APP_NAME=COMIKA
APP_ENV=production
APP_KEY=
APP_DEBUG=false
APP_URL=https://comika.free.nf

FRONTEND_URL=https://comika.free.nf

LOG_CHANNEL=stack
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=warning

DB_CONNECTION=mysql
DB_HOST=sql313.infinityfree.com
DB_PORT=3306
DB_DATABASE=if0_XXXXXX_comika
DB_USERNAME=if0_XXXXXX
DB_PASSWORD=

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

SANCTUM_TOKEN_PREFIX=

MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=
MAIL_PASSWORD=
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="noreply@comika.free.nf"
MAIL_FROM_NAME="${APP_NAME}"

VAPID_SUBJECT=mailto:noreply@comika.free.nf
VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=

AI_BASE_URL=https://api.openai.com/v1
AI_API_KEY=
AI_MODEL=gpt-4o-mini
AI_TIMEOUT=60

MIDTRANS_SERVER_KEY=Mid-server-BPLWk066E1QzSFrUywvrb43E
MIDTRANS_CLIENT_KEY=Mid-client-P79YN_HT2uj-WZnx
MIDTRANS_IS_PRODUCTION=false
MIDTRANS_CALLBACK_FINISH=/wallet?payment=success
ENVEOF

# 7. Set permissions
echo "🔐 Setting permissions..."
chmod -R 775 deploy/storage 2>/dev/null || true
chmod -R 775 deploy/bootstrap/cache 2>/dev/null || true

# 8. Buat .htaccess yang kompatibel dengan shared hosting
cat > deploy/.htaccess << 'HTACCESS'
<IfModule mod_rewrite.c>
    <IfModule mod_negotiation.c>
        Options -MultiViews -Indexes
    </IfModule>

    RewriteEngine On

    # Handle Authorization Header
    RewriteCond %{HTTP:Authorization} .
    RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]

    # Redirect Trailing Slashes If Not A Folder...
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_URI} (.+)/$
    RewriteRule ^ %1 [L,R=301]

    # Send Requests To Front Controller...
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteRule ^ index.php [L]
</IfModule>

# Deny access to sensitive files
<FilesMatch "\.(env|git|htaccess)$">
    Require all denied
</FilesMatch>

# Protect storage directory
<IfModule mod_rewrite.c>
    RewriteRule ^storage/ - [F,L]
</IfModule>
HTACCESS

# 9. Buat folder yang dibutuhkan
mkdir -p deploy/storage/framework/{cache,sessions,views}
mkdir -p deploy/storage/logs
mkdir -p deploy/storage/app/public
mkdir -p deploy/bootstrap/cache

# 10. Copy SQL untuk import manual
if [ -f database/schema.sql ]; then
    echo "🗄️  Menyalin schema SQL..."
    cp database/schema.sql deploy/
fi
if [ -f database/seed_data.sql ]; then
    echo "🗄️  Menyalin seed data SQL..."
    cp database/seed_data.sql deploy/
fi
if [ -f database/deploy_migration.sql ]; then
    echo "🗄️  Menyalin deploy migration SQL..."
    cp database/deploy_migration.sql deploy/
fi

# 11. Copy APK ke public (opsional)
if [ -f "../web/dist/downloads/comika.apk" ]; then
    echo "📱 Menyalin APK..."
    cp ../web/dist/downloads/comika.apk deploy/
fi

# 11. Kompres
echo "📦 Mengkompres deploy.tar.gz..."
cd deploy && tar -czf ../deploy.tar.gz . 2>/dev/null
cd ..

# 12. Info ukuran
echo ""
echo "✅ Deploy siap!"
echo "======================================="
echo "📄 File: $(pwd)/deploy.tar.gz"
echo "📏 Ukuran: $(du -sh deploy.tar.gz | cut -f1)"
echo ""
echo "📋 Langkah selanjutnya:"
echo "   1. Buka InfinityFree → File Manager → htdocs/"
echo "   2. Hapus semua file default di htdocs/"
echo "   3. Upload deploy.tar.gz ke htdocs/"
echo "   4. Extract deploy.tar.gz di htdocs/"
echo "   5. Buka phpMyAdmin → buka database"
echo "   6. Import schema.sql (Structure)"
echo "   7. Import seed_data.sql (Data genres, achievements, coin_packages)"
echo "   8. Import deploy_migration.sql ( tambah kolom verification_status & ban )"
echo "   9. Edit .env → isi DB_*, APP_KEY, dll"
echo "  10. Test: https://comika.free.nf/api/v1/health"
echo "======================================="

#!/bin/bash
# ======================================================================
# COMIKA — Deployment Prep Script untuk InfinityFree
# Jalankan ini di lokal SEBELUM upload ke InfinityFree
# ======================================================================

set -e

echo "🚀 COMIKA — Persiapan Deploy ke InfinityFree"
echo "=============================================="
echo ""

# --- Backend Preparation ---
echo "📦 1/5 — Backend: composer install (no-dev)..."
cd backend
composer install --no-dev --optimize-autoloader --no-scripts 2>/dev/null || {
    echo "⚠️  composer install gagal. Pastikan PHP & Composer terinstall."
    echo "   Alternatif: upload vendor/ dari lokal ke server."
}

echo "🔑 2/5 — Backend: generate APP_KEY..."
php artisan key:generate 2>/dev/null || echo "⚠️  key:generate gagal — generate manual di server."

echo "🧹 3/5 — Backend: clear cache..."
php artisan config:clear 2>/dev/null || true
php artisan route:clear 2>/dev/null || true
php artisan view:clear 2>/dev/null || true

# --- Frontend Preparation ---
echo ""
echo "🌐 4/5 — Frontend: build production..."
cd ../web
echo "VITE_API_URL=/api/v1" > .env
npm install --silent 2>/dev/null
npm run build 2>/dev/null || {
    echo "⚠️  Build gagal. Pastikan Node.js terinstall."
    exit 1
}

# --- Summary ---
echo ""
echo "📋 5/5 — Ringkasan:"
echo ""
echo "  Frontend (web/dist/):"
echo "    ✅ index.html"
ls -la dist/*.html dist/*.svg dist/*.js dist/assets/ 2>/dev/null || true
echo ""
echo "  Backend (backend/):"
echo "    ✅ vendor/ ($(du -sh vendor 2>/dev/null | cut -f1))"
echo "    ✅ APP_KEY generated"
echo ""
echo "=============================================="
echo "📂 STRUKTUR UPLOAD ke public_html/:"
echo ""
echo "  public_html/"
echo "  ├── .htaccess              ← dari deploy/infinityfree/.htaccess"
echo "  ├── index.html             ← dari web/dist/"
echo "  ├── favicon.svg            ← dari web/dist/"
echo "  ├── sw.js                  ← dari web/dist/"
echo "  ├── assets/                ← dari web/dist/assets/"
echo "  │   ├── index-xxx.css"
echo "  │   └── index-xxx.js"
echo "  └── app/                   ← dari backend/ (rename)"
echo "      ├── artisan"
echo "      ├── composer.json"
echo "      ├── vendor/"
echo "      ├── bootstrap/"
echo "      ├── config/"
echo "      ├── database/"
echo "      ├── routes/"
echo "      ├── storage/"
echo "      ├── app/"
echo "      └── public/"
echo "          ├── index.php"
echo "          └── .htaccess"
echo ""
echo "✅ Persiapan selesai!"
echo "📖 Baca panduan lengkap: docs/deployment/03-infinityfree.md"
echo ""

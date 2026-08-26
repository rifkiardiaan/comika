#!/bin/bash
# ======================================================================
# COMIKA — Buat Deployment Package untuk InfinityFree
# Menghasilkan file ZIP yang siap di-upload ke public_html/
# ======================================================================

set -e

DEPLOY_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$DEPLOY_DIR/../.." && pwd)"
OUTPUT="$ROOT_DIR/deploy/comika-infinityfree.zip"

echo "📦 Membuat deployment package..."
echo "   Source: $ROOT_DIR"
echo "   Output: $OUTPUT"
echo ""

# Bersihkan ZIP lama
rm -f "$OUTPUT"

# Buat direktori sementara
TEMP_DIR=$(mktemp -d)
trap "rm -rf $TEMP_DIR" EXIT

# 1. Copy root .htaccess
cp "$DEPLOY_DIR/.htaccess" "$TEMP_DIR/.htaccess"

# 2. Copy frontend build (web/dist/*)
cp -r "$ROOT_DIR/web/dist/"* "$TEMP_DIR/"

# 3. Copy backend ke folder app/
mkdir -p "$TEMP_DIR/app"
cp -r "$ROOT_DIR/backend/"* "$TEMP_DIR/app/"

# Copy app-public-htaccess ke app/public/.htaccess
cp "$DEPLOY_DIR/app-public-htaccess" "$TEMP_DIR/app/public/.htaccess"

# 4. Hapus file yang tidak perlu di-upload
echo "🧹 Membersihkan file yang tidak perlu..."
rm -rf "$TEMP_DIR/app/node_modules"
rm -rf "$TEMP_DIR/app/storage/logs/*.log"
rm -rf "$TEMP_DIR/app/storage/framework/cache/data/*"
rm -rf "$TEMP_DIR/app/storage/framework/sessions/*"
rm -rf "$TEMP_DIR/app/storage/framework/views/*"
rm -rf "$TEMP_DIR/app/.phpunit.result.cache"
rm -rf "$TEMP_DIR/app/tests"

# 5. Buat ZIP
echo "📦 Membuat ZIP..."
cd "$TEMP_DIR"
zip -r "$OUTPUT" . -x "*.git*" "*.DS_Store" "Thumbs.db" 2>/dev/null

echo ""
echo "✅ Deployment package siap!"
echo "   📄 $OUTPUT"
echo "   📦 Size: $(du -sh "$OUTPUT" | cut -f1)"
echo ""
echo "📋 Upload ke InfinityFree:"
echo "   1. Login panel → File Manager"
echo "   2. Upload $OUTPUT ke public_html/"
echo "   3. Extract ZIP di public_html/"
echo "   4. Ikuti panduan: docs/deployment/03-infinityfree.md"
echo ""

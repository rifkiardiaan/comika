#!/bin/bash
# ============================================================
# COMIKA — Build APK Script
# Build APK dari Flutter project dan copy ke backend storage
# ============================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
MOBILE_DIR="$(dirname "$SCRIPT_DIR")"
ROOT_DIR="$(dirname "$MOBILE_DIR")"
BACKEND_DIR="$ROOT_DIR/backend"
APK_OUTPUT="$MOBILE_DIR/build/app/outputs/flutter-apk/app-release.apk"
APK_DEST="$BACKEND_DIR/storage/app/downloads/comika.apk"

echo "🔨 Building COMIKA APK..."
echo "   Project: $MOBILE_DIR"

# Build APK release
cd "$MOBILE_DIR"
flutter build apk --release

# Check if build succeeded
if [ ! -f "$APK_OUTPUT" ]; then
    echo "❌ Build failed — APK not found at $APK_OUTPUT"
    exit 1
fi

# Get APK size
APK_SIZE=$(du -h "$APK_OUTPUT" | cut -f1)
echo "✅ Build successful! APK size: $APK_SIZE"

# Create destination directory
mkdir -p "$BACKEND_DIR/storage/app/downloads"

# Copy APK to backend storage
cp "$APK_OUTPUT" "$APK_DEST"
echo "📦 APK copied to: $APK_DEST"

# Get file info
FILESIZE=$(stat -f%z "$APK_DEST" 2>/dev/null || stat --printf="%s" "$APK_DEST" 2>/dev/null || echo "unknown")
echo ""
echo "=== Build Complete ==="
echo "   APK: $APK_DEST"
echo "   Size: $APK_SIZE ($FILESIZE bytes)"
echo ""
echo "   Upload to server:"
echo "   1. Copy storage/app/downloads/comika.apk to production server"
echo "   2. OR use POST /api/v1/admin/download/upload endpoint"
echo ""
echo "   Download URL: https://comika.free.nf/api/v1/download/apk"

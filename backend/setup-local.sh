#!/bin/bash
# =====================================================================
# COMIKA — Local Development Setup Script
# This script ensures the local database has all demo data including
# comics, episodes, and pages.
# =====================================================================

set -e

cd "$(dirname "$0")"

echo "🔧 COMIKA Local Setup"
echo "====================="
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Copy .env.example to .env and configure it."
    exit 1
fi

# Check if composer is available
if ! command -v composer &> /dev/null; then
    echo "❌ composer not found. Install PHP Composer first."
    exit 1
fi

# Check if php artisan exists
if [ ! -f artisan ]; then
    echo "❌ artisan not found. Make sure you're in the backend directory."
    exit 1
fi

echo "Step 1: Installing PHP dependencies..."
composer install --no-interaction --prefer-dist

echo ""
echo "Step 2: Running migrations..."
php artisan migrate --force

echo ""
echo "Step 3: Checking if comics exist in database..."
COMIC_COUNT=$(php artisan tinker --execute="echo \App\Models\Comic::count();" 2>/dev/null || echo "0")
echo "   Current comic count: $COMIC_COUNT"

if [ "$COMIC_COUNT" = "0" ]; then
    echo ""
    echo "Step 4: No comics found. Running seeders..."
    php artisan db:seed --force
    echo ""
    echo "Step 5: Verifying seed data..."
    NEW_COUNT=$(php artisan tinker --execute="echo \App\Models\Comic::count();" 2>/dev/null || echo "0")
    echo "   Comic count after seeding: $NEW_COUNT"
    
    if [ "$NEW_COUNT" = "0" ]; then
        echo ""
        echo "⚠️  Seeding via php artisan failed. Trying SQL import..."
        if [ -f deploy/seed_data.sql ]; then
            # Get database credentials from .env
            DB_HOST=$(grep DB_HOST .env | cut -d '=' -f2 | tr -d '"' | tr -d "'" || echo "127.0.0.1")
            DB_PORT=$(grep DB_PORT .env | cut -d '=' -f2 | tr -d '"' | tr -d "'" || echo "3306")
            DB_DATABASE=$(grep DB_DATABASE .env | cut -d '=' -f2 | tr -d '"' | tr -d "'" || echo "comika")
            DB_USERNAME=$(grep DB_USERNAME .env | cut -d '=' -f2 | tr -d '"' | tr -d "'" || echo "root")
            DB_PASSWORD=$(grep DB_PASSWORD .env | cut -d '=' -f2 | tr -d '"' | tr -d "'" || echo "")
            
            echo "   Importing seed_data.sql into $DB_DATABASE..."
            if [ -z "$DB_PASSWORD" ]; then
                mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USERNAME" "$DB_DATABASE" < deploy/seed_data.sql
            else
                mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USERNAME" -p"$DB_PASSWORD" "$DB_DATABASE" < deploy/seed_data.sql
            fi
            
            FINAL_COUNT=$(php artisan tinker --execute="echo \App\Models\Comic::count();" 2>/dev/null || echo "0")
            echo "   Comic count after SQL import: $FINAL_COUNT"
        else
            echo "   deploy/seed_data.sql not found!"
        fi
    fi
else
    echo "   ✅ Comics already exist. Skipping seed."
fi

echo ""
echo "Step 6: Generating storage link..."
php artisan storage:link --force 2>/dev/null || true

echo ""
echo "Step 7: Clearing cache..."
php artisan cache:clear
php artisan config:clear
php artisan route:clear

echo ""
echo "========================================="
echo "✅ Setup complete!"
echo ""
echo "Start the backend server:"
echo "   php artisan serve"
echo ""
echo "Start the web frontend (in ../web):"
echo "   npm run dev"
echo ""
echo "Default accounts:"
echo "   Admin: admin@comika.test / password"
echo "   Creator: sari@comika.test / password"
echo "   Reader: budi@comika.test / password (500 coins)"
echo "========================================="

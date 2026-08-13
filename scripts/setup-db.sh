#!/usr/bin/env bash
# Setup database COMIKA: create DB + migrate + seed
set -e

DB_NAME="${DB_NAME:-comika}"
DB_USER="${DB_USER:-root}"
DB_PASS="${DB_PASS:-}"

echo "==> Membuat database '$DB_NAME' (jika belum ada)"
mysql -u "$DB_USER" ${DB_PASS:+-p"$DB_PASS"} -e "CREATE DATABASE IF NOT EXISTS $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

echo "==> Migrasi + seeder"
cd "$(dirname "$0")/../backend"
php artisan migrate:fresh --seed --force

echo "==> Selesai. Test: curl http://127.0.0.1:8000/api/v1/health"

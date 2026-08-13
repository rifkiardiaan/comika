#!/usr/bin/env bash
# Jalankan backend COMIKA (Laravel) di port 8000
set -e
cd "$(dirname "$0")/../backend"
php artisan serve --host=127.0.0.1 --port=8000

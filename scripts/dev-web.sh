#!/usr/bin/env bash
# Jalankan web COMIKA (Vite dev server) di port 5173
set -e
cd "$(dirname "$0")/../web"
npm run dev

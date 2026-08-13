# Arsitektur Sistem COMIKA

## Gambaran Umum

COMIKA menggunakan arsitektur **Modular Monolith REST API** untuk MVP:

```
┌──────────┐     ┌──────────┐     ┌──────────────────┐     ┌─────────┐
│  Flutter │     │   React  │     │  Laravel REST API │     │  MySQL  │
│  Mobile  │────▶│    Web   │────▶│   /api/v1         │────▶│         │
└──────────┘     └──────────┘     └──────────────────┘     └─────────┘
```

- **Satu aplikasi backend** melayani web dan mobile (REST API).
- Autentikasi: **Laravel Sanctum** (token Bearer).
- Respons API konsisten: `{ success, message, data, errors }`.

## Aturan Infrastruktur (MVP)

| Infrastruktur | Status MVP        | Masa Depan      |
|---------------|-------------------|-----------------|
| Hosting       | Shared hosting    | VPS / Cloud     |
| Storage file  | Local storage     | S3 / R2         |
| Cache         | DB / app cache    | Redis           |
| Proses        | Sinkron           | Queue workers   |
| Realtime      | Tidak dibutuhkan  | WebSocket / push|

**Aturan utama:** Jangan membuat dependency MVP terhadap infrastruktur yang belum tersedia.

## Struktur Folder

Lihat `structures.md` untuk struktur lengkap `backend/`, `web/`, `mobile/`, `docs/`, `prompts/`, `scripts/`.

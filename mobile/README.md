# COMIKA Mobile 📱

Aplikasi mobile **COMIKA** — platform komik & webtoon digital — dibangun dengan **Flutter** dan terhubung ke REST API Laravel (`/api/v1`).

## Fitur

- **Autentikasi** — register & login dengan token Bearer (Laravel Sanctum)
- **Beranda** — komik trending minggu ini
- **Jelajahi** — filter genre + urutan (terpopuler / rating / terbaru)
- **Detail Komik** — sinopsis, rating, like / bookmark / follow
- **Reader Webtoon** — scroll vertikal, progress baca otomatis, unlock episode premium dengan koin
- **Perpustakaan** — komik diikuti, bookmark, dan riwayat baca (Lanjutkan Baca)
- **Dompet Koin** — saldo, top-up (disimulasikan pada MVP), & unlock premium

## Struktur

```
lib/
├── core/          # Tema, konstanta API, formatter
├── models/        # Comic, Episode, User, ReadingHistory
├── services/      # ApiService (HTTP), AuthService (sesi)
└── features/      # auth, home, discover, comic, reader, library, wallet, profile
```

## Menjalankan

```bash
flutter pub get
flutter run
```

> **Base URL**: ubah `ApiConstants.baseUrl` di `lib/core/constants/api_constants.dart`.
> - Emulator Android: `http://10.0.2.2:8000/api/v1`
> - Device fisik: gunakan IP LAN komputer (misal `http://192.168.1.5:8000/api/v1`)

Backend harus berjalan di `http://127.0.0.1:8000` (lihat `backend/README.md`).

## Catatan MVP

- Token autentikasi disimpan di memori (belum persisten lintas sesi).
- HTTP cleartext diizinkan untuk development (`usesCleartextTraffic` / `NSAllowsArbitraryLoads`).
  Untuk production, gunakan **HTTPS** dan hapus pengecualian tersebut.
- Gambar halaman komik dimuat dari URL absolut backend (`asset('storage/...')`).

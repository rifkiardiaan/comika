# COMIKA Backend API 🚀

REST API untuk platform komik & webtoon **COMIKA** — Laravel 10 + PHP 8.1 + MySQL + Sanctum.

Semua endpoint berada di bawah prefix `/api/v1`. Respons mengikuti format:

```json
{ "success": true, "message": "Success", "data": {} }
```

## Modul

| Modul        | Endpoint utama                                                      |
|--------------|---------------------------------------------------------------------|
| Auth         | `POST /auth/register`, `POST /auth/login`, `GET /auth/me`           |
| Comic Core   | `GET /comics`, `GET /comics/{comic}`, CRUD komik & episode          |
| Reader       | `GET /reader/history`, `POST /reader/progress`                      |
| Community    | bookmark, follow, like, rating, komentar                            |
| Creator      | dashboard, komik, analitik, earning, withdrawal                     |
| Monetization | coin-packages, wallet, transaksi, unlock episode premium            |
| Admin        | user, creator, komik, komentar, laporan, genre, transaksi           |

## Setup

```bash
composer install
cp .env.example .env      # isi kredensial MySQL (DB_DATABASE=comika)
php artisan key:generate
php artisan migrate:fresh --seed
php artisan serve         # http://127.0.0.1:8000
```

## Akun demo (seeder)

| Role    | Email              | Password |
|---------|--------------------|----------|
| Admin   | admin@comika.test  | password |
| Creator | 3 akun creator     | password |
| Reader  | budi@comika.test   | password |

## Testing

```bash
php artisan test         # 116+ test (Auth, Comic, Reader, Community, Creator, Admin, Monetization)
```

## Dokumentasi API

Lihat `../docs/api/` untuk konvensi dan detail endpoint.

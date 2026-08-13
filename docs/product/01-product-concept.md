# Konsep Produk COMIKA

## Visi

> Menjadi platform komik digital yang memberikan pengalaman membaca modern sekaligus memberikan creator tools untuk menerbitkan dan mengembangkan komik mereka.

## Pengguna Utama

| Role | Tujuan |
|------|--------|
| **Reader** | Menemukan, membaca, menyimpan, mengikuti, like, rating, komentar, melanjutkan bacaan, rekomendasi |
| **Creator** | Membuat profil, komik, episode, upload halaman, draft, publish, analytics, penghasilan |
| **Admin** | Mengelola user, creator, komik, komentar, genre, laporan, transaksi, platform |

## Scope MVP (Must Have)

Authentication, role system, comic CRUD, genre, episode CRUD, page upload, comic reader, search,
bookmark, reading history, follow, like, comment, creator dashboard, admin dashboard.

**Tidak memblokir MVP:** AI, payment gateway, advanced analytics, gamification, subscription,
realtime chat/notification.

## Sistem Utama

1. **Reader system** — vertical webtoon reader (bukan PDF viewer), lazy image, progress, prev/next.
2. **Creator system** — dashboard, comic & episode management, draft, scheduling, analytics.
3. **Admin system** — moderasi konten, laporan, transaksi.
4. **Monetization** — internal coin system + payment provider abstraction.
5. **Gamification** (post-MVP) — XP, level, achievement, streak.
6. **AI** (post-MVP) — title/synopsis generator, rekomendasi (optional service, tidak wajib).

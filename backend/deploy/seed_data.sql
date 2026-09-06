-- =====================================================================
-- COMIKA — Complete Seed Data for Production/Shared Hosting
-- Includes: users, wallets, genres, achievements, coin_packages,
--           comics, episodes, episode_pages, comic_genres
-- 
-- Usage: Import via phpMyAdmin or:
--   mysql -u user -p database < seed_data.sql
--
-- Note: SVG demo images must be generated separately via
--   php artisan db:seed --class=DemoPageSeeder
-- =====================================================================

-- -------------------------------------------------------------------
-- 1. Users (password: 'password' for all)
-- Hash: $2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi
-- -------------------------------------------------------------------
INSERT INTO users (id, name, username, email, email_verified_at, password, role, coin_balance, is_premium, is_vvip, created_at, updated_at) VALUES
(1, 'Admin COMIKA', 'admin', 'admin@comika.test', NOW(), '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 0, 0, 0, NOW(), NOW()),
(2, 'Sari Dewi', 'sari_creator', 'sari@comika.test', NOW(), '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'creator', 0, 0, 0, NOW(), NOW()),
(3, 'Bima Pratama', 'bima_creator', 'bima@comika.test', NOW(), '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'creator', 0, 0, 0, NOW(), NOW()),
(4, 'Luna Putri', 'luna_creator', 'luna@comika.test', NOW(), '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'creator', 0, 0, 0, NOW(), NOW()),
(5, 'Rina Sari', 'rina', 'rina@comika.test', NOW(), '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'reader', 0, 0, 0, NOW(), NOW()),
(6, 'Deni Kurniawan', 'deni', 'deni@comika.test', NOW(), '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'reader', 0, 0, 0, NOW(), NOW()),
(7, 'Maya Putri', 'maya', 'maya@comika.test', NOW(), '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'reader', 0, 0, 0, NOW(), NOW()),
(8, 'Andi Wijaya', 'andi', 'andi@comika.test', NOW(), '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'reader', 0, 0, 0, NOW(), NOW()),
(9, 'Budi Pembaca', 'budi', 'budi@comika.test', NOW(), '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'reader', 500, 0, 0, NOW(), NOW());

-- -------------------------------------------------------------------
-- 2. Wallets
-- -------------------------------------------------------------------
INSERT INTO wallets (user_id, coin_balance, created_at, updated_at) VALUES
(1, 0, NOW(), NOW()), (2, 0, NOW(), NOW()), (3, 0, NOW(), NOW()), (4, 0, NOW(), NOW()),
(5, 0, NOW(), NOW()), (6, 0, NOW(), NOW()), (7, 0, NOW(), NOW()), (8, 0, NOW(), NOW()),
(9, 500, NOW(), NOW());

-- -------------------------------------------------------------------
-- 3. Genres (skip if already exists)
-- -------------------------------------------------------------------
INSERT IGNORE INTO genres (id, slug, name, created_at, updated_at) VALUES
(1, 'action', 'Action', NOW(), NOW()),
(2, 'romance', 'Romance', NOW(), NOW()),
(3, 'fantasy', 'Fantasy', NOW(), NOW()),
(4, 'drama', 'Drama', NOW(), NOW()),
(5, 'comedy', 'Komedi', NOW(), NOW()),
(6, 'horror', 'Horor', NOW(), NOW()),
(7, 'sci-fi', 'Sci-Fi', NOW(), NOW()),
(8, 'slice-of-life', 'Slice of Life', NOW(), NOW()),
(9, 'thriller', 'Thriller', NOW(), NOW()),
(10, 'adventure', 'Petualangan', NOW(), NOW());

-- -------------------------------------------------------------------
-- 4. Achievements
-- -------------------------------------------------------------------
INSERT IGNORE INTO achievements (id, code, name, description, xp_reward, created_at, updated_at) VALUES
(1, 'first_read', 'Pembaca Baru', 'Baca episode pertamamu.', 20, NOW(), NOW()),
(2, 'read_10', 'Pembaca Aktif', 'Baca 10 episode berbeda.', 50, NOW(), NOW()),
(3, 'read_50', 'Kutu Buku', 'Baca 50 episode berbeda.', 150, NOW(), NOW()),
(4, 'finish_comic', 'Tamat', 'Selesaikan semua episode terbit dari sebuah komik.', 100, NOW(), NOW()),
(5, 'first_comment', 'Ikut Bicara', 'Kirim komentarmu yang pertama.', 15, NOW(), NOW()),
(6, 'comment_10', 'Pendapat Berharga', 'Kirim 10 komentar.', 40, NOW(), NOW()),
(7, 'first_follow', 'Follower Sejati', 'Ikuti komik pertamamu.', 15, NOW(), NOW()),
(8, 'first_like', 'Memberi Dukungan', 'Sukai komik pertamamu.', 10, NOW(), NOW()),
(9, 'streak_3', 'Rutin 3 Hari', 'Baca 3 hari berturut-turut.', 30, NOW(), NOW()),
(10, 'streak_7', 'Rutin Seminggu', 'Baca 7 hari berturut-turut.', 100, NOW(), NOW()),
(11, 'level_5', 'Level 5', 'Capai level 5.', 50, NOW(), NOW()),
(12, 'level_10', 'Level 10', 'Capai level 10.', 150, NOW(), NOW());

-- -------------------------------------------------------------------
-- 5. Coin Packages
-- -------------------------------------------------------------------
INSERT IGNORE INTO coin_packages (id, name, coins, price, is_active, created_at, updated_at) VALUES
(1, 'Paket 100 Koin', 100, 15000, 1, NOW(), NOW()),
(2, 'Paket 300 Koin', 300, 42000, 1, NOW(), NOW()),
(3, 'Paket 700 Koin', 700, 90000, 1, NOW(), NOW()),
(4, 'Paket 1500 Koin', 1500, 175000, 1, NOW(), NOW());

-- -------------------------------------------------------------------
-- 6. Comics (12 demo comics)
-- -------------------------------------------------------------------
INSERT IGNORE INTO comics (id, creator_id, title, slug, synopsis, cover_url, status, age_rating, rating_avg, rating_count, like_count, view_count, published_at, created_at, updated_at) VALUES
(1, 2, 'Bulan di Ujung Jari', 'bulan-di-ujung-jari', 'Seorang pelukis jalanan menemukan kuas ajaib yang bisa menggambar pintu menuju dunia lain. Setiap malam purnama, dunia yang ia lukis menjadi nyata — dan mulai menginginkannya kembali.', 'comics/covers/comic-1.svg', 'ongoing', 'semua_umur', 4.80, 15067, 45200, 1284000, DATE_SUB(NOW(), INTERVAL 11 DAY), DATE_SUB(NOW(), INTERVAL 11 DAY), NOW()),
(2, 3, 'Naga Terakhir', 'naga-terakhir', 'Setelah 500 tahun bersembunyi, naga terakhir bangkit di era modern. Remaja bernama Bima terpilih menjadi penjaganya — padahal ia hanya ingin lulus SMA dengan tenang.', 'comics/covers/comic-2.svg', 'ongoing', 'semua_umur', 4.60, 11033, 33100, 982000, DATE_SUB(NOW(), INTERVAL 10 DAY), DATE_SUB(NOW(), INTERVAL 10 DAY), NOW()),
(3, 4, 'Cinta Tak Berbalas', 'cinta-tak-berbalas', 'Setiap hari Laras menulis surat cinta yang tak pernah ia kirim. Suatu hari, semua surat itu menemukan jalannya sendiri — dan sampai ke orang yang salah.', 'comics/covers/comic-3.svg', 'ongoing', 'semua_umur', 4.50, 9633, 28900, 756000, DATE_SUB(NOW(), INTERVAL 9 DAY), DATE_SUB(NOW(), INTERVAL 9 DAY), NOW()),
(4, 2, 'Kost Paranormal', 'kost-paranormal', 'Kost murah di pinggir kota ternyata dihuni penghuni lain: hantu-hantu baik hati yang butuh bantuan menyelesaikan urusan duniawi mereka. Komedi horor yang menghangatkan hati.', 'comics/covers/comic-4.svg', 'completed', 'semua_umur', 4.40, 7000, 21000, 642000, DATE_SUB(NOW(), INTERVAL 8 DAY), DATE_SUB(NOW(), INTERVAL 8 DAY), NOW()),
(5, 3, 'Rekan Buatan', 'rekan-buatan', 'Di tahun 2147, android generasi terbaru diberi satu misi: menjadi sahabat bagi anak-anak yang kesepian. Tapi apa jadinya jika android itu mulai bertanya tentang perasaannya sendiri?', 'comics/covers/comic-5.svg', 'ongoing', 'remaja', 4.70, 13267, 39800, 1105000, DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_SUB(NOW(), INTERVAL 7 DAY), NOW()),
(6, 4, 'Pedang Senja', 'pedang-senja', 'Dunia di ambang kegelapan abadi. Satu-satunya harapan adalah pedang legendaris yang hanya bisa diangkat oleh mereka yang tak punya apa-apa untuk dilindungi.', 'comics/covers/comic-6.svg', 'hiatus', 'remaja', 4.30, 5800, 17400, 523000, DATE_SUB(NOW(), INTERVAL 6 DAY), DATE_SUB(NOW(), INTERVAL 6 DAY), NOW()),
(7, 2, 'Secangkir Kenangan', 'secangkir-kenangan', 'Kedai kopi kecil di sudut kota menyimpan rahasia: setiap cangkir yang disajikan bisa mengembalikan satu kenangan pelanggannya. Cerita slice-of-life tentang cinta, kehilangan, dan harapan.', 'comics/covers/comic-7.svg', 'completed', 'semua_umur', 4.90, 13733, 41200, 890000, DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY), NOW()),
(8, 3, 'Kasus Nol', 'kasus-nol', 'Detektif muda yang skeptis dipaksa bekerja sama dengan paranormal jenius untuk memecahkan "kasus nol" — pembunuhan yang terjadi sebelum korban lahir.', 'comics/covers/comic-8.svg', 'ongoing', 'dewasa', 4.60, 7500, 22500, 668000, DATE_SUB(NOW(), INTERVAL 4 DAY), DATE_SUB(NOW(), INTERVAL 4 DAY), NOW()),
(9, 4, 'Menara Tanpa Puncak', 'menara-tanpa-puncak', 'Menara misterius muncul di tengah kota setiap 100 tahun. Seorang pendaki bernama Sakura masuk sendirian untuk menemukan jawaban di lantai teratas — yang tak pernah ada.', 'comics/covers/comic-9.svg', 'ongoing', 'semua_umur', 4.70, 8933, 26800, 745000, DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 3 DAY), NOW()),
(10, 2, 'Si Rubah Juga', 'si-rubah-juga', 'Rubah berbulu sembilan yang bisa berubah wujud memutuskan menjadi YouTuber agar bisa membeli mahkota surgawi. Petualangan konyol dengan sentuhan mitologi.', 'comics/covers/comic-10.svg', 'ongoing', 'semua_umur', 4.20, 3967, 11900, 334000, DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY), NOW()),
(11, 3, 'Jatuh dari Bintang', 'jatuh-dari-bintang', 'Bintang jatuh yang menjelma gadis kecil menumpang hidup di rumah seorang penyendiri. Ia mencoba memahami dunia manusia — dan manusia belajar merindukan langit.', 'comics/covers/comic-11.svg', 'ongoing', 'semua_umur', 4.50, 6767, 20300, 587000, DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY), NOW()),
(12, 4, 'Tengkorak Tertawa', 'tengkorak-tertawa', 'Setiap orang yang menerima tengkorak ukiran misterius akan tertawa tanpa henti selama 24 jam. Seorang reporter mengejar asal usulnya — dan menemukan dirinya sebagai target berikutnya.', 'comics/covers/comic-12.svg', 'hiatus', 'dewasa', 4.10, 3267, 9800, 289000, DATE_SUB(NOW(), INTERVAL 0 DAY), DATE_SUB(NOW(), INTERVAL 0 DAY), NOW());

-- -------------------------------------------------------------------
-- 7. Comic-Genre relationships
-- -------------------------------------------------------------------
INSERT IGNORE INTO comic_genres (comic_id, genre_id) VALUES
(1, 3), (1, 1), (1, 8),   -- Bulan di Ujung Jari: fantasy, action, slice-of-life
(2, 1), (2, 3), (2, 10),  -- Naga Terakhir: action, fantasy, adventure
(3, 2), (3, 4),            -- Cinta Tak Berbalas: romance, drama
(4, 6), (4, 5), (4, 8),   -- Kost Paranormal: horror, comedy, slice-of-life
(5, 7), (5, 4),            -- Rekan Buatan: sci-fi, drama
(6, 1), (6, 3), (6, 9),   -- Pedang Senja: action, fantasy, thriller
(7, 8), (7, 2), (7, 4),   -- Secangkir Kenangan: slice-of-life, romance, drama
(8, 9), (8, 6), (8, 7),   -- Kasus Nol: thriller, horror, sci-fi
(9, 3), (9, 9), (9, 10),  -- Menara Tanpa Puncak: fantasy, thriller, adventure
(10, 5), (10, 3),          -- Si Rubah Juga: comedy, fantasy
(11, 8), (11, 2), (11, 3), -- Jatuh dari Bintang: slice-of-life, romance, fantasy
(12, 6), (12, 9);          -- Tengkorak Tertawa: horror, thriller

-- -------------------------------------------------------------------
-- 8. Episodes (8 per comic, 1-5 free, 6-8 premium @50 coins)
-- -------------------------------------------------------------------
-- Comic 1: Bulan di Ujung Jari
INSERT IGNORE INTO episodes (id, comic_id, title, number, status, is_premium, price_coin, view_count, like_count, published_at, created_at, updated_at) VALUES
(1, 1, 'Episode 1: Awal Perjalanan', 1, 'published', 0, 0, 321000, 11300, DATE_SUB(NOW(), INTERVAL 15 DAY), DATE_SUB(NOW(), INTERVAL 15 DAY), NOW()),
(2, 1, 'Episode 2: Jejak yang Hilang', 2, 'published', 0, 0, 256800, 9040, DATE_SUB(NOW(), INTERVAL 13 DAY), DATE_SUB(NOW(), INTERVAL 13 DAY), NOW()),
(3, 1, 'Episode 3: Pertemuan Tak Terduga', 3, 'published', 0, 0, 214000, 7540, DATE_SUB(NOW(), INTERVAL 11 DAY), DATE_SUB(NOW(), INTERVAL 11 DAY), NOW()),
(4, 1, 'Episode 4: Rahasia Terbongkar', 4, 'published', 0, 0, 160500, 5660, DATE_SUB(NOW(), INTERVAL 9 DAY), DATE_SUB(NOW(), INTERVAL 9 DAY), NOW()),
(5, 1, 'Episode 5: Badai Datang', 5, 'published', 0, 0, 128400, 4520, DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_SUB(NOW(), INTERVAL 7 DAY), NOW()),
(6, 1, 'Episode 6: Pilihan Sulit', 6, 'published', 1, 50, 107000, 3770, DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY), NOW()),
(7, 1, 'Episode 7: Bayangan Lama', 7, 'published', 1, 50, 64200, 2260, DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 3 DAY), NOW()),
(8, 1, 'Episode 8: Kebangkitan', 8, 'published', 1, 50, 32100, 1130, DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY), NOW());

-- Comic 2: Naga Terakhir
INSERT IGNORE INTO episodes (id, comic_id, title, number, status, is_premium, price_coin, view_count, like_count, published_at, created_at, updated_at) VALUES
(9, 2, 'Episode 1: Awal Perjalanan', 1, 'published', 0, 0, 245500, 8275, DATE_SUB(NOW(), INTERVAL 14 DAY), DATE_SUB(NOW(), INTERVAL 14 DAY), NOW()),
(10, 2, 'Episode 2: Jejak yang Hilang', 2, 'published', 0, 0, 196400, 6620, DATE_SUB(NOW(), INTERVAL 12 DAY), DATE_SUB(NOW(), INTERVAL 12 DAY), NOW()),
(11, 2, 'Episode 3: Pertemuan Tak Terduga', 3, 'published', 0, 0, 163667, 5517, DATE_SUB(NOW(), INTERVAL 10 DAY), DATE_SUB(NOW(), INTERVAL 10 DAY), NOW()),
(12, 2, 'Episode 4: Rahasia Terbongkar', 4, 'published', 0, 0, 122750, 4138, DATE_SUB(NOW(), INTERVAL 8 DAY), DATE_SUB(NOW(), INTERVAL 8 DAY), NOW()),
(13, 2, 'Episode 5: Badai Datang', 5, 'published', 0, 0, 98200, 3310, DATE_SUB(NOW(), INTERVAL 6 DAY), DATE_SUB(NOW(), INTERVAL 6 DAY), NOW()),
(14, 2, 'Episode 6: Pilihan Sulit', 6, 'published', 1, 50, 81833, 2758, DATE_SUB(NOW(), INTERVAL 4 DAY), DATE_SUB(NOW(), INTERVAL 4 DAY), NOW()),
(15, 2, 'Episode 7: Bayangan Lama', 7, 'published', 1, 50, 49100, 1655, DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY), NOW()),
(16, 2, 'Episode 8: Kebangkitan', 8, 'published', 1, 50, 24550, 828, DATE_SUB(NOW(), INTERVAL 0 DAY), DATE_SUB(NOW(), INTERVAL 0 DAY), NOW());

-- Comic 3: Cinta Tak Berbalas
INSERT IGNORE INTO episodes (id, comic_id, title, number, status, is_premium, price_coin, view_count, like_count, published_at, created_at, updated_at) VALUES
(17, 3, 'Episode 1: Awal Perjalanan', 1, 'published', 0, 0, 189000, 7225, DATE_SUB(NOW(), INTERVAL 13 DAY), DATE_SUB(NOW(), INTERVAL 13 DAY), NOW()),
(18, 3, 'Episode 2: Jejak yang Hilang', 2, 'published', 0, 0, 151200, 5780, DATE_SUB(NOW(), INTERVAL 11 DAY), DATE_SUB(NOW(), INTERVAL 11 DAY), NOW()),
(19, 3, 'Episode 3: Pertemuan Tak Terduga', 3, 'published', 0, 0, 126000, 4817, DATE_SUB(NOW(), INTERVAL 9 DAY), DATE_SUB(NOW(), INTERVAL 9 DAY), NOW()),
(20, 3, 'Episode 4: Rahasia Terbongkar', 4, 'published', 0, 0, 94500, 3613, DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_SUB(NOW(), INTERVAL 7 DAY), NOW()),
(21, 3, 'Episode 5: Badai Datang', 5, 'published', 0, 0, 75600, 2890, DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY), NOW()),
(22, 3, 'Episode 6: Pilihan Sulit', 6, 'published', 1, 50, 63000, 2408, DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 3 DAY), NOW()),
(23, 3, 'Episode 7: Bayangan Lama', 7, 'published', 1, 50, 37800, 1445, DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY), NOW()),
(24, 3, 'Episode 8: Kebangkitan', 8, 'published', 1, 50, 18900, 723, DATE_SUB(NOW(), INTERVAL 0 DAY), DATE_SUB(NOW(), INTERVAL 0 DAY), NOW());

-- Comic 4: Kost Paranormal
INSERT IGNORE INTO episodes (id, comic_id, title, number, status, is_premium, price_coin, view_count, like_count, published_at, created_at, updated_at) VALUES
(25, 4, 'Episode 1: Awal Perjalanan', 1, 'published', 0, 0, 160500, 5250, DATE_SUB(NOW(), INTERVAL 12 DAY), DATE_SUB(NOW(), INTERVAL 12 DAY), NOW()),
(26, 4, 'Episode 2: Jejak yang Hilang', 2, 'published', 0, 0, 128400, 4200, DATE_SUB(NOW(), INTERVAL 10 DAY), DATE_SUB(NOW(), INTERVAL 10 DAY), NOW()),
(27, 4, 'Episode 3: Pertemuan Tak Terduga', 3, 'published', 0, 0, 107000, 3500, DATE_SUB(NOW(), INTERVAL 8 DAY), DATE_SUB(NOW(), INTERVAL 8 DAY), NOW()),
(28, 4, 'Episode 4: Rahasia Terbongkar', 4, 'published', 0, 0, 80250, 2625, DATE_SUB(NOW(), INTERVAL 6 DAY), DATE_SUB(NOW(), INTERVAL 6 DAY), NOW()),
(29, 4, 'Episode 5: Badai Datang', 5, 'published', 0, 0, 64200, 2100, DATE_SUB(NOW(), INTERVAL 4 DAY), DATE_SUB(NOW(), INTERVAL 4 DAY), NOW()),
(30, 4, 'Episode 6: Pilihan Sulit', 6, 'published', 1, 50, 53500, 1750, DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY), NOW()),
(31, 4, 'Episode 7: Bayangan Lama', 7, 'published', 1, 50, 32100, 1050, DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY), NOW()),
(32, 4, 'Episode 8: Kebangkitan', 8, 'published', 1, 50, 16050, 525, DATE_SUB(NOW(), INTERVAL 0 DAY), DATE_SUB(NOW(), INTERVAL 0 DAY), NOW());

-- Comic 5: Rekan Buatan
INSERT IGNORE INTO episodes (id, comic_id, title, number, status, is_premium, price_coin, view_count, like_count, published_at, created_at, updated_at) VALUES
(33, 5, 'Episode 1: Awal Perjalanan', 1, 'published', 0, 0, 276250, 9950, DATE_SUB(NOW(), INTERVAL 11 DAY), DATE_SUB(NOW(), INTERVAL 11 DAY), NOW()),
(34, 5, 'Episode 2: Jejak yang Hilang', 2, 'published', 0, 0, 221000, 7960, DATE_SUB(NOW(), INTERVAL 9 DAY), DATE_SUB(NOW(), INTERVAL 9 DAY), NOW()),
(35, 5, 'Episode 3: Pertemuan Tak Terduga', 3, 'published', 0, 0, 184167, 6633, DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_SUB(NOW(), INTERVAL 7 DAY), NOW()),
(36, 5, 'Episode 4: Rahasia Terbongkar', 4, 'published', 0, 0, 138125, 4975, DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY), NOW()),
(37, 5, 'Episode 5: Badai Datang', 5, 'published', 0, 0, 110500, 3980, DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 3 DAY), NOW()),
(38, 5, 'Episode 6: Pilihan Sulit', 6, 'published', 1, 50, 92083, 3317, DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY), NOW()),
(39, 5, 'Episode 7: Bayangan Lama', 7, 'published', 1, 50, 55250, 1990, DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY), NOW()),
(40, 5, 'Episode 8: Kebangkitan', 8, 'published', 1, 50, 27625, 995, DATE_SUB(NOW(), INTERVAL 0 DAY), DATE_SUB(NOW(), INTERVAL 0 DAY), NOW());

-- Comic 6: Pedang Senja
INSERT IGNORE INTO episodes (id, comic_id, title, number, status, is_premium, price_coin, view_count, like_count, published_at, created_at, updated_at) VALUES
(41, 6, 'Episode 1: Awal Perjalanan', 1, 'published', 0, 0, 130750, 4350, DATE_SUB(NOW(), INTERVAL 10 DAY), DATE_SUB(NOW(), INTERVAL 10 DAY), NOW()),
(42, 6, 'Episode 2: Jejak yang Hilang', 2, 'published', 0, 0, 104600, 3480, DATE_SUB(NOW(), INTERVAL 8 DAY), DATE_SUB(NOW(), INTERVAL 8 DAY), NOW()),
(43, 6, 'Episode 3: Pertemuan Tak Terduga', 3, 'published', 0, 0, 87167, 2900, DATE_SUB(NOW(), INTERVAL 6 DAY), DATE_SUB(NOW(), INTERVAL 6 DAY), NOW()),
(44, 6, 'Episode 4: Rahasia Terbongkar', 4, 'published', 0, 0, 65375, 2175, DATE_SUB(NOW(), INTERVAL 4 DAY), DATE_SUB(NOW(), INTERVAL 4 DAY), NOW()),
(45, 6, 'Episode 5: Badai Datang', 5, 'published', 0, 0, 52300, 1740, DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY), NOW()),
(46, 6, 'Episode 6: Pilihan Sulit', 6, 'published', 1, 50, 43583, 1450, DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY), NOW()),
(47, 6, 'Episode 7: Bayangan Lama', 7, 'published', 1, 50, 26150, 870, DATE_SUB(NOW(), INTERVAL 0 DAY), DATE_SUB(NOW(), INTERVAL 0 DAY), NOW()),
(48, 6, 'Episode 8: Kebangkitan', 8, 'published', 1, 50, 13075, 435, DATE_SUB(NOW(), INTERVAL 0 DAY), DATE_SUB(NOW(), INTERVAL 0 DAY), NOW());

-- Comic 7: Secangkir Kenangan
INSERT IGNORE INTO episodes (id, comic_id, title, number, status, is_premium, price_coin, view_count, like_count, published_at, created_at, updated_at) VALUES
(49, 7, 'Episode 1: Awal Perjalanan', 1, 'published', 0, 0, 222500, 10300, DATE_SUB(NOW(), INTERVAL 9 DAY), DATE_SUB(NOW(), INTERVAL 9 DAY), NOW()),
(50, 7, 'Episode 2: Jejak yang Hilang', 2, 'published', 0, 0, 178000, 8240, DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_SUB(NOW(), INTERVAL 7 DAY), NOW()),
(51, 7, 'Episode 3: Pertemuan Tak Terduga', 3, 'published', 0, 0, 148333, 6867, DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY), NOW()),
(52, 7, 'Episode 4: Rahasia Terbongkar', 4, 'published', 0, 0, 111250, 5150, DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 3 DAY), NOW()),
(53, 7, 'Episode 5: Badai Datang', 5, 'published', 0, 0, 89000, 4120, DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY), NOW()),
(54, 7, 'Episode 6: Pilihan Sulit', 6, 'published', 1, 50, 74167, 3433, DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY), NOW()),
(55, 7, 'Episode 7: Bayangan Lama', 7, 'published', 1, 50, 44500, 2060, DATE_SUB(NOW(), INTERVAL 0 DAY), DATE_SUB(NOW(), INTERVAL 0 DAY), NOW()),
(56, 7, 'Episode 8: Kebangkitan', 8, 'published', 1, 50, 22250, 1030, DATE_SUB(NOW(), INTERVAL 0 DAY), DATE_SUB(NOW(), INTERVAL 0 DAY), NOW());

-- Comic 8: Kasus Nol
INSERT IGNORE INTO episodes (id, comic_id, title, number, status, is_premium, price_coin, view_count, like_count, published_at, created_at, updated_at) VALUES
(57, 8, 'Episode 1: Awal Perjalanan', 1, 'published', 0, 0, 167000, 5625, DATE_SUB(NOW(), INTERVAL 8 DAY), DATE_SUB(NOW(), INTERVAL 8 DAY), NOW()),
(58, 8, 'Episode 2: Jejak yang Hilang', 2, 'published', 0, 0, 133600, 4500, DATE_SUB(NOW(), INTERVAL 6 DAY), DATE_SUB(NOW(), INTERVAL 6 DAY), NOW()),
(59, 8, 'Episode 3: Pertemuan Tak Terduga', 3, 'published', 0, 0, 111333, 3750, DATE_SUB(NOW(), INTERVAL 4 DAY), DATE_SUB(NOW(), INTERVAL 4 DAY), NOW()),
(60, 8, 'Episode 4: Rahasia Terbongkar', 4, 'published', 0, 0, 83500, 2813, DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY), NOW()),
(61, 8, 'Episode 5: Badai Datang', 5, 'published', 0, 0, 66800, 2250, DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY), NOW()),
(62, 8, 'Episode 6: Pilihan Sulit', 6, 'published', 1, 50, 55667, 1875, DATE_SUB(NOW(), INTERVAL 0 DAY), DATE_SUB(NOW(), INTERVAL 0 DAY), NOW()),
(63, 8, 'Episode 7: Bayangan Lama', 7, 'published', 1, 50, 33400, 1125, DATE_SUB(NOW(), INTERVAL 0 DAY), DATE_SUB(NOW(), INTERVAL 0 DAY), NOW()),
(64, 8, 'Episode 8: Kebangkitan', 8, 'published', 1, 50, 16700, 563, DATE_SUB(NOW(), INTERVAL 0 DAY), DATE_SUB(NOW(), INTERVAL 0 DAY), NOW());

-- Comic 9: Menara Tanpa Puncak
INSERT IGNORE INTO episodes (id, comic_id, title, number, status, is_premium, price_coin, view_count, like_count, published_at, created_at, updated_at) VALUES
(65, 9, 'Episode 1: Awal Perjalanan', 1, 'published', 0, 0, 186250, 6700, DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_SUB(NOW(), INTERVAL 7 DAY), NOW()),
(66, 9, 'Episode 2: Jejak yang Hilang', 2, 'published', 0, 0, 149000, 5360, DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY), NOW()),
(67, 9, 'Episode 3: Pertemuan Tak Terduga', 3, 'published', 0, 0, 124167, 4467, DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 3 DAY), NOW()),
(68, 9, 'Episode 4: Rahasia Terbongkar', 4, 'published', 0, 0, 93125, 3350, DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY), NOW()),
(69, 9, 'Episode 5: Badai Datang', 5, 'published', 0, 0, 74500, 2680, DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY), NOW()),
(70, 9, 'Episode 6: Pilihan Sulit', 6, 'published', 1, 50, 62083, 2233, DATE_SUB(NOW(), INTERVAL 0 DAY), DATE_SUB(NOW(), INTERVAL 0 DAY), NOW()),
(71, 9, 'Episode 7: Bayangan Lama', 7, 'published', 1, 50, 37250, 1340, DATE_SUB(NOW(), INTERVAL 0 DAY), DATE_SUB(NOW(), INTERVAL 0 DAY), NOW()),
(72, 9, 'Episode 8: Kebangkitan', 8, 'published', 1, 50, 18625, 670, DATE_SUB(NOW(), INTERVAL 0 DAY), DATE_SUB(NOW(), INTERVAL 0 DAY), NOW());

-- Comic 10: Si Rubah Juga
INSERT IGNORE INTO episodes (id, comic_id, title, number, status, is_premium, price_coin, view_count, like_count, published_at, created_at, updated_at) VALUES
(73, 10, 'Episode 1: Awal Perjalanan', 1, 'published', 0, 0, 83500, 2975, DATE_SUB(NOW(), INTERVAL 6 DAY), DATE_SUB(NOW(), INTERVAL 6 DAY), NOW()),
(74, 10, 'Episode 2: Jejak yang Hilang', 2, 'published', 0, 0, 66800, 2380, DATE_SUB(NOW(), INTERVAL 4 DAY), DATE_SUB(NOW(), INTERVAL 4 DAY), NOW()),
(75, 10, 'Episode 3: Pertemuan Tak Terduga', 3, 'published', 0, 0, 55667, 1983, DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY), NOW()),
(76, 10, 'Episode 4: Rahasia Terbongkar', 4, 'published', 0, 0, 41750, 1488, DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY), NOW()),
(77, 10, 'Episode 5: Badai Datang', 5, 'published', 0, 0, 33400, 1190, DATE_SUB(NOW(), INTERVAL 0 DAY), DATE_SUB(NOW(), INTERVAL 0 DAY), NOW()),
(78, 10, 'Episode 6: Pilihan Sulit', 6, 'published', 1, 50, 27833, 992, DATE_SUB(NOW(), INTERVAL 0 DAY), DATE_SUB(NOW(), INTERVAL 0 DAY), NOW()),
(79, 10, 'Episode 7: Bayangan Lama', 7, 'published', 1, 50, 16700, 595, DATE_SUB(NOW(), INTERVAL 0 DAY), DATE_SUB(NOW(), INTERVAL 0 DAY), NOW()),
(80, 10, 'Episode 8: Kebangkitan', 8, 'published', 1, 50, 8350, 298, DATE_SUB(NOW(), INTERVAL 0 DAY), DATE_SUB(NOW(), INTERVAL 0 DAY), NOW());

-- Comic 11: Jatuh dari Bintang
INSERT IGNORE INTO episodes (id, comic_id, title, number, status, is_premium, price_coin, view_count, like_count, published_at, created_at, updated_at) VALUES
(81, 11, 'Episode 1: Awal Perjalanan', 1, 'published', 0, 0, 146750, 5075, DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY), NOW()),
(82, 11, 'Episode 2: Jejak yang Hilang', 2, 'published', 0, 0, 117400, 4060, DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 3 DAY), NOW()),
(83, 11, 'Episode 3: Pertemuan Tak Terduga', 3, 'published', 0, 0, 97833, 3383, DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY), NOW()),
(84, 11, 'Episode 4: Rahasia Terbongkar', 4, 'published', 0, 0, 73375, 2538, DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY), NOW()),
(85, 11, 'Episode 5: Badai Datang', 5, 'published', 0, 0, 58700, 2030, DATE_SUB(NOW(), INTERVAL 0 DAY), DATE_SUB(NOW(), INTERVAL 0 DAY), NOW()),
(86, 11, 'Episode 6: Pilihan Sulit', 6, 'published', 1, 50, 48917, 1692, DATE_SUB(NOW(), INTERVAL 0 DAY), DATE_SUB(NOW(), INTERVAL 0 DAY), NOW()),
(87, 11, 'Episode 7: Bayangan Lama', 7, 'published', 1, 50, 29350, 1015, DATE_SUB(NOW(), INTERVAL 0 DAY), DATE_SUB(NOW(), INTERVAL 0 DAY), NOW()),
(88, 11, 'Episode 8: Kebangkitan', 8, 'published', 1, 50, 14675, 508, DATE_SUB(NOW(), INTERVAL 0 DAY), DATE_SUB(NOW(), INTERVAL 0 DAY), NOW());

-- Comic 12: Tengkorak Tertawa
INSERT IGNORE INTO episodes (id, comic_id, title, number, status, is_premium, price_coin, view_count, like_count, published_at, created_at, updated_at) VALUES
(89, 12, 'Episode 1: Awal Perjalanan', 1, 'published', 0, 0, 72250, 2450, DATE_SUB(NOW(), INTERVAL 4 DAY), DATE_SUB(NOW(), INTERVAL 4 DAY), NOW()),
(90, 12, 'Episode 2: Jejak yang Hilang', 2, 'published', 0, 0, 57800, 1960, DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY), NOW()),
(91, 12, 'Episode 3: Pertemuan Tak Terduga', 3, 'published', 0, 0, 48167, 1633, DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY), NOW()),
(92, 12, 'Episode 4: Rahasia Terbongkar', 4, 'published', 0, 0, 36125, 1225, DATE_SUB(NOW(), INTERVAL 0 DAY), DATE_SUB(NOW(), INTERVAL 0 DAY), NOW()),
(93, 12, 'Episode 5: Badai Datang', 5, 'published', 0, 0, 28900, 980, DATE_SUB(NOW(), INTERVAL 0 DAY), DATE_SUB(NOW(), INTERVAL 0 DAY), NOW()),
(94, 12, 'Episode 6: Pilihan Sulit', 6, 'published', 1, 50, 24083, 817, DATE_SUB(NOW(), INTERVAL 0 DAY), DATE_SUB(NOW(), INTERVAL 0 DAY), NOW()),
(95, 12, 'Episode 7: Bayangan Lama', 7, 'published', 1, 50, 14450, 490, DATE_SUB(NOW(), INTERVAL 0 DAY), DATE_SUB(NOW(), INTERVAL 0 DAY), NOW()),
(96, 12, 'Episode 8: Kebangkitan', 8, 'published', 1, 50, 7225, 245, DATE_SUB(NOW(), INTERVAL 0 DAY), DATE_SUB(NOW(), INTERVAL 0 DAY), NOW());

-- -------------------------------------------------------------------
-- 9. Episode Pages (10 per episode — 960 total)
-- Uses INSERT IGNORE so re-runs are safe
-- -------------------------------------------------------------------
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (1, 1, 'demo-pages/comic-1/episode-1/p1.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (1, 2, 'demo-pages/comic-1/episode-1/p2.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (1, 3, 'demo-pages/comic-1/episode-1/p3.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (1, 4, 'demo-pages/comic-1/episode-1/p4.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (1, 5, 'demo-pages/comic-1/episode-1/p5.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (1, 6, 'demo-pages/comic-1/episode-1/p6.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (1, 7, 'demo-pages/comic-1/episode-1/p7.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (1, 8, 'demo-pages/comic-1/episode-1/p8.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (1, 9, 'demo-pages/comic-1/episode-1/p9.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (1, 10, 'demo-pages/comic-1/episode-1/p10.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (2, 1, 'demo-pages/comic-1/episode-2/p1.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (2, 2, 'demo-pages/comic-1/episode-2/p2.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (2, 3, 'demo-pages/comic-1/episode-2/p3.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (2, 4, 'demo-pages/comic-1/episode-2/p4.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (2, 5, 'demo-pages/comic-1/episode-2/p5.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (2, 6, 'demo-pages/comic-1/episode-2/p6.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (2, 7, 'demo-pages/comic-1/episode-2/p7.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (2, 8, 'demo-pages/comic-1/episode-2/p8.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (2, 9, 'demo-pages/comic-1/episode-2/p9.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (2, 10, 'demo-pages/comic-1/episode-2/p10.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (3, 1, 'demo-pages/comic-1/episode-3/p1.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (3, 2, 'demo-pages/comic-1/episode-3/p2.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (3, 3, 'demo-pages/comic-1/episode-3/p3.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (3, 4, 'demo-pages/comic-1/episode-3/p4.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (3, 5, 'demo-pages/comic-1/episode-3/p5.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (3, 6, 'demo-pages/comic-1/episode-3/p6.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (3, 7, 'demo-pages/comic-1/episode-3/p7.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (3, 8, 'demo-pages/comic-1/episode-3/p8.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (3, 9, 'demo-pages/comic-1/episode-3/p9.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (3, 10, 'demo-pages/comic-1/episode-3/p10.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (4, 1, 'demo-pages/comic-1/episode-4/p1.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (4, 2, 'demo-pages/comic-1/episode-4/p2.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (4, 3, 'demo-pages/comic-1/episode-4/p3.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (4, 4, 'demo-pages/comic-1/episode-4/p4.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (4, 5, 'demo-pages/comic-1/episode-4/p5.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (4, 6, 'demo-pages/comic-1/episode-4/p6.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (4, 7, 'demo-pages/comic-1/episode-4/p7.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (4, 8, 'demo-pages/comic-1/episode-4/p8.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (4, 9, 'demo-pages/comic-1/episode-4/p9.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (4, 10, 'demo-pages/comic-1/episode-4/p10.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (5, 1, 'demo-pages/comic-1/episode-5/p1.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (5, 2, 'demo-pages/comic-1/episode-5/p2.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (5, 3, 'demo-pages/comic-1/episode-5/p3.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (5, 4, 'demo-pages/comic-1/episode-5/p4.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (5, 5, 'demo-pages/comic-1/episode-5/p5.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (5, 6, 'demo-pages/comic-1/episode-5/p6.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (5, 7, 'demo-pages/comic-1/episode-5/p7.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (5, 8, 'demo-pages/comic-1/episode-5/p8.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (5, 9, 'demo-pages/comic-1/episode-5/p9.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (5, 10, 'demo-pages/comic-1/episode-5/p10.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (6, 1, 'demo-pages/comic-1/episode-6/p1.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (6, 2, 'demo-pages/comic-1/episode-6/p2.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (6, 3, 'demo-pages/comic-1/episode-6/p3.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (6, 4, 'demo-pages/comic-1/episode-6/p4.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (6, 5, 'demo-pages/comic-1/episode-6/p5.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (6, 6, 'demo-pages/comic-1/episode-6/p6.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (6, 7, 'demo-pages/comic-1/episode-6/p7.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (6, 8, 'demo-pages/comic-1/episode-6/p8.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (6, 9, 'demo-pages/comic-1/episode-6/p9.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (6, 10, 'demo-pages/comic-1/episode-6/p10.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (7, 1, 'demo-pages/comic-1/episode-7/p1.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (7, 2, 'demo-pages/comic-1/episode-7/p2.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (7, 3, 'demo-pages/comic-1/episode-7/p3.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (7, 4, 'demo-pages/comic-1/episode-7/p4.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (7, 5, 'demo-pages/comic-1/episode-7/p5.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (7, 6, 'demo-pages/comic-1/episode-7/p6.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (7, 7, 'demo-pages/comic-1/episode-7/p7.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (7, 8, 'demo-pages/comic-1/episode-7/p8.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (7, 9, 'demo-pages/comic-1/episode-7/p9.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (7, 10, 'demo-pages/comic-1/episode-7/p10.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (8, 1, 'demo-pages/comic-1/episode-8/p1.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (8, 2, 'demo-pages/comic-1/episode-8/p2.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (8, 3, 'demo-pages/comic-1/episode-8/p3.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (8, 4, 'demo-pages/comic-1/episode-8/p4.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (8, 5, 'demo-pages/comic-1/episode-8/p5.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (8, 6, 'demo-pages/comic-1/episode-8/p6.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (8, 7, 'demo-pages/comic-1/episode-8/p7.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (8, 8, 'demo-pages/comic-1/episode-8/p8.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (8, 9, 'demo-pages/comic-1/episode-8/p9.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (8, 10, 'demo-pages/comic-1/episode-8/p10.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (9, 1, 'demo-pages/comic-2/episode-9/p1.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (9, 2, 'demo-pages/comic-2/episode-9/p2.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (9, 3, 'demo-pages/comic-2/episode-9/p3.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (9, 4, 'demo-pages/comic-2/episode-9/p4.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (9, 5, 'demo-pages/comic-2/episode-9/p5.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (9, 6, 'demo-pages/comic-2/episode-9/p6.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (9, 7, 'demo-pages/comic-2/episode-9/p7.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (9, 8, 'demo-pages/comic-2/episode-9/p8.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (9, 9, 'demo-pages/comic-2/episode-9/p9.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (9, 10, 'demo-pages/comic-2/episode-9/p10.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (10, 1, 'demo-pages/comic-2/episode-10/p1.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (10, 2, 'demo-pages/comic-2/episode-10/p2.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (10, 3, 'demo-pages/comic-2/episode-10/p3.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (10, 4, 'demo-pages/comic-2/episode-10/p4.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (10, 5, 'demo-pages/comic-2/episode-10/p5.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (10, 6, 'demo-pages/comic-2/episode-10/p6.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (10, 7, 'demo-pages/comic-2/episode-10/p7.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (10, 8, 'demo-pages/comic-2/episode-10/p8.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (10, 9, 'demo-pages/comic-2/episode-10/p9.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (10, 10, 'demo-pages/comic-2/episode-10/p10.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (11, 1, 'demo-pages/comic-2/episode-11/p1.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (11, 2, 'demo-pages/comic-2/episode-11/p2.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (11, 3, 'demo-pages/comic-2/episode-11/p3.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (11, 4, 'demo-pages/comic-2/episode-11/p4.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (11, 5, 'demo-pages/comic-2/episode-11/p5.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (11, 6, 'demo-pages/comic-2/episode-11/p6.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (11, 7, 'demo-pages/comic-2/episode-11/p7.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (11, 8, 'demo-pages/comic-2/episode-11/p8.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (11, 9, 'demo-pages/comic-2/episode-11/p9.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (11, 10, 'demo-pages/comic-2/episode-11/p10.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (12, 1, 'demo-pages/comic-2/episode-12/p1.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (12, 2, 'demo-pages/comic-2/episode-12/p2.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (12, 3, 'demo-pages/comic-2/episode-12/p3.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (12, 4, 'demo-pages/comic-2/episode-12/p4.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (12, 5, 'demo-pages/comic-2/episode-12/p5.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (12, 6, 'demo-pages/comic-2/episode-12/p6.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (12, 7, 'demo-pages/comic-2/episode-12/p7.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (12, 8, 'demo-pages/comic-2/episode-12/p8.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (12, 9, 'demo-pages/comic-2/episode-12/p9.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (12, 10, 'demo-pages/comic-2/episode-12/p10.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (13, 1, 'demo-pages/comic-2/episode-13/p1.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (13, 2, 'demo-pages/comic-2/episode-13/p2.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (13, 3, 'demo-pages/comic-2/episode-13/p3.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (13, 4, 'demo-pages/comic-2/episode-13/p4.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (13, 5, 'demo-pages/comic-2/episode-13/p5.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (13, 6, 'demo-pages/comic-2/episode-13/p6.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (13, 7, 'demo-pages/comic-2/episode-13/p7.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (13, 8, 'demo-pages/comic-2/episode-13/p8.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (13, 9, 'demo-pages/comic-2/episode-13/p9.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (13, 10, 'demo-pages/comic-2/episode-13/p10.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (14, 1, 'demo-pages/comic-2/episode-14/p1.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (14, 2, 'demo-pages/comic-2/episode-14/p2.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (14, 3, 'demo-pages/comic-2/episode-14/p3.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (14, 4, 'demo-pages/comic-2/episode-14/p4.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (14, 5, 'demo-pages/comic-2/episode-14/p5.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (14, 6, 'demo-pages/comic-2/episode-14/p6.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (14, 7, 'demo-pages/comic-2/episode-14/p7.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (14, 8, 'demo-pages/comic-2/episode-14/p8.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (14, 9, 'demo-pages/comic-2/episode-14/p9.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (14, 10, 'demo-pages/comic-2/episode-14/p10.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (15, 1, 'demo-pages/comic-2/episode-15/p1.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (15, 2, 'demo-pages/comic-2/episode-15/p2.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (15, 3, 'demo-pages/comic-2/episode-15/p3.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (15, 4, 'demo-pages/comic-2/episode-15/p4.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (15, 5, 'demo-pages/comic-2/episode-15/p5.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (15, 6, 'demo-pages/comic-2/episode-15/p6.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (15, 7, 'demo-pages/comic-2/episode-15/p7.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (15, 8, 'demo-pages/comic-2/episode-15/p8.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (15, 9, 'demo-pages/comic-2/episode-15/p9.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (15, 10, 'demo-pages/comic-2/episode-15/p10.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (16, 1, 'demo-pages/comic-2/episode-16/p1.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (16, 2, 'demo-pages/comic-2/episode-16/p2.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (16, 3, 'demo-pages/comic-2/episode-16/p3.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (16, 4, 'demo-pages/comic-2/episode-16/p4.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (16, 5, 'demo-pages/comic-2/episode-16/p5.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (16, 6, 'demo-pages/comic-2/episode-16/p6.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (16, 7, 'demo-pages/comic-2/episode-16/p7.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (16, 8, 'demo-pages/comic-2/episode-16/p8.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (16, 9, 'demo-pages/comic-2/episode-16/p9.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (16, 10, 'demo-pages/comic-2/episode-16/p10.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (17, 1, 'demo-pages/comic-3/episode-17/p1.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (17, 2, 'demo-pages/comic-3/episode-17/p2.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (17, 3, 'demo-pages/comic-3/episode-17/p3.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (17, 4, 'demo-pages/comic-3/episode-17/p4.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (17, 5, 'demo-pages/comic-3/episode-17/p5.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (17, 6, 'demo-pages/comic-3/episode-17/p6.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (17, 7, 'demo-pages/comic-3/episode-17/p7.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (17, 8, 'demo-pages/comic-3/episode-17/p8.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (17, 9, 'demo-pages/comic-3/episode-17/p9.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (17, 10, 'demo-pages/comic-3/episode-17/p10.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (18, 1, 'demo-pages/comic-3/episode-18/p1.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (18, 2, 'demo-pages/comic-3/episode-18/p2.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (18, 3, 'demo-pages/comic-3/episode-18/p3.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (18, 4, 'demo-pages/comic-3/episode-18/p4.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (18, 5, 'demo-pages/comic-3/episode-18/p5.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (18, 6, 'demo-pages/comic-3/episode-18/p6.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (18, 7, 'demo-pages/comic-3/episode-18/p7.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (18, 8, 'demo-pages/comic-3/episode-18/p8.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (18, 9, 'demo-pages/comic-3/episode-18/p9.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (18, 10, 'demo-pages/comic-3/episode-18/p10.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (19, 1, 'demo-pages/comic-3/episode-19/p1.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (19, 2, 'demo-pages/comic-3/episode-19/p2.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (19, 3, 'demo-pages/comic-3/episode-19/p3.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (19, 4, 'demo-pages/comic-3/episode-19/p4.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (19, 5, 'demo-pages/comic-3/episode-19/p5.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (19, 6, 'demo-pages/comic-3/episode-19/p6.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (19, 7, 'demo-pages/comic-3/episode-19/p7.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (19, 8, 'demo-pages/comic-3/episode-19/p8.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (19, 9, 'demo-pages/comic-3/episode-19/p9.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (19, 10, 'demo-pages/comic-3/episode-19/p10.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (20, 1, 'demo-pages/comic-3/episode-20/p1.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (20, 2, 'demo-pages/comic-3/episode-20/p2.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (20, 3, 'demo-pages/comic-3/episode-20/p3.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (20, 4, 'demo-pages/comic-3/episode-20/p4.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (20, 5, 'demo-pages/comic-3/episode-20/p5.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (20, 6, 'demo-pages/comic-3/episode-20/p6.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (20, 7, 'demo-pages/comic-3/episode-20/p7.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (20, 8, 'demo-pages/comic-3/episode-20/p8.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (20, 9, 'demo-pages/comic-3/episode-20/p9.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (20, 10, 'demo-pages/comic-3/episode-20/p10.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (21, 1, 'demo-pages/comic-3/episode-21/p1.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (21, 2, 'demo-pages/comic-3/episode-21/p2.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (21, 3, 'demo-pages/comic-3/episode-21/p3.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (21, 4, 'demo-pages/comic-3/episode-21/p4.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (21, 5, 'demo-pages/comic-3/episode-21/p5.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (21, 6, 'demo-pages/comic-3/episode-21/p6.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (21, 7, 'demo-pages/comic-3/episode-21/p7.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (21, 8, 'demo-pages/comic-3/episode-21/p8.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (21, 9, 'demo-pages/comic-3/episode-21/p9.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (21, 10, 'demo-pages/comic-3/episode-21/p10.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (22, 1, 'demo-pages/comic-3/episode-22/p1.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (22, 2, 'demo-pages/comic-3/episode-22/p2.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (22, 3, 'demo-pages/comic-3/episode-22/p3.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (22, 4, 'demo-pages/comic-3/episode-22/p4.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (22, 5, 'demo-pages/comic-3/episode-22/p5.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (22, 6, 'demo-pages/comic-3/episode-22/p6.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (22, 7, 'demo-pages/comic-3/episode-22/p7.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (22, 8, 'demo-pages/comic-3/episode-22/p8.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (22, 9, 'demo-pages/comic-3/episode-22/p9.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (22, 10, 'demo-pages/comic-3/episode-22/p10.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (23, 1, 'demo-pages/comic-3/episode-23/p1.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (23, 2, 'demo-pages/comic-3/episode-23/p2.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (23, 3, 'demo-pages/comic-3/episode-23/p3.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (23, 4, 'demo-pages/comic-3/episode-23/p4.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (23, 5, 'demo-pages/comic-3/episode-23/p5.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (23, 6, 'demo-pages/comic-3/episode-23/p6.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (23, 7, 'demo-pages/comic-3/episode-23/p7.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (23, 8, 'demo-pages/comic-3/episode-23/p8.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (23, 9, 'demo-pages/comic-3/episode-23/p9.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (23, 10, 'demo-pages/comic-3/episode-23/p10.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (24, 1, 'demo-pages/comic-3/episode-24/p1.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (24, 2, 'demo-pages/comic-3/episode-24/p2.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (24, 3, 'demo-pages/comic-3/episode-24/p3.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (24, 4, 'demo-pages/comic-3/episode-24/p4.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (24, 5, 'demo-pages/comic-3/episode-24/p5.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (24, 6, 'demo-pages/comic-3/episode-24/p6.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (24, 7, 'demo-pages/comic-3/episode-24/p7.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (24, 8, 'demo-pages/comic-3/episode-24/p8.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (24, 9, 'demo-pages/comic-3/episode-24/p9.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (24, 10, 'demo-pages/comic-3/episode-24/p10.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (25, 1, 'demo-pages/comic-4/episode-25/p1.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (25, 2, 'demo-pages/comic-4/episode-25/p2.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (25, 3, 'demo-pages/comic-4/episode-25/p3.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (25, 4, 'demo-pages/comic-4/episode-25/p4.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (25, 5, 'demo-pages/comic-4/episode-25/p5.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (25, 6, 'demo-pages/comic-4/episode-25/p6.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (25, 7, 'demo-pages/comic-4/episode-25/p7.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (25, 8, 'demo-pages/comic-4/episode-25/p8.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (25, 9, 'demo-pages/comic-4/episode-25/p9.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (25, 10, 'demo-pages/comic-4/episode-25/p10.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (26, 1, 'demo-pages/comic-4/episode-26/p1.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (26, 2, 'demo-pages/comic-4/episode-26/p2.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (26, 3, 'demo-pages/comic-4/episode-26/p3.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (26, 4, 'demo-pages/comic-4/episode-26/p4.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (26, 5, 'demo-pages/comic-4/episode-26/p5.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (26, 6, 'demo-pages/comic-4/episode-26/p6.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (26, 7, 'demo-pages/comic-4/episode-26/p7.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (26, 8, 'demo-pages/comic-4/episode-26/p8.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (26, 9, 'demo-pages/comic-4/episode-26/p9.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (26, 10, 'demo-pages/comic-4/episode-26/p10.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (27, 1, 'demo-pages/comic-4/episode-27/p1.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (27, 2, 'demo-pages/comic-4/episode-27/p2.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (27, 3, 'demo-pages/comic-4/episode-27/p3.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (27, 4, 'demo-pages/comic-4/episode-27/p4.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (27, 5, 'demo-pages/comic-4/episode-27/p5.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (27, 6, 'demo-pages/comic-4/episode-27/p6.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (27, 7, 'demo-pages/comic-4/episode-27/p7.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (27, 8, 'demo-pages/comic-4/episode-27/p8.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (27, 9, 'demo-pages/comic-4/episode-27/p9.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (27, 10, 'demo-pages/comic-4/episode-27/p10.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (28, 1, 'demo-pages/comic-4/episode-28/p1.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (28, 2, 'demo-pages/comic-4/episode-28/p2.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (28, 3, 'demo-pages/comic-4/episode-28/p3.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (28, 4, 'demo-pages/comic-4/episode-28/p4.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (28, 5, 'demo-pages/comic-4/episode-28/p5.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (28, 6, 'demo-pages/comic-4/episode-28/p6.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (28, 7, 'demo-pages/comic-4/episode-28/p7.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (28, 8, 'demo-pages/comic-4/episode-28/p8.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (28, 9, 'demo-pages/comic-4/episode-28/p9.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (28, 10, 'demo-pages/comic-4/episode-28/p10.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (29, 1, 'demo-pages/comic-4/episode-29/p1.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (29, 2, 'demo-pages/comic-4/episode-29/p2.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (29, 3, 'demo-pages/comic-4/episode-29/p3.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (29, 4, 'demo-pages/comic-4/episode-29/p4.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (29, 5, 'demo-pages/comic-4/episode-29/p5.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (29, 6, 'demo-pages/comic-4/episode-29/p6.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (29, 7, 'demo-pages/comic-4/episode-29/p7.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (29, 8, 'demo-pages/comic-4/episode-29/p8.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (29, 9, 'demo-pages/comic-4/episode-29/p9.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (29, 10, 'demo-pages/comic-4/episode-29/p10.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (30, 1, 'demo-pages/comic-4/episode-30/p1.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (30, 2, 'demo-pages/comic-4/episode-30/p2.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (30, 3, 'demo-pages/comic-4/episode-30/p3.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (30, 4, 'demo-pages/comic-4/episode-30/p4.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (30, 5, 'demo-pages/comic-4/episode-30/p5.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (30, 6, 'demo-pages/comic-4/episode-30/p6.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (30, 7, 'demo-pages/comic-4/episode-30/p7.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (30, 8, 'demo-pages/comic-4/episode-30/p8.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (30, 9, 'demo-pages/comic-4/episode-30/p9.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (30, 10, 'demo-pages/comic-4/episode-30/p10.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (31, 1, 'demo-pages/comic-4/episode-31/p1.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (31, 2, 'demo-pages/comic-4/episode-31/p2.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (31, 3, 'demo-pages/comic-4/episode-31/p3.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (31, 4, 'demo-pages/comic-4/episode-31/p4.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (31, 5, 'demo-pages/comic-4/episode-31/p5.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (31, 6, 'demo-pages/comic-4/episode-31/p6.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (31, 7, 'demo-pages/comic-4/episode-31/p7.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (31, 8, 'demo-pages/comic-4/episode-31/p8.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (31, 9, 'demo-pages/comic-4/episode-31/p9.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (31, 10, 'demo-pages/comic-4/episode-31/p10.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (32, 1, 'demo-pages/comic-4/episode-32/p1.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (32, 2, 'demo-pages/comic-4/episode-32/p2.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (32, 3, 'demo-pages/comic-4/episode-32/p3.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (32, 4, 'demo-pages/comic-4/episode-32/p4.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (32, 5, 'demo-pages/comic-4/episode-32/p5.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (32, 6, 'demo-pages/comic-4/episode-32/p6.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (32, 7, 'demo-pages/comic-4/episode-32/p7.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (32, 8, 'demo-pages/comic-4/episode-32/p8.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (32, 9, 'demo-pages/comic-4/episode-32/p9.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (32, 10, 'demo-pages/comic-4/episode-32/p10.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (33, 1, 'demo-pages/comic-5/episode-33/p1.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (33, 2, 'demo-pages/comic-5/episode-33/p2.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (33, 3, 'demo-pages/comic-5/episode-33/p3.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (33, 4, 'demo-pages/comic-5/episode-33/p4.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (33, 5, 'demo-pages/comic-5/episode-33/p5.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (33, 6, 'demo-pages/comic-5/episode-33/p6.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (33, 7, 'demo-pages/comic-5/episode-33/p7.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (33, 8, 'demo-pages/comic-5/episode-33/p8.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (33, 9, 'demo-pages/comic-5/episode-33/p9.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (33, 10, 'demo-pages/comic-5/episode-33/p10.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (34, 1, 'demo-pages/comic-5/episode-34/p1.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (34, 2, 'demo-pages/comic-5/episode-34/p2.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (34, 3, 'demo-pages/comic-5/episode-34/p3.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (34, 4, 'demo-pages/comic-5/episode-34/p4.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (34, 5, 'demo-pages/comic-5/episode-34/p5.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (34, 6, 'demo-pages/comic-5/episode-34/p6.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (34, 7, 'demo-pages/comic-5/episode-34/p7.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (34, 8, 'demo-pages/comic-5/episode-34/p8.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (34, 9, 'demo-pages/comic-5/episode-34/p9.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (34, 10, 'demo-pages/comic-5/episode-34/p10.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (35, 1, 'demo-pages/comic-5/episode-35/p1.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (35, 2, 'demo-pages/comic-5/episode-35/p2.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (35, 3, 'demo-pages/comic-5/episode-35/p3.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (35, 4, 'demo-pages/comic-5/episode-35/p4.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (35, 5, 'demo-pages/comic-5/episode-35/p5.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (35, 6, 'demo-pages/comic-5/episode-35/p6.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (35, 7, 'demo-pages/comic-5/episode-35/p7.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (35, 8, 'demo-pages/comic-5/episode-35/p8.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (35, 9, 'demo-pages/comic-5/episode-35/p9.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (35, 10, 'demo-pages/comic-5/episode-35/p10.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (36, 1, 'demo-pages/comic-5/episode-36/p1.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (36, 2, 'demo-pages/comic-5/episode-36/p2.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (36, 3, 'demo-pages/comic-5/episode-36/p3.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (36, 4, 'demo-pages/comic-5/episode-36/p4.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (36, 5, 'demo-pages/comic-5/episode-36/p5.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (36, 6, 'demo-pages/comic-5/episode-36/p6.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (36, 7, 'demo-pages/comic-5/episode-36/p7.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (36, 8, 'demo-pages/comic-5/episode-36/p8.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (36, 9, 'demo-pages/comic-5/episode-36/p9.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (36, 10, 'demo-pages/comic-5/episode-36/p10.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (37, 1, 'demo-pages/comic-5/episode-37/p1.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (37, 2, 'demo-pages/comic-5/episode-37/p2.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (37, 3, 'demo-pages/comic-5/episode-37/p3.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (37, 4, 'demo-pages/comic-5/episode-37/p4.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (37, 5, 'demo-pages/comic-5/episode-37/p5.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (37, 6, 'demo-pages/comic-5/episode-37/p6.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (37, 7, 'demo-pages/comic-5/episode-37/p7.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (37, 8, 'demo-pages/comic-5/episode-37/p8.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (37, 9, 'demo-pages/comic-5/episode-37/p9.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (37, 10, 'demo-pages/comic-5/episode-37/p10.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (38, 1, 'demo-pages/comic-5/episode-38/p1.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (38, 2, 'demo-pages/comic-5/episode-38/p2.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (38, 3, 'demo-pages/comic-5/episode-38/p3.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (38, 4, 'demo-pages/comic-5/episode-38/p4.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (38, 5, 'demo-pages/comic-5/episode-38/p5.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (38, 6, 'demo-pages/comic-5/episode-38/p6.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (38, 7, 'demo-pages/comic-5/episode-38/p7.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (38, 8, 'demo-pages/comic-5/episode-38/p8.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (38, 9, 'demo-pages/comic-5/episode-38/p9.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (38, 10, 'demo-pages/comic-5/episode-38/p10.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (39, 1, 'demo-pages/comic-5/episode-39/p1.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (39, 2, 'demo-pages/comic-5/episode-39/p2.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (39, 3, 'demo-pages/comic-5/episode-39/p3.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (39, 4, 'demo-pages/comic-5/episode-39/p4.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (39, 5, 'demo-pages/comic-5/episode-39/p5.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (39, 6, 'demo-pages/comic-5/episode-39/p6.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (39, 7, 'demo-pages/comic-5/episode-39/p7.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (39, 8, 'demo-pages/comic-5/episode-39/p8.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (39, 9, 'demo-pages/comic-5/episode-39/p9.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (39, 10, 'demo-pages/comic-5/episode-39/p10.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (40, 1, 'demo-pages/comic-5/episode-40/p1.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (40, 2, 'demo-pages/comic-5/episode-40/p2.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (40, 3, 'demo-pages/comic-5/episode-40/p3.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (40, 4, 'demo-pages/comic-5/episode-40/p4.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (40, 5, 'demo-pages/comic-5/episode-40/p5.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (40, 6, 'demo-pages/comic-5/episode-40/p6.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (40, 7, 'demo-pages/comic-5/episode-40/p7.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (40, 8, 'demo-pages/comic-5/episode-40/p8.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (40, 9, 'demo-pages/comic-5/episode-40/p9.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (40, 10, 'demo-pages/comic-5/episode-40/p10.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (41, 1, 'demo-pages/comic-6/episode-41/p1.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (41, 2, 'demo-pages/comic-6/episode-41/p2.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (41, 3, 'demo-pages/comic-6/episode-41/p3.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (41, 4, 'demo-pages/comic-6/episode-41/p4.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (41, 5, 'demo-pages/comic-6/episode-41/p5.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (41, 6, 'demo-pages/comic-6/episode-41/p6.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (41, 7, 'demo-pages/comic-6/episode-41/p7.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (41, 8, 'demo-pages/comic-6/episode-41/p8.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (41, 9, 'demo-pages/comic-6/episode-41/p9.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (41, 10, 'demo-pages/comic-6/episode-41/p10.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (42, 1, 'demo-pages/comic-6/episode-42/p1.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (42, 2, 'demo-pages/comic-6/episode-42/p2.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (42, 3, 'demo-pages/comic-6/episode-42/p3.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (42, 4, 'demo-pages/comic-6/episode-42/p4.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (42, 5, 'demo-pages/comic-6/episode-42/p5.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (42, 6, 'demo-pages/comic-6/episode-42/p6.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (42, 7, 'demo-pages/comic-6/episode-42/p7.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (42, 8, 'demo-pages/comic-6/episode-42/p8.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (42, 9, 'demo-pages/comic-6/episode-42/p9.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (42, 10, 'demo-pages/comic-6/episode-42/p10.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (43, 1, 'demo-pages/comic-6/episode-43/p1.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (43, 2, 'demo-pages/comic-6/episode-43/p2.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (43, 3, 'demo-pages/comic-6/episode-43/p3.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (43, 4, 'demo-pages/comic-6/episode-43/p4.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (43, 5, 'demo-pages/comic-6/episode-43/p5.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (43, 6, 'demo-pages/comic-6/episode-43/p6.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (43, 7, 'demo-pages/comic-6/episode-43/p7.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (43, 8, 'demo-pages/comic-6/episode-43/p8.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (43, 9, 'demo-pages/comic-6/episode-43/p9.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (43, 10, 'demo-pages/comic-6/episode-43/p10.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (44, 1, 'demo-pages/comic-6/episode-44/p1.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (44, 2, 'demo-pages/comic-6/episode-44/p2.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (44, 3, 'demo-pages/comic-6/episode-44/p3.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (44, 4, 'demo-pages/comic-6/episode-44/p4.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (44, 5, 'demo-pages/comic-6/episode-44/p5.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (44, 6, 'demo-pages/comic-6/episode-44/p6.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (44, 7, 'demo-pages/comic-6/episode-44/p7.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (44, 8, 'demo-pages/comic-6/episode-44/p8.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (44, 9, 'demo-pages/comic-6/episode-44/p9.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (44, 10, 'demo-pages/comic-6/episode-44/p10.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (45, 1, 'demo-pages/comic-6/episode-45/p1.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (45, 2, 'demo-pages/comic-6/episode-45/p2.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (45, 3, 'demo-pages/comic-6/episode-45/p3.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (45, 4, 'demo-pages/comic-6/episode-45/p4.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (45, 5, 'demo-pages/comic-6/episode-45/p5.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (45, 6, 'demo-pages/comic-6/episode-45/p6.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (45, 7, 'demo-pages/comic-6/episode-45/p7.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (45, 8, 'demo-pages/comic-6/episode-45/p8.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (45, 9, 'demo-pages/comic-6/episode-45/p9.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (45, 10, 'demo-pages/comic-6/episode-45/p10.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (46, 1, 'demo-pages/comic-6/episode-46/p1.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (46, 2, 'demo-pages/comic-6/episode-46/p2.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (46, 3, 'demo-pages/comic-6/episode-46/p3.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (46, 4, 'demo-pages/comic-6/episode-46/p4.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (46, 5, 'demo-pages/comic-6/episode-46/p5.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (46, 6, 'demo-pages/comic-6/episode-46/p6.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (46, 7, 'demo-pages/comic-6/episode-46/p7.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (46, 8, 'demo-pages/comic-6/episode-46/p8.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (46, 9, 'demo-pages/comic-6/episode-46/p9.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (46, 10, 'demo-pages/comic-6/episode-46/p10.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (47, 1, 'demo-pages/comic-6/episode-47/p1.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (47, 2, 'demo-pages/comic-6/episode-47/p2.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (47, 3, 'demo-pages/comic-6/episode-47/p3.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (47, 4, 'demo-pages/comic-6/episode-47/p4.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (47, 5, 'demo-pages/comic-6/episode-47/p5.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (47, 6, 'demo-pages/comic-6/episode-47/p6.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (47, 7, 'demo-pages/comic-6/episode-47/p7.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (47, 8, 'demo-pages/comic-6/episode-47/p8.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (47, 9, 'demo-pages/comic-6/episode-47/p9.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (47, 10, 'demo-pages/comic-6/episode-47/p10.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (48, 1, 'demo-pages/comic-6/episode-48/p1.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (48, 2, 'demo-pages/comic-6/episode-48/p2.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (48, 3, 'demo-pages/comic-6/episode-48/p3.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (48, 4, 'demo-pages/comic-6/episode-48/p4.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (48, 5, 'demo-pages/comic-6/episode-48/p5.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (48, 6, 'demo-pages/comic-6/episode-48/p6.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (48, 7, 'demo-pages/comic-6/episode-48/p7.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (48, 8, 'demo-pages/comic-6/episode-48/p8.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (48, 9, 'demo-pages/comic-6/episode-48/p9.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (48, 10, 'demo-pages/comic-6/episode-48/p10.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (49, 1, 'demo-pages/comic-7/episode-49/p1.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (49, 2, 'demo-pages/comic-7/episode-49/p2.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (49, 3, 'demo-pages/comic-7/episode-49/p3.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (49, 4, 'demo-pages/comic-7/episode-49/p4.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (49, 5, 'demo-pages/comic-7/episode-49/p5.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (49, 6, 'demo-pages/comic-7/episode-49/p6.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (49, 7, 'demo-pages/comic-7/episode-49/p7.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (49, 8, 'demo-pages/comic-7/episode-49/p8.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (49, 9, 'demo-pages/comic-7/episode-49/p9.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (49, 10, 'demo-pages/comic-7/episode-49/p10.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (50, 1, 'demo-pages/comic-7/episode-50/p1.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (50, 2, 'demo-pages/comic-7/episode-50/p2.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (50, 3, 'demo-pages/comic-7/episode-50/p3.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (50, 4, 'demo-pages/comic-7/episode-50/p4.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (50, 5, 'demo-pages/comic-7/episode-50/p5.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (50, 6, 'demo-pages/comic-7/episode-50/p6.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (50, 7, 'demo-pages/comic-7/episode-50/p7.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (50, 8, 'demo-pages/comic-7/episode-50/p8.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (50, 9, 'demo-pages/comic-7/episode-50/p9.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (50, 10, 'demo-pages/comic-7/episode-50/p10.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (51, 1, 'demo-pages/comic-7/episode-51/p1.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (51, 2, 'demo-pages/comic-7/episode-51/p2.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (51, 3, 'demo-pages/comic-7/episode-51/p3.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (51, 4, 'demo-pages/comic-7/episode-51/p4.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (51, 5, 'demo-pages/comic-7/episode-51/p5.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (51, 6, 'demo-pages/comic-7/episode-51/p6.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (51, 7, 'demo-pages/comic-7/episode-51/p7.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (51, 8, 'demo-pages/comic-7/episode-51/p8.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (51, 9, 'demo-pages/comic-7/episode-51/p9.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (51, 10, 'demo-pages/comic-7/episode-51/p10.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (52, 1, 'demo-pages/comic-7/episode-52/p1.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (52, 2, 'demo-pages/comic-7/episode-52/p2.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (52, 3, 'demo-pages/comic-7/episode-52/p3.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (52, 4, 'demo-pages/comic-7/episode-52/p4.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (52, 5, 'demo-pages/comic-7/episode-52/p5.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (52, 6, 'demo-pages/comic-7/episode-52/p6.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (52, 7, 'demo-pages/comic-7/episode-52/p7.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (52, 8, 'demo-pages/comic-7/episode-52/p8.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (52, 9, 'demo-pages/comic-7/episode-52/p9.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (52, 10, 'demo-pages/comic-7/episode-52/p10.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (53, 1, 'demo-pages/comic-7/episode-53/p1.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (53, 2, 'demo-pages/comic-7/episode-53/p2.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (53, 3, 'demo-pages/comic-7/episode-53/p3.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (53, 4, 'demo-pages/comic-7/episode-53/p4.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (53, 5, 'demo-pages/comic-7/episode-53/p5.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (53, 6, 'demo-pages/comic-7/episode-53/p6.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (53, 7, 'demo-pages/comic-7/episode-53/p7.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (53, 8, 'demo-pages/comic-7/episode-53/p8.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (53, 9, 'demo-pages/comic-7/episode-53/p9.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (53, 10, 'demo-pages/comic-7/episode-53/p10.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (54, 1, 'demo-pages/comic-7/episode-54/p1.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (54, 2, 'demo-pages/comic-7/episode-54/p2.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (54, 3, 'demo-pages/comic-7/episode-54/p3.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (54, 4, 'demo-pages/comic-7/episode-54/p4.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (54, 5, 'demo-pages/comic-7/episode-54/p5.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (54, 6, 'demo-pages/comic-7/episode-54/p6.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (54, 7, 'demo-pages/comic-7/episode-54/p7.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (54, 8, 'demo-pages/comic-7/episode-54/p8.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (54, 9, 'demo-pages/comic-7/episode-54/p9.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (54, 10, 'demo-pages/comic-7/episode-54/p10.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (55, 1, 'demo-pages/comic-7/episode-55/p1.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (55, 2, 'demo-pages/comic-7/episode-55/p2.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (55, 3, 'demo-pages/comic-7/episode-55/p3.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (55, 4, 'demo-pages/comic-7/episode-55/p4.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (55, 5, 'demo-pages/comic-7/episode-55/p5.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (55, 6, 'demo-pages/comic-7/episode-55/p6.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (55, 7, 'demo-pages/comic-7/episode-55/p7.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (55, 8, 'demo-pages/comic-7/episode-55/p8.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (55, 9, 'demo-pages/comic-7/episode-55/p9.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (55, 10, 'demo-pages/comic-7/episode-55/p10.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (56, 1, 'demo-pages/comic-7/episode-56/p1.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (56, 2, 'demo-pages/comic-7/episode-56/p2.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (56, 3, 'demo-pages/comic-7/episode-56/p3.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (56, 4, 'demo-pages/comic-7/episode-56/p4.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (56, 5, 'demo-pages/comic-7/episode-56/p5.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (56, 6, 'demo-pages/comic-7/episode-56/p6.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (56, 7, 'demo-pages/comic-7/episode-56/p7.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (56, 8, 'demo-pages/comic-7/episode-56/p8.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (56, 9, 'demo-pages/comic-7/episode-56/p9.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (56, 10, 'demo-pages/comic-7/episode-56/p10.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (57, 1, 'demo-pages/comic-8/episode-57/p1.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (57, 2, 'demo-pages/comic-8/episode-57/p2.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (57, 3, 'demo-pages/comic-8/episode-57/p3.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (57, 4, 'demo-pages/comic-8/episode-57/p4.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (57, 5, 'demo-pages/comic-8/episode-57/p5.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (57, 6, 'demo-pages/comic-8/episode-57/p6.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (57, 7, 'demo-pages/comic-8/episode-57/p7.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (57, 8, 'demo-pages/comic-8/episode-57/p8.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (57, 9, 'demo-pages/comic-8/episode-57/p9.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (57, 10, 'demo-pages/comic-8/episode-57/p10.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (58, 1, 'demo-pages/comic-8/episode-58/p1.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (58, 2, 'demo-pages/comic-8/episode-58/p2.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (58, 3, 'demo-pages/comic-8/episode-58/p3.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (58, 4, 'demo-pages/comic-8/episode-58/p4.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (58, 5, 'demo-pages/comic-8/episode-58/p5.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (58, 6, 'demo-pages/comic-8/episode-58/p6.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (58, 7, 'demo-pages/comic-8/episode-58/p7.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (58, 8, 'demo-pages/comic-8/episode-58/p8.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (58, 9, 'demo-pages/comic-8/episode-58/p9.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (58, 10, 'demo-pages/comic-8/episode-58/p10.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (59, 1, 'demo-pages/comic-8/episode-59/p1.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (59, 2, 'demo-pages/comic-8/episode-59/p2.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (59, 3, 'demo-pages/comic-8/episode-59/p3.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (59, 4, 'demo-pages/comic-8/episode-59/p4.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (59, 5, 'demo-pages/comic-8/episode-59/p5.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (59, 6, 'demo-pages/comic-8/episode-59/p6.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (59, 7, 'demo-pages/comic-8/episode-59/p7.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (59, 8, 'demo-pages/comic-8/episode-59/p8.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (59, 9, 'demo-pages/comic-8/episode-59/p9.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (59, 10, 'demo-pages/comic-8/episode-59/p10.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (60, 1, 'demo-pages/comic-8/episode-60/p1.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (60, 2, 'demo-pages/comic-8/episode-60/p2.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (60, 3, 'demo-pages/comic-8/episode-60/p3.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (60, 4, 'demo-pages/comic-8/episode-60/p4.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (60, 5, 'demo-pages/comic-8/episode-60/p5.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (60, 6, 'demo-pages/comic-8/episode-60/p6.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (60, 7, 'demo-pages/comic-8/episode-60/p7.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (60, 8, 'demo-pages/comic-8/episode-60/p8.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (60, 9, 'demo-pages/comic-8/episode-60/p9.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (60, 10, 'demo-pages/comic-8/episode-60/p10.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (61, 1, 'demo-pages/comic-8/episode-61/p1.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (61, 2, 'demo-pages/comic-8/episode-61/p2.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (61, 3, 'demo-pages/comic-8/episode-61/p3.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (61, 4, 'demo-pages/comic-8/episode-61/p4.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (61, 5, 'demo-pages/comic-8/episode-61/p5.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (61, 6, 'demo-pages/comic-8/episode-61/p6.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (61, 7, 'demo-pages/comic-8/episode-61/p7.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (61, 8, 'demo-pages/comic-8/episode-61/p8.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (61, 9, 'demo-pages/comic-8/episode-61/p9.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (61, 10, 'demo-pages/comic-8/episode-61/p10.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (62, 1, 'demo-pages/comic-8/episode-62/p1.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (62, 2, 'demo-pages/comic-8/episode-62/p2.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (62, 3, 'demo-pages/comic-8/episode-62/p3.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (62, 4, 'demo-pages/comic-8/episode-62/p4.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (62, 5, 'demo-pages/comic-8/episode-62/p5.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (62, 6, 'demo-pages/comic-8/episode-62/p6.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (62, 7, 'demo-pages/comic-8/episode-62/p7.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (62, 8, 'demo-pages/comic-8/episode-62/p8.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (62, 9, 'demo-pages/comic-8/episode-62/p9.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (62, 10, 'demo-pages/comic-8/episode-62/p10.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (63, 1, 'demo-pages/comic-8/episode-63/p1.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (63, 2, 'demo-pages/comic-8/episode-63/p2.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (63, 3, 'demo-pages/comic-8/episode-63/p3.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (63, 4, 'demo-pages/comic-8/episode-63/p4.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (63, 5, 'demo-pages/comic-8/episode-63/p5.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (63, 6, 'demo-pages/comic-8/episode-63/p6.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (63, 7, 'demo-pages/comic-8/episode-63/p7.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (63, 8, 'demo-pages/comic-8/episode-63/p8.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (63, 9, 'demo-pages/comic-8/episode-63/p9.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (63, 10, 'demo-pages/comic-8/episode-63/p10.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (64, 1, 'demo-pages/comic-8/episode-64/p1.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (64, 2, 'demo-pages/comic-8/episode-64/p2.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (64, 3, 'demo-pages/comic-8/episode-64/p3.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (64, 4, 'demo-pages/comic-8/episode-64/p4.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (64, 5, 'demo-pages/comic-8/episode-64/p5.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (64, 6, 'demo-pages/comic-8/episode-64/p6.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (64, 7, 'demo-pages/comic-8/episode-64/p7.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (64, 8, 'demo-pages/comic-8/episode-64/p8.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (64, 9, 'demo-pages/comic-8/episode-64/p9.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (64, 10, 'demo-pages/comic-8/episode-64/p10.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (65, 1, 'demo-pages/comic-9/episode-65/p1.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (65, 2, 'demo-pages/comic-9/episode-65/p2.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (65, 3, 'demo-pages/comic-9/episode-65/p3.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (65, 4, 'demo-pages/comic-9/episode-65/p4.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (65, 5, 'demo-pages/comic-9/episode-65/p5.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (65, 6, 'demo-pages/comic-9/episode-65/p6.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (65, 7, 'demo-pages/comic-9/episode-65/p7.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (65, 8, 'demo-pages/comic-9/episode-65/p8.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (65, 9, 'demo-pages/comic-9/episode-65/p9.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (65, 10, 'demo-pages/comic-9/episode-65/p10.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (66, 1, 'demo-pages/comic-9/episode-66/p1.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (66, 2, 'demo-pages/comic-9/episode-66/p2.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (66, 3, 'demo-pages/comic-9/episode-66/p3.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (66, 4, 'demo-pages/comic-9/episode-66/p4.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (66, 5, 'demo-pages/comic-9/episode-66/p5.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (66, 6, 'demo-pages/comic-9/episode-66/p6.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (66, 7, 'demo-pages/comic-9/episode-66/p7.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (66, 8, 'demo-pages/comic-9/episode-66/p8.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (66, 9, 'demo-pages/comic-9/episode-66/p9.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (66, 10, 'demo-pages/comic-9/episode-66/p10.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (67, 1, 'demo-pages/comic-9/episode-67/p1.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (67, 2, 'demo-pages/comic-9/episode-67/p2.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (67, 3, 'demo-pages/comic-9/episode-67/p3.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (67, 4, 'demo-pages/comic-9/episode-67/p4.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (67, 5, 'demo-pages/comic-9/episode-67/p5.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (67, 6, 'demo-pages/comic-9/episode-67/p6.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (67, 7, 'demo-pages/comic-9/episode-67/p7.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (67, 8, 'demo-pages/comic-9/episode-67/p8.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (67, 9, 'demo-pages/comic-9/episode-67/p9.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (67, 10, 'demo-pages/comic-9/episode-67/p10.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (68, 1, 'demo-pages/comic-9/episode-68/p1.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (68, 2, 'demo-pages/comic-9/episode-68/p2.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (68, 3, 'demo-pages/comic-9/episode-68/p3.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (68, 4, 'demo-pages/comic-9/episode-68/p4.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (68, 5, 'demo-pages/comic-9/episode-68/p5.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (68, 6, 'demo-pages/comic-9/episode-68/p6.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (68, 7, 'demo-pages/comic-9/episode-68/p7.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (68, 8, 'demo-pages/comic-9/episode-68/p8.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (68, 9, 'demo-pages/comic-9/episode-68/p9.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (68, 10, 'demo-pages/comic-9/episode-68/p10.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (69, 1, 'demo-pages/comic-9/episode-69/p1.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (69, 2, 'demo-pages/comic-9/episode-69/p2.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (69, 3, 'demo-pages/comic-9/episode-69/p3.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (69, 4, 'demo-pages/comic-9/episode-69/p4.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (69, 5, 'demo-pages/comic-9/episode-69/p5.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (69, 6, 'demo-pages/comic-9/episode-69/p6.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (69, 7, 'demo-pages/comic-9/episode-69/p7.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (69, 8, 'demo-pages/comic-9/episode-69/p8.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (69, 9, 'demo-pages/comic-9/episode-69/p9.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (69, 10, 'demo-pages/comic-9/episode-69/p10.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (70, 1, 'demo-pages/comic-9/episode-70/p1.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (70, 2, 'demo-pages/comic-9/episode-70/p2.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (70, 3, 'demo-pages/comic-9/episode-70/p3.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (70, 4, 'demo-pages/comic-9/episode-70/p4.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (70, 5, 'demo-pages/comic-9/episode-70/p5.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (70, 6, 'demo-pages/comic-9/episode-70/p6.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (70, 7, 'demo-pages/comic-9/episode-70/p7.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (70, 8, 'demo-pages/comic-9/episode-70/p8.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (70, 9, 'demo-pages/comic-9/episode-70/p9.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (70, 10, 'demo-pages/comic-9/episode-70/p10.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (71, 1, 'demo-pages/comic-9/episode-71/p1.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (71, 2, 'demo-pages/comic-9/episode-71/p2.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (71, 3, 'demo-pages/comic-9/episode-71/p3.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (71, 4, 'demo-pages/comic-9/episode-71/p4.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (71, 5, 'demo-pages/comic-9/episode-71/p5.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (71, 6, 'demo-pages/comic-9/episode-71/p6.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (71, 7, 'demo-pages/comic-9/episode-71/p7.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (71, 8, 'demo-pages/comic-9/episode-71/p8.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (71, 9, 'demo-pages/comic-9/episode-71/p9.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (71, 10, 'demo-pages/comic-9/episode-71/p10.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (72, 1, 'demo-pages/comic-9/episode-72/p1.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (72, 2, 'demo-pages/comic-9/episode-72/p2.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (72, 3, 'demo-pages/comic-9/episode-72/p3.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (72, 4, 'demo-pages/comic-9/episode-72/p4.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (72, 5, 'demo-pages/comic-9/episode-72/p5.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (72, 6, 'demo-pages/comic-9/episode-72/p6.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (72, 7, 'demo-pages/comic-9/episode-72/p7.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (72, 8, 'demo-pages/comic-9/episode-72/p8.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (72, 9, 'demo-pages/comic-9/episode-72/p9.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (72, 10, 'demo-pages/comic-9/episode-72/p10.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (73, 1, 'demo-pages/comic-10/episode-73/p1.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (73, 2, 'demo-pages/comic-10/episode-73/p2.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (73, 3, 'demo-pages/comic-10/episode-73/p3.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (73, 4, 'demo-pages/comic-10/episode-73/p4.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (73, 5, 'demo-pages/comic-10/episode-73/p5.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (73, 6, 'demo-pages/comic-10/episode-73/p6.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (73, 7, 'demo-pages/comic-10/episode-73/p7.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (73, 8, 'demo-pages/comic-10/episode-73/p8.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (73, 9, 'demo-pages/comic-10/episode-73/p9.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (73, 10, 'demo-pages/comic-10/episode-73/p10.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (74, 1, 'demo-pages/comic-10/episode-74/p1.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (74, 2, 'demo-pages/comic-10/episode-74/p2.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (74, 3, 'demo-pages/comic-10/episode-74/p3.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (74, 4, 'demo-pages/comic-10/episode-74/p4.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (74, 5, 'demo-pages/comic-10/episode-74/p5.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (74, 6, 'demo-pages/comic-10/episode-74/p6.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (74, 7, 'demo-pages/comic-10/episode-74/p7.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (74, 8, 'demo-pages/comic-10/episode-74/p8.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (74, 9, 'demo-pages/comic-10/episode-74/p9.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (74, 10, 'demo-pages/comic-10/episode-74/p10.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (75, 1, 'demo-pages/comic-10/episode-75/p1.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (75, 2, 'demo-pages/comic-10/episode-75/p2.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (75, 3, 'demo-pages/comic-10/episode-75/p3.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (75, 4, 'demo-pages/comic-10/episode-75/p4.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (75, 5, 'demo-pages/comic-10/episode-75/p5.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (75, 6, 'demo-pages/comic-10/episode-75/p6.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (75, 7, 'demo-pages/comic-10/episode-75/p7.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (75, 8, 'demo-pages/comic-10/episode-75/p8.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (75, 9, 'demo-pages/comic-10/episode-75/p9.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (75, 10, 'demo-pages/comic-10/episode-75/p10.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (76, 1, 'demo-pages/comic-10/episode-76/p1.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (76, 2, 'demo-pages/comic-10/episode-76/p2.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (76, 3, 'demo-pages/comic-10/episode-76/p3.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (76, 4, 'demo-pages/comic-10/episode-76/p4.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (76, 5, 'demo-pages/comic-10/episode-76/p5.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (76, 6, 'demo-pages/comic-10/episode-76/p6.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (76, 7, 'demo-pages/comic-10/episode-76/p7.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (76, 8, 'demo-pages/comic-10/episode-76/p8.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (76, 9, 'demo-pages/comic-10/episode-76/p9.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (76, 10, 'demo-pages/comic-10/episode-76/p10.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (77, 1, 'demo-pages/comic-10/episode-77/p1.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (77, 2, 'demo-pages/comic-10/episode-77/p2.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (77, 3, 'demo-pages/comic-10/episode-77/p3.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (77, 4, 'demo-pages/comic-10/episode-77/p4.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (77, 5, 'demo-pages/comic-10/episode-77/p5.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (77, 6, 'demo-pages/comic-10/episode-77/p6.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (77, 7, 'demo-pages/comic-10/episode-77/p7.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (77, 8, 'demo-pages/comic-10/episode-77/p8.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (77, 9, 'demo-pages/comic-10/episode-77/p9.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (77, 10, 'demo-pages/comic-10/episode-77/p10.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (78, 1, 'demo-pages/comic-10/episode-78/p1.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (78, 2, 'demo-pages/comic-10/episode-78/p2.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (78, 3, 'demo-pages/comic-10/episode-78/p3.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (78, 4, 'demo-pages/comic-10/episode-78/p4.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (78, 5, 'demo-pages/comic-10/episode-78/p5.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (78, 6, 'demo-pages/comic-10/episode-78/p6.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (78, 7, 'demo-pages/comic-10/episode-78/p7.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (78, 8, 'demo-pages/comic-10/episode-78/p8.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (78, 9, 'demo-pages/comic-10/episode-78/p9.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (78, 10, 'demo-pages/comic-10/episode-78/p10.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (79, 1, 'demo-pages/comic-10/episode-79/p1.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (79, 2, 'demo-pages/comic-10/episode-79/p2.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (79, 3, 'demo-pages/comic-10/episode-79/p3.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (79, 4, 'demo-pages/comic-10/episode-79/p4.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (79, 5, 'demo-pages/comic-10/episode-79/p5.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (79, 6, 'demo-pages/comic-10/episode-79/p6.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (79, 7, 'demo-pages/comic-10/episode-79/p7.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (79, 8, 'demo-pages/comic-10/episode-79/p8.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (79, 9, 'demo-pages/comic-10/episode-79/p9.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (79, 10, 'demo-pages/comic-10/episode-79/p10.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (80, 1, 'demo-pages/comic-10/episode-80/p1.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (80, 2, 'demo-pages/comic-10/episode-80/p2.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (80, 3, 'demo-pages/comic-10/episode-80/p3.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (80, 4, 'demo-pages/comic-10/episode-80/p4.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (80, 5, 'demo-pages/comic-10/episode-80/p5.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (80, 6, 'demo-pages/comic-10/episode-80/p6.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (80, 7, 'demo-pages/comic-10/episode-80/p7.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (80, 8, 'demo-pages/comic-10/episode-80/p8.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (80, 9, 'demo-pages/comic-10/episode-80/p9.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (80, 10, 'demo-pages/comic-10/episode-80/p10.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (81, 1, 'demo-pages/comic-11/episode-81/p1.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (81, 2, 'demo-pages/comic-11/episode-81/p2.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (81, 3, 'demo-pages/comic-11/episode-81/p3.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (81, 4, 'demo-pages/comic-11/episode-81/p4.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (81, 5, 'demo-pages/comic-11/episode-81/p5.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (81, 6, 'demo-pages/comic-11/episode-81/p6.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (81, 7, 'demo-pages/comic-11/episode-81/p7.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (81, 8, 'demo-pages/comic-11/episode-81/p8.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (81, 9, 'demo-pages/comic-11/episode-81/p9.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (81, 10, 'demo-pages/comic-11/episode-81/p10.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (82, 1, 'demo-pages/comic-11/episode-82/p1.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (82, 2, 'demo-pages/comic-11/episode-82/p2.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (82, 3, 'demo-pages/comic-11/episode-82/p3.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (82, 4, 'demo-pages/comic-11/episode-82/p4.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (82, 5, 'demo-pages/comic-11/episode-82/p5.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (82, 6, 'demo-pages/comic-11/episode-82/p6.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (82, 7, 'demo-pages/comic-11/episode-82/p7.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (82, 8, 'demo-pages/comic-11/episode-82/p8.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (82, 9, 'demo-pages/comic-11/episode-82/p9.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (82, 10, 'demo-pages/comic-11/episode-82/p10.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (83, 1, 'demo-pages/comic-11/episode-83/p1.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (83, 2, 'demo-pages/comic-11/episode-83/p2.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (83, 3, 'demo-pages/comic-11/episode-83/p3.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (83, 4, 'demo-pages/comic-11/episode-83/p4.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (83, 5, 'demo-pages/comic-11/episode-83/p5.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (83, 6, 'demo-pages/comic-11/episode-83/p6.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (83, 7, 'demo-pages/comic-11/episode-83/p7.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (83, 8, 'demo-pages/comic-11/episode-83/p8.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (83, 9, 'demo-pages/comic-11/episode-83/p9.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (83, 10, 'demo-pages/comic-11/episode-83/p10.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (84, 1, 'demo-pages/comic-11/episode-84/p1.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (84, 2, 'demo-pages/comic-11/episode-84/p2.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (84, 3, 'demo-pages/comic-11/episode-84/p3.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (84, 4, 'demo-pages/comic-11/episode-84/p4.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (84, 5, 'demo-pages/comic-11/episode-84/p5.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (84, 6, 'demo-pages/comic-11/episode-84/p6.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (84, 7, 'demo-pages/comic-11/episode-84/p7.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (84, 8, 'demo-pages/comic-11/episode-84/p8.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (84, 9, 'demo-pages/comic-11/episode-84/p9.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (84, 10, 'demo-pages/comic-11/episode-84/p10.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (85, 1, 'demo-pages/comic-11/episode-85/p1.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (85, 2, 'demo-pages/comic-11/episode-85/p2.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (85, 3, 'demo-pages/comic-11/episode-85/p3.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (85, 4, 'demo-pages/comic-11/episode-85/p4.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (85, 5, 'demo-pages/comic-11/episode-85/p5.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (85, 6, 'demo-pages/comic-11/episode-85/p6.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (85, 7, 'demo-pages/comic-11/episode-85/p7.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (85, 8, 'demo-pages/comic-11/episode-85/p8.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (85, 9, 'demo-pages/comic-11/episode-85/p9.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (85, 10, 'demo-pages/comic-11/episode-85/p10.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (86, 1, 'demo-pages/comic-11/episode-86/p1.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (86, 2, 'demo-pages/comic-11/episode-86/p2.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (86, 3, 'demo-pages/comic-11/episode-86/p3.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (86, 4, 'demo-pages/comic-11/episode-86/p4.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (86, 5, 'demo-pages/comic-11/episode-86/p5.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (86, 6, 'demo-pages/comic-11/episode-86/p6.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (86, 7, 'demo-pages/comic-11/episode-86/p7.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (86, 8, 'demo-pages/comic-11/episode-86/p8.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (86, 9, 'demo-pages/comic-11/episode-86/p9.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (86, 10, 'demo-pages/comic-11/episode-86/p10.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (87, 1, 'demo-pages/comic-11/episode-87/p1.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (87, 2, 'demo-pages/comic-11/episode-87/p2.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (87, 3, 'demo-pages/comic-11/episode-87/p3.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (87, 4, 'demo-pages/comic-11/episode-87/p4.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (87, 5, 'demo-pages/comic-11/episode-87/p5.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (87, 6, 'demo-pages/comic-11/episode-87/p6.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (87, 7, 'demo-pages/comic-11/episode-87/p7.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (87, 8, 'demo-pages/comic-11/episode-87/p8.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (87, 9, 'demo-pages/comic-11/episode-87/p9.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (87, 10, 'demo-pages/comic-11/episode-87/p10.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (88, 1, 'demo-pages/comic-11/episode-88/p1.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (88, 2, 'demo-pages/comic-11/episode-88/p2.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (88, 3, 'demo-pages/comic-11/episode-88/p3.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (88, 4, 'demo-pages/comic-11/episode-88/p4.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (88, 5, 'demo-pages/comic-11/episode-88/p5.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (88, 6, 'demo-pages/comic-11/episode-88/p6.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (88, 7, 'demo-pages/comic-11/episode-88/p7.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (88, 8, 'demo-pages/comic-11/episode-88/p8.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (88, 9, 'demo-pages/comic-11/episode-88/p9.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (88, 10, 'demo-pages/comic-11/episode-88/p10.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (89, 1, 'demo-pages/comic-12/episode-89/p1.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (89, 2, 'demo-pages/comic-12/episode-89/p2.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (89, 3, 'demo-pages/comic-12/episode-89/p3.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (89, 4, 'demo-pages/comic-12/episode-89/p4.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (89, 5, 'demo-pages/comic-12/episode-89/p5.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (89, 6, 'demo-pages/comic-12/episode-89/p6.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (89, 7, 'demo-pages/comic-12/episode-89/p7.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (89, 8, 'demo-pages/comic-12/episode-89/p8.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (89, 9, 'demo-pages/comic-12/episode-89/p9.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (89, 10, 'demo-pages/comic-12/episode-89/p10.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (90, 1, 'demo-pages/comic-12/episode-90/p1.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (90, 2, 'demo-pages/comic-12/episode-90/p2.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (90, 3, 'demo-pages/comic-12/episode-90/p3.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (90, 4, 'demo-pages/comic-12/episode-90/p4.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (90, 5, 'demo-pages/comic-12/episode-90/p5.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (90, 6, 'demo-pages/comic-12/episode-90/p6.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (90, 7, 'demo-pages/comic-12/episode-90/p7.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (90, 8, 'demo-pages/comic-12/episode-90/p8.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (90, 9, 'demo-pages/comic-12/episode-90/p9.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (90, 10, 'demo-pages/comic-12/episode-90/p10.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (91, 1, 'demo-pages/comic-12/episode-91/p1.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (91, 2, 'demo-pages/comic-12/episode-91/p2.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (91, 3, 'demo-pages/comic-12/episode-91/p3.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (91, 4, 'demo-pages/comic-12/episode-91/p4.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (91, 5, 'demo-pages/comic-12/episode-91/p5.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (91, 6, 'demo-pages/comic-12/episode-91/p6.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (91, 7, 'demo-pages/comic-12/episode-91/p7.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (91, 8, 'demo-pages/comic-12/episode-91/p8.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (91, 9, 'demo-pages/comic-12/episode-91/p9.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (91, 10, 'demo-pages/comic-12/episode-91/p10.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (92, 1, 'demo-pages/comic-12/episode-92/p1.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (92, 2, 'demo-pages/comic-12/episode-92/p2.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (92, 3, 'demo-pages/comic-12/episode-92/p3.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (92, 4, 'demo-pages/comic-12/episode-92/p4.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (92, 5, 'demo-pages/comic-12/episode-92/p5.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (92, 6, 'demo-pages/comic-12/episode-92/p6.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (92, 7, 'demo-pages/comic-12/episode-92/p7.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (92, 8, 'demo-pages/comic-12/episode-92/p8.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (92, 9, 'demo-pages/comic-12/episode-92/p9.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (92, 10, 'demo-pages/comic-12/episode-92/p10.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (93, 1, 'demo-pages/comic-12/episode-93/p1.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (93, 2, 'demo-pages/comic-12/episode-93/p2.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (93, 3, 'demo-pages/comic-12/episode-93/p3.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (93, 4, 'demo-pages/comic-12/episode-93/p4.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (93, 5, 'demo-pages/comic-12/episode-93/p5.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (93, 6, 'demo-pages/comic-12/episode-93/p6.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (93, 7, 'demo-pages/comic-12/episode-93/p7.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (93, 8, 'demo-pages/comic-12/episode-93/p8.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (93, 9, 'demo-pages/comic-12/episode-93/p9.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (93, 10, 'demo-pages/comic-12/episode-93/p10.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (94, 1, 'demo-pages/comic-12/episode-94/p1.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (94, 2, 'demo-pages/comic-12/episode-94/p2.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (94, 3, 'demo-pages/comic-12/episode-94/p3.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (94, 4, 'demo-pages/comic-12/episode-94/p4.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (94, 5, 'demo-pages/comic-12/episode-94/p5.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (94, 6, 'demo-pages/comic-12/episode-94/p6.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (94, 7, 'demo-pages/comic-12/episode-94/p7.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (94, 8, 'demo-pages/comic-12/episode-94/p8.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (94, 9, 'demo-pages/comic-12/episode-94/p9.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (94, 10, 'demo-pages/comic-12/episode-94/p10.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (95, 1, 'demo-pages/comic-12/episode-95/p1.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (95, 2, 'demo-pages/comic-12/episode-95/p2.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (95, 3, 'demo-pages/comic-12/episode-95/p3.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (95, 4, 'demo-pages/comic-12/episode-95/p4.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (95, 5, 'demo-pages/comic-12/episode-95/p5.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (95, 6, 'demo-pages/comic-12/episode-95/p6.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (95, 7, 'demo-pages/comic-12/episode-95/p7.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (95, 8, 'demo-pages/comic-12/episode-95/p8.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (95, 9, 'demo-pages/comic-12/episode-95/p9.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (95, 10, 'demo-pages/comic-12/episode-95/p10.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (96, 1, 'demo-pages/comic-12/episode-96/p1.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (96, 2, 'demo-pages/comic-12/episode-96/p2.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (96, 3, 'demo-pages/comic-12/episode-96/p3.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (96, 4, 'demo-pages/comic-12/episode-96/p4.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (96, 5, 'demo-pages/comic-12/episode-96/p5.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (96, 6, 'demo-pages/comic-12/episode-96/p6.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (96, 7, 'demo-pages/comic-12/episode-96/p7.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (96, 8, 'demo-pages/comic-12/episode-96/p8.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (96, 9, 'demo-pages/comic-12/episode-96/p9.svg', NOW(), NOW());
INSERT IGNORE INTO episode_pages (episode_id, page_number, image_url, created_at, updated_at) VALUES (96, 10, 'demo-pages/comic-12/episode-96/p10.svg', NOW(), NOW());

-- -------------------------------------------------------------------
-- 10. Reset auto-increment counters
-- -------------------------------------------------------------------
ALTER TABLE users AUTO_INCREMENT = 10;
ALTER TABLE wallets AUTO_INCREMENT = 10;
ALTER TABLE comics AUTO_INCREMENT = 13;
ALTER TABLE episodes AUTO_INCREMENT = 97;
ALTER TABLE episode_pages AUTO_INCREMENT = 961;

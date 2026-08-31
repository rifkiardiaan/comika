-- =====================================================
-- FIX: Tambah kolom is_vvip dan vvip_until ke tabel users
-- Jalankan SQL ini di phpMyAdmin atau MySQL client
-- pada database production comika
-- =====================================================

-- Tambah kolom is_vvip setelah premium_until
ALTER TABLE `users` ADD COLUMN `is_vvip` TINYINT(1) NOT NULL DEFAULT 0 AFTER `premium_until`;

-- Tambah kolom vvip_until setelah is_vvip
ALTER TABLE `users` ADD COLUMN `vvip_until` TIMESTAMP NULL DEFAULT NULL AFTER `is_vvip`;

-- Update migrations table agar Laravel tahu migration ini sudah jalan
-- Ganti timestamp dengan timestamp dari file migration: 2026_08_26_000001
INSERT IGNORE INTO `migrations` (`migration`, `batch`) 
VALUES ('2026_08_26_000001_add_vvip_to_users_table', 
        (SELECT COALESCE(MAX(`batch`) + 1, 1) FROM `migrations`));

-- =====================================================
-- SELESAI! Sekarang halaman admin VVIP & Premium 
-- dan fitur berlangganan VVIP harusnya sudah berfungsi
-- =====================================================

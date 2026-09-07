-- ============================================================
-- COMIKA — Safe Deploy Migration
-- Jalankan di phpMyAdmin SEBELUM deploy code baru
-- Aman dijalankan berulang (idempotent)
-- ============================================================

-- Comics: tambah verification_status & rejection_reason (jika belum ada)
SET @exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'comics' AND COLUMN_NAME = 'verification_status');
SET @sql = IF(@exists = 0,
    'ALTER TABLE `comics` ADD COLUMN `verification_status` ENUM(\'pending\',\'approved\',\'rejected\') NOT NULL DEFAULT \'pending\' AFTER `age_rating`, ADD COLUMN `rejection_reason` TEXT DEFAULT NULL AFTER `verification_status`',
    'SELECT "verification_status column already exists" AS info');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Users: tambah kolom ban (jika belum ada)
SET @exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'is_banned');
SET @sql = IF(@exists = 0,
    'ALTER TABLE `users` ADD COLUMN `is_banned` TINYINT(1) NOT NULL DEFAULT \'0\' AFTER `is_vvip`, ADD COLUMN `is_permanently_banned` TINYINT(1) NOT NULL DEFAULT \'0\' AFTER `is_banned`, ADD COLUMN `ban_reason` TEXT DEFAULT NULL AFTER `is_permanently_banned`',
    'SELECT "ban columns already exist" AS info');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Set verification_status untuk komik yang sudah terbit
UPDATE `comics` SET `verification_status` = 'approved' WHERE `published_at` IS NOT NULL AND (`verification_status` = 'pending' OR `verification_status` IS NULL);
UPDATE `comics` SET `verification_status` = 'pending' WHERE `published_at` IS NULL AND `verification_status` != 'pending';

-- Fix: komik yang published tapi status masih 'pending' → set 'approved'
UPDATE `comics` SET `verification_status` = 'approved', `rejection_reason` = NULL WHERE `published_at` IS NOT NULL AND `verification_status` = 'pending';

-- ============================================================
-- Active Readers — tabel baru untuk live tracking
-- ============================================================
SET @exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'active_readers');
SET @sql = IF(@exists = 0,
    'CREATE TABLE `active_readers` (
        `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        `user_id` BIGINT UNSIGNED NOT NULL,
        `comic_id` BIGINT UNSIGNED NOT NULL,
        `episode_id` BIGINT UNSIGNED NOT NULL,
        `last_page` INT UNSIGNED NOT NULL DEFAULT 1,
        `progress` DECIMAL(5,2) NOT NULL DEFAULT 0,
        `last_heartbeat_at` TIMESTAMP NOT NULL,
        `created_at` TIMESTAMP NULL DEFAULT NULL,
        `updated_at` TIMESTAMP NULL DEFAULT NULL,
        PRIMARY KEY (`id`),
        UNIQUE KEY `active_readers_user_episode_unique` (`user_id`, `episode_id`),
        KEY `active_readers_last_heartbeat_at_index` (`last_heartbeat_at`),
        CONSTRAINT `active_readers_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
        CONSTRAINT `active_readers_comic_id_foreign` FOREIGN KEY (`comic_id`) REFERENCES `comics` (`id`) ON DELETE CASCADE,
        CONSTRAINT `active_readers_episode_id_foreign` FOREIGN KEY (`episode_id`) REFERENCES `episodes` (`id`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci',
    'SELECT "active_readers table already exists" AS info');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================================
-- Episodes: tambah status 'pending' (creator ajukan → menunggu review admin)
-- jika kolom belum mendukung 'pending'
-- ============================================================
SET @exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'episodes' AND COLUMN_NAME = 'status' AND COLUMN_TYPE LIKE '%pending%');
SET @sql = IF(@exists = 0,
    'ALTER TABLE `episodes` MODIFY COLUMN `status` ENUM(\'draft\',\'pending\',\'published\') NOT NULL DEFAULT \'draft\'',
    'SELECT "episodes.status already supports pending" AS info');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Episode lama berstatus draft tidak berubah; tidak ada data 'pending' sebelum fitur ini.

-- ============================================================
-- Comics: tambah status 'draft' pada verification_status
-- (komik baru dibuat draft & baru masuk antrian review setelah creator
--  menekan "Ajukan Review")
-- ============================================================
SET @exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'comics' AND COLUMN_NAME = 'verification_status' AND COLUMN_TYPE LIKE '%draft%');
SET @sql = IF(@exists = 0,
    'ALTER TABLE `comics` MODIFY COLUMN `verification_status` ENUM(\'draft\',\'pending\',\'approved\',\'rejected\') NOT NULL DEFAULT \'pending\'',
    'SELECT "comics.verification_status already supports draft" AS info');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Komik lama (sebelum fitur draft) tetap dipertahankan statusnya.

-- ============================================================
-- Episodes: tambah rejection_reason (alasan admin menolak episode)
-- ============================================================
SET @exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'episodes' AND COLUMN_NAME = 'rejection_reason');
SET @sql = IF(@exists = 0,
    'ALTER TABLE `episodes` ADD COLUMN `rejection_reason` VARCHAR(500) NULL DEFAULT NULL AFTER `published_at`',
    'SELECT "episodes.rejection_reason already exists" AS info');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================================
-- Riwayat Aktivitas (feature 13): tabel activity_logs
-- ============================================================
SET @exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'activity_logs');
SET @sql = IF(@exists = 0,
    'CREATE TABLE `activity_logs` (
        `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        `user_id` BIGINT UNSIGNED DEFAULT NULL,
        `action` VARCHAR(60) NOT NULL,
        `description` VARCHAR(500) DEFAULT NULL,
        `subject_type` VARCHAR(120) DEFAULT NULL,
        `subject_id` BIGINT UNSIGNED DEFAULT NULL,
        `metadata` JSON DEFAULT NULL,
        `ip_address` VARCHAR(45) DEFAULT NULL,
        `created_at` TIMESTAMP NULL DEFAULT NULL,
        `updated_at` TIMESTAMP NULL DEFAULT NULL,
        PRIMARY KEY (`id`),
        KEY `activity_logs_user_id_index` (`user_id`),
        KEY `activity_logs_action_index` (`action`),
        KEY `activity_logs_subject_type_subject_id_index` (`subject_type`, `subject_id`),
        KEY `activity_logs_created_at_index` (`created_at`),
        CONSTRAINT `activity_logs_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci',
    'SELECT "activity_logs table already exists" AS info');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================================
-- Comics: tambah status 'blocked' (Diblokir oleh admin)
-- Komik diblokir tidak tampil publik; creator tetap bisa login
-- tapi izin upload dimatikan lewat users.can_upload
-- ============================================================
SET @exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'comics' AND COLUMN_NAME = 'verification_status' AND COLUMN_TYPE LIKE '%blocked%');
SET @sql = IF(@exists = 0,
    'ALTER TABLE `comics` MODIFY COLUMN `verification_status` ENUM(\'draft\',\'pending\',\'approved\',\'rejected\',\'blocked\') NOT NULL DEFAULT \'pending\'',
    'SELECT "comics.verification_status already supports blocked" AS info');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Users: tambah kolom can_upload (izin creator upload komik)
SET @exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'can_upload');
SET @sql = IF(@exists = 0,
    'ALTER TABLE `users` ADD COLUMN `can_upload` TINYINT(1) NOT NULL DEFAULT \'1\' AFTER `role`',
    'SELECT "users.can_upload already exists" AS info');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Konversi data lama: komik yang diblokir admin (rejected + hiatus + unpublish
-- + alasan baku diblokir) dipindah ke verification_status = 'blocked'
UPDATE `comics`
SET `verification_status` = 'blocked'
WHERE `verification_status` = 'rejected'
  AND `status` = 'hiatus'
  AND `published_at` IS NULL
  AND `rejection_reason` = 'Komik diblokir oleh admin.';

-- ============================================================
-- Platform Settings — pengaturan pembagian pendapatan
-- (fitur: Pendapatan Admin & Creator + Pembagian Pendapatan)
-- ============================================================
SET @exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'platform_settings');
SET @sql = IF(@exists = 0,
    'CREATE TABLE `platform_settings` (
        `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        `key` VARCHAR(255) NOT NULL,
        `value` TEXT NULL,
        `created_at` TIMESTAMP NULL DEFAULT NULL,
        `updated_at` TIMESTAMP NULL DEFAULT NULL,
        PRIMARY KEY (`id`),
        UNIQUE KEY `platform_settings_key_unique` (`key`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci',
    'SELECT "platform_settings table already exists" AS info');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Nilai default pembagian pendapatan (hanya tersimpan saat belum ada)
INSERT IGNORE INTO `platform_settings` (`key`, `value`, `created_at`, `updated_at`) VALUES
    ('revenue.creator_share', '0.6', NOW(), NOW()),
    ('revenue.admin_share', '0.4', NOW(), NOW()),
    ('revenue.coin_value', '100', NOW(), NOW());

-- ============================================================
-- Selesai! Sekarang deploy code baru
-- ============================================================
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
-- Selesai! Sekarang deploy code baru
-- ============================================================

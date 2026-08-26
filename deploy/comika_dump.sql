-- MySQL dump 10.13  Distrib 8.0.30, for Win64 (x86_64)
--
-- Host: localhost    Database: comika
-- ------------------------------------------------------
-- Server version	8.0.30

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `achievements`
--

DROP TABLE IF EXISTS `achievements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `achievements` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `code` varchar(60) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `xp_reward` int unsigned NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `achievements_code_unique` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `achievements`
--

LOCK TABLES `achievements` WRITE;
/*!40000 ALTER TABLE `achievements` DISABLE KEYS */;
INSERT INTO `achievements` VALUES (1,'first_read','Pembaca Baru','Baca episode pertamamu.',20,'2026-08-23 23:11:04','2026-08-23 23:11:04'),(2,'read_10','Pembaca Aktif','Baca 10 episode berbeda.',50,'2026-08-23 23:11:04','2026-08-23 23:11:04'),(3,'read_50','Kutu Buku','Baca 50 episode berbeda.',150,'2026-08-23 23:11:04','2026-08-23 23:11:04'),(4,'finish_comic','Tamat','Selesaikan semua episode terbit dari sebuah komik.',100,'2026-08-23 23:11:04','2026-08-23 23:11:04'),(5,'first_comment','Ikut Bicara','Kirim komentarmu yang pertama.',15,'2026-08-23 23:11:04','2026-08-23 23:11:04'),(6,'comment_10','Pendapat Berharga','Kirim 10 komentar.',40,'2026-08-23 23:11:04','2026-08-23 23:11:04'),(7,'first_follow','Follower Sejati','Ikuti komik pertamamu.',15,'2026-08-23 23:11:04','2026-08-23 23:11:04'),(8,'first_like','Memberi Dukungan','Sukai komik pertamamu.',10,'2026-08-23 23:11:04','2026-08-23 23:11:04'),(9,'streak_3','Rutin 3 Hari','Baca 3 hari berturut-turut.',30,'2026-08-23 23:11:04','2026-08-23 23:11:04'),(10,'streak_7','Rutin Seminggu','Baca 7 hari berturut-turut.',100,'2026-08-23 23:11:04','2026-08-23 23:11:04'),(11,'level_5','Level 5','Capai level 5.',50,'2026-08-23 23:11:04','2026-08-23 23:11:04'),(12,'level_10','Level 10','Capai level 10.',150,'2026-08-23 23:11:04','2026-08-23 23:11:04');
/*!40000 ALTER TABLE `achievements` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bookmarks`
--

DROP TABLE IF EXISTS `bookmarks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bookmarks` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `comic_id` bigint unsigned NOT NULL,
  `episode_id` bigint unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `bookmarks_user_id_comic_id_unique` (`user_id`,`comic_id`),
  KEY `bookmarks_comic_id_foreign` (`comic_id`),
  KEY `bookmarks_episode_id_foreign` (`episode_id`),
  CONSTRAINT `bookmarks_comic_id_foreign` FOREIGN KEY (`comic_id`) REFERENCES `comics` (`id`) ON DELETE CASCADE,
  CONSTRAINT `bookmarks_episode_id_foreign` FOREIGN KEY (`episode_id`) REFERENCES `episodes` (`id`) ON DELETE SET NULL,
  CONSTRAINT `bookmarks_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bookmarks`
--

LOCK TABLES `bookmarks` WRITE;
/*!40000 ALTER TABLE `bookmarks` DISABLE KEYS */;
/*!40000 ALTER TABLE `bookmarks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `coin_packages`
--

DROP TABLE IF EXISTS `coin_packages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `coin_packages` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(60) COLLATE utf8mb4_unicode_ci NOT NULL,
  `coins` int unsigned NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `coin_packages`
--

LOCK TABLES `coin_packages` WRITE;
/*!40000 ALTER TABLE `coin_packages` DISABLE KEYS */;
INSERT INTO `coin_packages` VALUES (1,'Paket 100 Koin',100,15000.00,1,'2026-08-23 23:11:08','2026-08-23 23:11:08'),(2,'Paket 300 Koin',300,42000.00,1,'2026-08-23 23:11:08','2026-08-23 23:11:08'),(3,'Paket 700 Koin',700,90000.00,1,'2026-08-23 23:11:08','2026-08-23 23:11:08'),(4,'Paket 1500 Koin',1500,175000.00,1,'2026-08-23 23:11:09','2026-08-23 23:11:09');
/*!40000 ALTER TABLE `coin_packages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `comic_genres`
--

DROP TABLE IF EXISTS `comic_genres`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `comic_genres` (
  `comic_id` bigint unsigned NOT NULL,
  `genre_id` bigint unsigned NOT NULL,
  PRIMARY KEY (`comic_id`,`genre_id`),
  KEY `comic_genres_genre_id_foreign` (`genre_id`),
  CONSTRAINT `comic_genres_comic_id_foreign` FOREIGN KEY (`comic_id`) REFERENCES `comics` (`id`) ON DELETE CASCADE,
  CONSTRAINT `comic_genres_genre_id_foreign` FOREIGN KEY (`genre_id`) REFERENCES `genres` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comic_genres`
--

LOCK TABLES `comic_genres` WRITE;
/*!40000 ALTER TABLE `comic_genres` DISABLE KEYS */;
INSERT INTO `comic_genres` VALUES (1,1),(2,1),(6,1),(3,2),(7,2),(11,2),(1,3),(2,3),(6,3),(9,3),(10,3),(11,3),(3,4),(5,4),(7,4),(4,5),(10,5),(4,6),(8,6),(12,6),(5,7),(8,7),(1,8),(4,8),(7,8),(11,8),(6,9),(8,9),(9,9),(12,9),(2,10),(9,10);
/*!40000 ALTER TABLE `comic_genres` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `comics`
--

DROP TABLE IF EXISTS `comics`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `comics` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `creator_id` bigint unsigned NOT NULL,
  `title` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(140) COLLATE utf8mb4_unicode_ci NOT NULL,
  `synopsis` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `cover_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('ongoing','completed','hiatus') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ongoing',
  `age_rating` enum('semua_umur','remaja','dewasa') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'semua_umur',
  `rating_avg` decimal(3,2) NOT NULL DEFAULT '0.00',
  `rating_count` bigint unsigned NOT NULL DEFAULT '0',
  `like_count` bigint unsigned NOT NULL DEFAULT '0',
  `view_count` bigint unsigned NOT NULL DEFAULT '0',
  `published_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `comics_slug_unique` (`slug`),
  KEY `comics_creator_id_foreign` (`creator_id`),
  KEY `comics_status_rating_avg_index` (`status`,`rating_avg`),
  KEY `comics_view_count_index` (`view_count`),
  CONSTRAINT `comics_creator_id_foreign` FOREIGN KEY (`creator_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comics`
--

LOCK TABLES `comics` WRITE;
/*!40000 ALTER TABLE `comics` DISABLE KEYS */;
INSERT INTO `comics` VALUES (1,2,'Bulan di Ujung Jari','bulan-di-ujung-jari','Seorang pelukis jalanan menemukan kuas ajaib yang bisa menggambar pintu menuju dunia lain. Setiap malam purnama, dunia yang ia lukis menjadi nyata — dan mulai menginginkannya kembali.','comics/covers/comic-1.svg','ongoing','remaja',4.80,15067,45200,1284000,'2026-08-11 23:11:09',NULL,'2026-08-23 23:11:09','2026-08-23 23:11:09'),(2,3,'Naga Terakhir','naga-terakhir','Setelah 500 tahun bersembunyi, naga terakhir bangkit di era modern. Remaja bernama Bima terpilih menjadi penjaganya — padahal ia hanya ingin lulus SMA dengan tenang.','comics/covers/comic-2.svg','ongoing','remaja',4.60,11033,33100,982000,'2026-08-12 23:11:09',NULL,'2026-08-23 23:11:09','2026-08-23 23:11:09'),(3,4,'Cinta Tak Berbalas','cinta-tak-berbalas','Setiap hari Laras menulis surat cinta yang tak pernah ia kirim. Suatu hari, semua surat itu menemukan jalannya sendiri — dan sampai ke orang yang salah.','comics/covers/comic-3.svg','ongoing','remaja',4.50,9633,28900,756000,'2026-08-13 23:11:10',NULL,'2026-08-23 23:11:10','2026-08-23 23:11:10'),(4,2,'Kost Paranormal','kost-paranormal','Kost murah di pinggir kota ternyata dihuni penghuni lain: hantu-hantu baik hati yang butuh bantuan menyelesaikan urusan duniawi mereka. Komedi horor yang menghangatkan hati.','comics/covers/comic-4.svg','completed','remaja',4.40,7000,21000,642000,'2026-08-14 23:11:10',NULL,'2026-08-23 23:11:10','2026-08-23 23:11:10'),(5,3,'Rekan Buatan','rekan-buatan','Di tahun 2147, android generasi terbaru diberi satu misi: menjadi sahabat bagi anak-anak yang kesepian. Tapi apa jadinya jika android itu mulai bertanya tentang perasaannya sendiri?','comics/covers/comic-5.svg','ongoing','remaja',4.70,13267,39800,1105000,'2026-08-15 23:11:11',NULL,'2026-08-23 23:11:11','2026-08-23 23:11:11'),(6,4,'Pedang Senja','pedang-senja','Dunia di ambang kegelapan abadi. Satu-satunya harapan adalah pedang legendaris yang hanya bisa diangkat oleh mereka yang tak punya apa-apa untuk dilindungi.','comics/covers/comic-6.svg','hiatus','remaja',4.30,5800,17400,523000,'2026-08-16 23:11:11',NULL,'2026-08-23 23:11:11','2026-08-23 23:11:11'),(7,2,'Secangkir Kenangan','secangkir-kenangan','Kedai kopi kecil di sudut kota menyimpan rahasia: setiap cangkir yang disajikan bisa mengembalikan satu kenangan pelanggannya. Cerita slice-of-life tentang cinta, kehilangan, dan harapan.','comics/covers/comic-7.svg','completed','remaja',4.90,13733,41200,890000,'2026-08-17 23:11:12',NULL,'2026-08-23 23:11:12','2026-08-23 23:11:12'),(8,3,'Kasus Nol','kasus-nol','Detektif muda yang skeptis dipaksa bekerja sama dengan paranormal jenius untuk memecahkan \"kasus nol\" — pembunuhan yang terjadi sebelum korban lahir.','comics/covers/comic-8.svg','ongoing','remaja',4.60,7500,22500,668000,'2026-08-18 23:11:12',NULL,'2026-08-23 23:11:12','2026-08-23 23:11:12'),(9,4,'Menara Tanpa Puncak','menara-tanpa-puncak','Menara misterius muncul di tengah kota setiap 100 tahun. Seorang pendaki bernama Sakura masuk sendirian untuk menemukan jawaban di lantai teratas — yang tak pernah ada.','comics/covers/comic-9.svg','ongoing','remaja',4.70,8933,26800,745000,'2026-08-19 23:11:13',NULL,'2026-08-23 23:11:13','2026-08-23 23:11:13'),(10,2,'Si Rubah Juga','si-rubah-juga','Rubah berbulu sembilan yang bisa berubah wujud memutuskan menjadi YouTuber agar bisa membeli mahkota surgawi. Petualangan konyol dengan sentuhan mitologi.','comics/covers/comic-10.svg','ongoing','remaja',4.20,3967,11900,334000,'2026-08-20 23:11:14',NULL,'2026-08-23 23:11:14','2026-08-23 23:11:14'),(11,3,'Jatuh dari Bintang','jatuh-dari-bintang','Bintang jatuh yang menjelma gadis kecil menumpang hidup di rumah seorang penyendiri. Ia mencoba memahami dunia manusia — dan manusia belajar merindukan langit.','comics/covers/comic-11.svg','ongoing','remaja',4.50,6767,20300,587000,'2026-08-21 23:11:14',NULL,'2026-08-23 23:11:14','2026-08-23 23:11:14'),(12,4,'Tengkorak Tertawa','tengkorak-tertawa','Setiap orang yang menerima tengkorak ukiran misterius akan tertawa tanpa henti selama 24 jam. Seorang reporter mengejar asal usulnya — dan menemukan dirinya sebagai target berikutnya.','comics/covers/comic-12.svg','hiatus','remaja',4.10,3267,9800,289000,'2026-08-22 23:11:15',NULL,'2026-08-23 23:11:15','2026-08-23 23:11:15');
/*!40000 ALTER TABLE `comics` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `comments`
--

DROP TABLE IF EXISTS `comments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `comments` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `comic_id` bigint unsigned NOT NULL,
  `episode_id` bigint unsigned DEFAULT NULL,
  `parent_id` bigint unsigned DEFAULT NULL,
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `like_count` bigint unsigned NOT NULL DEFAULT '0',
  `status` enum('active','hidden','deleted') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `comments_user_id_foreign` (`user_id`),
  KEY `comments_parent_id_foreign` (`parent_id`),
  KEY `comments_comic_id_status_index` (`comic_id`,`status`),
  KEY `comments_episode_id_index` (`episode_id`),
  CONSTRAINT `comments_comic_id_foreign` FOREIGN KEY (`comic_id`) REFERENCES `comics` (`id`) ON DELETE CASCADE,
  CONSTRAINT `comments_episode_id_foreign` FOREIGN KEY (`episode_id`) REFERENCES `episodes` (`id`) ON DELETE SET NULL,
  CONSTRAINT `comments_parent_id_foreign` FOREIGN KEY (`parent_id`) REFERENCES `comments` (`id`) ON DELETE SET NULL,
  CONSTRAINT `comments_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comments`
--

LOCK TABLES `comments` WRITE;
/*!40000 ALTER TABLE `comments` DISABLE KEYS */;
/*!40000 ALTER TABLE `comments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `creator_applications`
--

DROP TABLE IF EXISTS `creator_applications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `creator_applications` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `bio` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `reason` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `experience` text COLLATE utf8mb4_unicode_ci,
  `portfolio_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('pending','approved','rejected') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `reviewed_by` bigint unsigned DEFAULT NULL,
  `review_note` text COLLATE utf8mb4_unicode_ci,
  `reviewed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `creator_applications_user_id_status_unique` (`user_id`,`status`),
  KEY `creator_applications_reviewed_by_foreign` (`reviewed_by`),
  KEY `creator_applications_status_index` (`status`),
  CONSTRAINT `creator_applications_reviewed_by_foreign` FOREIGN KEY (`reviewed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `creator_applications_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `creator_applications`
--

LOCK TABLES `creator_applications` WRITE;
/*!40000 ALTER TABLE `creator_applications` DISABLE KEYS */;
/*!40000 ALTER TABLE `creator_applications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `creator_earnings`
--

DROP TABLE IF EXISTS `creator_earnings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `creator_earnings` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `creator_id` bigint unsigned NOT NULL,
  `episode_id` bigint unsigned NOT NULL,
  `transaction_id` bigint unsigned DEFAULT NULL,
  `amount` decimal(12,2) NOT NULL,
  `status` enum('pending','paid') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `paid_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `creator_earnings_episode_id_foreign` (`episode_id`),
  KEY `creator_earnings_transaction_id_foreign` (`transaction_id`),
  KEY `creator_earnings_creator_id_status_index` (`creator_id`,`status`),
  CONSTRAINT `creator_earnings_creator_id_foreign` FOREIGN KEY (`creator_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `creator_earnings_episode_id_foreign` FOREIGN KEY (`episode_id`) REFERENCES `episodes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `creator_earnings_transaction_id_foreign` FOREIGN KEY (`transaction_id`) REFERENCES `transactions` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `creator_earnings`
--

LOCK TABLES `creator_earnings` WRITE;
/*!40000 ALTER TABLE `creator_earnings` DISABLE KEYS */;
/*!40000 ALTER TABLE `creator_earnings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `creator_profiles`
--

DROP TABLE IF EXISTS `creator_profiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `creator_profiles` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `display_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `bio` text COLLATE utf8mb4_unicode_ci,
  `banner_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_verified` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `creator_profiles_user_id_unique` (`user_id`),
  CONSTRAINT `creator_profiles_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `creator_profiles`
--

LOCK TABLES `creator_profiles` WRITE;
/*!40000 ALTER TABLE `creator_profiles` DISABLE KEYS */;
INSERT INTO `creator_profiles` VALUES (1,2,'Vandervort, Russel and Erdman','Facilis sit officiis rerum et quibusdam sunt enim qui et esse.',NULL,0,'2026-08-23 23:11:06','2026-08-23 23:11:06'),(2,3,'Heaney-Luettgen','Officia quia autem inventore quia quod autem qui pariatur ut.',NULL,0,'2026-08-23 23:11:06','2026-08-23 23:11:06'),(3,4,'Satterfield, Simonis and Zieme','At ullam suscipit possimus voluptas est provident consequuntur numquam fuga deserunt quia.',NULL,0,'2026-08-23 23:11:06','2026-08-23 23:11:06');
/*!40000 ALTER TABLE `creator_profiles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `episode_pages`
--

DROP TABLE IF EXISTS `episode_pages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `episode_pages` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `episode_id` bigint unsigned NOT NULL,
  `page_number` int unsigned NOT NULL,
  `image_url` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `episode_pages_episode_id_page_number_unique` (`episode_id`,`page_number`),
  CONSTRAINT `episode_pages_episode_id_foreign` FOREIGN KEY (`episode_id`) REFERENCES `episodes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=961 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `episode_pages`
--

LOCK TABLES `episode_pages` WRITE;
/*!40000 ALTER TABLE `episode_pages` DISABLE KEYS */;
INSERT INTO `episode_pages` VALUES (1,1,1,'demo-pages/comic-1/episode-1/p1.svg','2026-08-23 23:11:09','2026-08-23 23:11:09'),(2,1,2,'demo-pages/comic-1/episode-1/p2.svg','2026-08-23 23:11:09','2026-08-23 23:11:09'),(3,1,3,'demo-pages/comic-1/episode-1/p3.svg','2026-08-23 23:11:09','2026-08-23 23:11:09'),(4,1,4,'demo-pages/comic-1/episode-1/p4.svg','2026-08-23 23:11:09','2026-08-23 23:11:09'),(5,1,5,'demo-pages/comic-1/episode-1/p5.svg','2026-08-23 23:11:09','2026-08-23 23:11:09'),(6,1,6,'demo-pages/comic-1/episode-1/p6.svg','2026-08-23 23:11:09','2026-08-23 23:11:09'),(7,1,7,'demo-pages/comic-1/episode-1/p7.svg','2026-08-23 23:11:09','2026-08-23 23:11:09'),(8,1,8,'demo-pages/comic-1/episode-1/p8.svg','2026-08-23 23:11:09','2026-08-23 23:11:09'),(9,1,9,'demo-pages/comic-1/episode-1/p9.svg','2026-08-23 23:11:09','2026-08-23 23:11:09'),(10,1,10,'demo-pages/comic-1/episode-1/p10.svg','2026-08-23 23:11:09','2026-08-23 23:11:09'),(11,2,1,'demo-pages/comic-1/episode-2/p1.svg','2026-08-23 23:11:09','2026-08-23 23:11:09'),(12,2,2,'demo-pages/comic-1/episode-2/p2.svg','2026-08-23 23:11:09','2026-08-23 23:11:09'),(13,2,3,'demo-pages/comic-1/episode-2/p3.svg','2026-08-23 23:11:09','2026-08-23 23:11:09'),(14,2,4,'demo-pages/comic-1/episode-2/p4.svg','2026-08-23 23:11:09','2026-08-23 23:11:09'),(15,2,5,'demo-pages/comic-1/episode-2/p5.svg','2026-08-23 23:11:09','2026-08-23 23:11:09'),(16,2,6,'demo-pages/comic-1/episode-2/p6.svg','2026-08-23 23:11:09','2026-08-23 23:11:09'),(17,2,7,'demo-pages/comic-1/episode-2/p7.svg','2026-08-23 23:11:09','2026-08-23 23:11:09'),(18,2,8,'demo-pages/comic-1/episode-2/p8.svg','2026-08-23 23:11:09','2026-08-23 23:11:09'),(19,2,9,'demo-pages/comic-1/episode-2/p9.svg','2026-08-23 23:11:09','2026-08-23 23:11:09'),(20,2,10,'demo-pages/comic-1/episode-2/p10.svg','2026-08-23 23:11:09','2026-08-23 23:11:09'),(21,3,1,'demo-pages/comic-1/episode-3/p1.svg','2026-08-23 23:11:09','2026-08-23 23:11:09'),(22,3,2,'demo-pages/comic-1/episode-3/p2.svg','2026-08-23 23:11:09','2026-08-23 23:11:09'),(23,3,3,'demo-pages/comic-1/episode-3/p3.svg','2026-08-23 23:11:09','2026-08-23 23:11:09'),(24,3,4,'demo-pages/comic-1/episode-3/p4.svg','2026-08-23 23:11:09','2026-08-23 23:11:09'),(25,3,5,'demo-pages/comic-1/episode-3/p5.svg','2026-08-23 23:11:09','2026-08-23 23:11:09'),(26,3,6,'demo-pages/comic-1/episode-3/p6.svg','2026-08-23 23:11:09','2026-08-23 23:11:09'),(27,3,7,'demo-pages/comic-1/episode-3/p7.svg','2026-08-23 23:11:09','2026-08-23 23:11:09'),(28,3,8,'demo-pages/comic-1/episode-3/p8.svg','2026-08-23 23:11:09','2026-08-23 23:11:09'),(29,3,9,'demo-pages/comic-1/episode-3/p9.svg','2026-08-23 23:11:09','2026-08-23 23:11:09'),(30,3,10,'demo-pages/comic-1/episode-3/p10.svg','2026-08-23 23:11:09','2026-08-23 23:11:09'),(31,4,1,'demo-pages/comic-1/episode-4/p1.svg','2026-08-23 23:11:09','2026-08-23 23:11:09'),(32,4,2,'demo-pages/comic-1/episode-4/p2.svg','2026-08-23 23:11:09','2026-08-23 23:11:09'),(33,4,3,'demo-pages/comic-1/episode-4/p3.svg','2026-08-23 23:11:09','2026-08-23 23:11:09'),(34,4,4,'demo-pages/comic-1/episode-4/p4.svg','2026-08-23 23:11:09','2026-08-23 23:11:09'),(35,4,5,'demo-pages/comic-1/episode-4/p5.svg','2026-08-23 23:11:09','2026-08-23 23:11:09'),(36,4,6,'demo-pages/comic-1/episode-4/p6.svg','2026-08-23 23:11:09','2026-08-23 23:11:09'),(37,4,7,'demo-pages/comic-1/episode-4/p7.svg','2026-08-23 23:11:09','2026-08-23 23:11:09'),(38,4,8,'demo-pages/comic-1/episode-4/p8.svg','2026-08-23 23:11:09','2026-08-23 23:11:09'),(39,4,9,'demo-pages/comic-1/episode-4/p9.svg','2026-08-23 23:11:09','2026-08-23 23:11:09'),(40,4,10,'demo-pages/comic-1/episode-4/p10.svg','2026-08-23 23:11:09','2026-08-23 23:11:09'),(41,5,1,'demo-pages/comic-1/episode-5/p1.svg','2026-08-23 23:11:09','2026-08-23 23:11:09'),(42,5,2,'demo-pages/comic-1/episode-5/p2.svg','2026-08-23 23:11:09','2026-08-23 23:11:09'),(43,5,3,'demo-pages/comic-1/episode-5/p3.svg','2026-08-23 23:11:09','2026-08-23 23:11:09'),(44,5,4,'demo-pages/comic-1/episode-5/p4.svg','2026-08-23 23:11:09','2026-08-23 23:11:09'),(45,5,5,'demo-pages/comic-1/episode-5/p5.svg','2026-08-23 23:11:09','2026-08-23 23:11:09'),(46,5,6,'demo-pages/comic-1/episode-5/p6.svg','2026-08-23 23:11:09','2026-08-23 23:11:09'),(47,5,7,'demo-pages/comic-1/episode-5/p7.svg','2026-08-23 23:11:09','2026-08-23 23:11:09'),(48,5,8,'demo-pages/comic-1/episode-5/p8.svg','2026-08-23 23:11:09','2026-08-23 23:11:09'),(49,5,9,'demo-pages/comic-1/episode-5/p9.svg','2026-08-23 23:11:09','2026-08-23 23:11:09'),(50,5,10,'demo-pages/comic-1/episode-5/p10.svg','2026-08-23 23:11:09','2026-08-23 23:11:09'),(51,6,1,'demo-pages/comic-1/episode-6/p1.svg','2026-08-23 23:11:09','2026-08-23 23:11:09'),(52,6,2,'demo-pages/comic-1/episode-6/p2.svg','2026-08-23 23:11:09','2026-08-23 23:11:09'),(53,6,3,'demo-pages/comic-1/episode-6/p3.svg','2026-08-23 23:11:09','2026-08-23 23:11:09'),(54,6,4,'demo-pages/comic-1/episode-6/p4.svg','2026-08-23 23:11:09','2026-08-23 23:11:09'),(55,6,5,'demo-pages/comic-1/episode-6/p5.svg','2026-08-23 23:11:09','2026-08-23 23:11:09'),(56,6,6,'demo-pages/comic-1/episode-6/p6.svg','2026-08-23 23:11:09','2026-08-23 23:11:09'),(57,6,7,'demo-pages/comic-1/episode-6/p7.svg','2026-08-23 23:11:09','2026-08-23 23:11:09'),(58,6,8,'demo-pages/comic-1/episode-6/p8.svg','2026-08-23 23:11:09','2026-08-23 23:11:09'),(59,6,9,'demo-pages/comic-1/episode-6/p9.svg','2026-08-23 23:11:09','2026-08-23 23:11:09'),(60,6,10,'demo-pages/comic-1/episode-6/p10.svg','2026-08-23 23:11:09','2026-08-23 23:11:09'),(61,7,1,'demo-pages/comic-1/episode-7/p1.svg','2026-08-23 23:11:09','2026-08-23 23:11:09'),(62,7,2,'demo-pages/comic-1/episode-7/p2.svg','2026-08-23 23:11:09','2026-08-23 23:11:09'),(63,7,3,'demo-pages/comic-1/episode-7/p3.svg','2026-08-23 23:11:09','2026-08-23 23:11:09'),(64,7,4,'demo-pages/comic-1/episode-7/p4.svg','2026-08-23 23:11:09','2026-08-23 23:11:09'),(65,7,5,'demo-pages/comic-1/episode-7/p5.svg','2026-08-23 23:11:09','2026-08-23 23:11:09'),(66,7,6,'demo-pages/comic-1/episode-7/p6.svg','2026-08-23 23:11:09','2026-08-23 23:11:09'),(67,7,7,'demo-pages/comic-1/episode-7/p7.svg','2026-08-23 23:11:09','2026-08-23 23:11:09'),(68,7,8,'demo-pages/comic-1/episode-7/p8.svg','2026-08-23 23:11:09','2026-08-23 23:11:09'),(69,7,9,'demo-pages/comic-1/episode-7/p9.svg','2026-08-23 23:11:09','2026-08-23 23:11:09'),(70,7,10,'demo-pages/comic-1/episode-7/p10.svg','2026-08-23 23:11:09','2026-08-23 23:11:09'),(71,8,1,'demo-pages/comic-1/episode-8/p1.svg','2026-08-23 23:11:09','2026-08-23 23:11:09'),(72,8,2,'demo-pages/comic-1/episode-8/p2.svg','2026-08-23 23:11:09','2026-08-23 23:11:09'),(73,8,3,'demo-pages/comic-1/episode-8/p3.svg','2026-08-23 23:11:09','2026-08-23 23:11:09'),(74,8,4,'demo-pages/comic-1/episode-8/p4.svg','2026-08-23 23:11:09','2026-08-23 23:11:09'),(75,8,5,'demo-pages/comic-1/episode-8/p5.svg','2026-08-23 23:11:09','2026-08-23 23:11:09'),(76,8,6,'demo-pages/comic-1/episode-8/p6.svg','2026-08-23 23:11:09','2026-08-23 23:11:09'),(77,8,7,'demo-pages/comic-1/episode-8/p7.svg','2026-08-23 23:11:09','2026-08-23 23:11:09'),(78,8,8,'demo-pages/comic-1/episode-8/p8.svg','2026-08-23 23:11:09','2026-08-23 23:11:09'),(79,8,9,'demo-pages/comic-1/episode-8/p9.svg','2026-08-23 23:11:09','2026-08-23 23:11:09'),(80,8,10,'demo-pages/comic-1/episode-8/p10.svg','2026-08-23 23:11:09','2026-08-23 23:11:09'),(81,9,1,'demo-pages/comic-2/episode-9/p1.svg','2026-08-23 23:11:09','2026-08-23 23:11:09'),(82,9,2,'demo-pages/comic-2/episode-9/p2.svg','2026-08-23 23:11:09','2026-08-23 23:11:09'),(83,9,3,'demo-pages/comic-2/episode-9/p3.svg','2026-08-23 23:11:09','2026-08-23 23:11:09'),(84,9,4,'demo-pages/comic-2/episode-9/p4.svg','2026-08-23 23:11:09','2026-08-23 23:11:09'),(85,9,5,'demo-pages/comic-2/episode-9/p5.svg','2026-08-23 23:11:09','2026-08-23 23:11:09'),(86,9,6,'demo-pages/comic-2/episode-9/p6.svg','2026-08-23 23:11:09','2026-08-23 23:11:09'),(87,9,7,'demo-pages/comic-2/episode-9/p7.svg','2026-08-23 23:11:09','2026-08-23 23:11:09'),(88,9,8,'demo-pages/comic-2/episode-9/p8.svg','2026-08-23 23:11:09','2026-08-23 23:11:09'),(89,9,9,'demo-pages/comic-2/episode-9/p9.svg','2026-08-23 23:11:09','2026-08-23 23:11:09'),(90,9,10,'demo-pages/comic-2/episode-9/p10.svg','2026-08-23 23:11:09','2026-08-23 23:11:09'),(91,10,1,'demo-pages/comic-2/episode-10/p1.svg','2026-08-23 23:11:09','2026-08-23 23:11:09'),(92,10,2,'demo-pages/comic-2/episode-10/p2.svg','2026-08-23 23:11:09','2026-08-23 23:11:09'),(93,10,3,'demo-pages/comic-2/episode-10/p3.svg','2026-08-23 23:11:09','2026-08-23 23:11:09'),(94,10,4,'demo-pages/comic-2/episode-10/p4.svg','2026-08-23 23:11:09','2026-08-23 23:11:09'),(95,10,5,'demo-pages/comic-2/episode-10/p5.svg','2026-08-23 23:11:09','2026-08-23 23:11:09'),(96,10,6,'demo-pages/comic-2/episode-10/p6.svg','2026-08-23 23:11:09','2026-08-23 23:11:09'),(97,10,7,'demo-pages/comic-2/episode-10/p7.svg','2026-08-23 23:11:09','2026-08-23 23:11:09'),(98,10,8,'demo-pages/comic-2/episode-10/p8.svg','2026-08-23 23:11:09','2026-08-23 23:11:09'),(99,10,9,'demo-pages/comic-2/episode-10/p9.svg','2026-08-23 23:11:09','2026-08-23 23:11:09'),(100,10,10,'demo-pages/comic-2/episode-10/p10.svg','2026-08-23 23:11:09','2026-08-23 23:11:09'),(101,11,1,'demo-pages/comic-2/episode-11/p1.svg','2026-08-23 23:11:09','2026-08-23 23:11:09'),(102,11,2,'demo-pages/comic-2/episode-11/p2.svg','2026-08-23 23:11:09','2026-08-23 23:11:09'),(103,11,3,'demo-pages/comic-2/episode-11/p3.svg','2026-08-23 23:11:09','2026-08-23 23:11:09'),(104,11,4,'demo-pages/comic-2/episode-11/p4.svg','2026-08-23 23:11:09','2026-08-23 23:11:09'),(105,11,5,'demo-pages/comic-2/episode-11/p5.svg','2026-08-23 23:11:09','2026-08-23 23:11:09'),(106,11,6,'demo-pages/comic-2/episode-11/p6.svg','2026-08-23 23:11:09','2026-08-23 23:11:09'),(107,11,7,'demo-pages/comic-2/episode-11/p7.svg','2026-08-23 23:11:09','2026-08-23 23:11:09'),(108,11,8,'demo-pages/comic-2/episode-11/p8.svg','2026-08-23 23:11:09','2026-08-23 23:11:09'),(109,11,9,'demo-pages/comic-2/episode-11/p9.svg','2026-08-23 23:11:09','2026-08-23 23:11:09'),(110,11,10,'demo-pages/comic-2/episode-11/p10.svg','2026-08-23 23:11:09','2026-08-23 23:11:09'),(111,12,1,'demo-pages/comic-2/episode-12/p1.svg','2026-08-23 23:11:09','2026-08-23 23:11:09'),(112,12,2,'demo-pages/comic-2/episode-12/p2.svg','2026-08-23 23:11:09','2026-08-23 23:11:09'),(113,12,3,'demo-pages/comic-2/episode-12/p3.svg','2026-08-23 23:11:09','2026-08-23 23:11:09'),(114,12,4,'demo-pages/comic-2/episode-12/p4.svg','2026-08-23 23:11:09','2026-08-23 23:11:09'),(115,12,5,'demo-pages/comic-2/episode-12/p5.svg','2026-08-23 23:11:09','2026-08-23 23:11:09'),(116,12,6,'demo-pages/comic-2/episode-12/p6.svg','2026-08-23 23:11:09','2026-08-23 23:11:09'),(117,12,7,'demo-pages/comic-2/episode-12/p7.svg','2026-08-23 23:11:09','2026-08-23 23:11:09'),(118,12,8,'demo-pages/comic-2/episode-12/p8.svg','2026-08-23 23:11:09','2026-08-23 23:11:09'),(119,12,9,'demo-pages/comic-2/episode-12/p9.svg','2026-08-23 23:11:09','2026-08-23 23:11:09'),(120,12,10,'demo-pages/comic-2/episode-12/p10.svg','2026-08-23 23:11:09','2026-08-23 23:11:09'),(121,13,1,'demo-pages/comic-2/episode-13/p1.svg','2026-08-23 23:11:09','2026-08-23 23:11:09'),(122,13,2,'demo-pages/comic-2/episode-13/p2.svg','2026-08-23 23:11:09','2026-08-23 23:11:09'),(123,13,3,'demo-pages/comic-2/episode-13/p3.svg','2026-08-23 23:11:09','2026-08-23 23:11:09'),(124,13,4,'demo-pages/comic-2/episode-13/p4.svg','2026-08-23 23:11:09','2026-08-23 23:11:09'),(125,13,5,'demo-pages/comic-2/episode-13/p5.svg','2026-08-23 23:11:09','2026-08-23 23:11:09'),(126,13,6,'demo-pages/comic-2/episode-13/p6.svg','2026-08-23 23:11:09','2026-08-23 23:11:09'),(127,13,7,'demo-pages/comic-2/episode-13/p7.svg','2026-08-23 23:11:09','2026-08-23 23:11:09'),(128,13,8,'demo-pages/comic-2/episode-13/p8.svg','2026-08-23 23:11:09','2026-08-23 23:11:09'),(129,13,9,'demo-pages/comic-2/episode-13/p9.svg','2026-08-23 23:11:09','2026-08-23 23:11:09'),(130,13,10,'demo-pages/comic-2/episode-13/p10.svg','2026-08-23 23:11:09','2026-08-23 23:11:09'),(131,14,1,'demo-pages/comic-2/episode-14/p1.svg','2026-08-23 23:11:09','2026-08-23 23:11:09'),(132,14,2,'demo-pages/comic-2/episode-14/p2.svg','2026-08-23 23:11:09','2026-08-23 23:11:09'),(133,14,3,'demo-pages/comic-2/episode-14/p3.svg','2026-08-23 23:11:09','2026-08-23 23:11:09'),(134,14,4,'demo-pages/comic-2/episode-14/p4.svg','2026-08-23 23:11:09','2026-08-23 23:11:09'),(135,14,5,'demo-pages/comic-2/episode-14/p5.svg','2026-08-23 23:11:09','2026-08-23 23:11:09'),(136,14,6,'demo-pages/comic-2/episode-14/p6.svg','2026-08-23 23:11:09','2026-08-23 23:11:09'),(137,14,7,'demo-pages/comic-2/episode-14/p7.svg','2026-08-23 23:11:10','2026-08-23 23:11:10'),(138,14,8,'demo-pages/comic-2/episode-14/p8.svg','2026-08-23 23:11:10','2026-08-23 23:11:10'),(139,14,9,'demo-pages/comic-2/episode-14/p9.svg','2026-08-23 23:11:10','2026-08-23 23:11:10'),(140,14,10,'demo-pages/comic-2/episode-14/p10.svg','2026-08-23 23:11:10','2026-08-23 23:11:10'),(141,15,1,'demo-pages/comic-2/episode-15/p1.svg','2026-08-23 23:11:10','2026-08-23 23:11:10'),(142,15,2,'demo-pages/comic-2/episode-15/p2.svg','2026-08-23 23:11:10','2026-08-23 23:11:10'),(143,15,3,'demo-pages/comic-2/episode-15/p3.svg','2026-08-23 23:11:10','2026-08-23 23:11:10'),(144,15,4,'demo-pages/comic-2/episode-15/p4.svg','2026-08-23 23:11:10','2026-08-23 23:11:10'),(145,15,5,'demo-pages/comic-2/episode-15/p5.svg','2026-08-23 23:11:10','2026-08-23 23:11:10'),(146,15,6,'demo-pages/comic-2/episode-15/p6.svg','2026-08-23 23:11:10','2026-08-23 23:11:10'),(147,15,7,'demo-pages/comic-2/episode-15/p7.svg','2026-08-23 23:11:10','2026-08-23 23:11:10'),(148,15,8,'demo-pages/comic-2/episode-15/p8.svg','2026-08-23 23:11:10','2026-08-23 23:11:10'),(149,15,9,'demo-pages/comic-2/episode-15/p9.svg','2026-08-23 23:11:10','2026-08-23 23:11:10'),(150,15,10,'demo-pages/comic-2/episode-15/p10.svg','2026-08-23 23:11:10','2026-08-23 23:11:10'),(151,16,1,'demo-pages/comic-2/episode-16/p1.svg','2026-08-23 23:11:10','2026-08-23 23:11:10'),(152,16,2,'demo-pages/comic-2/episode-16/p2.svg','2026-08-23 23:11:10','2026-08-23 23:11:10'),(153,16,3,'demo-pages/comic-2/episode-16/p3.svg','2026-08-23 23:11:10','2026-08-23 23:11:10'),(154,16,4,'demo-pages/comic-2/episode-16/p4.svg','2026-08-23 23:11:10','2026-08-23 23:11:10'),(155,16,5,'demo-pages/comic-2/episode-16/p5.svg','2026-08-23 23:11:10','2026-08-23 23:11:10'),(156,16,6,'demo-pages/comic-2/episode-16/p6.svg','2026-08-23 23:11:10','2026-08-23 23:11:10'),(157,16,7,'demo-pages/comic-2/episode-16/p7.svg','2026-08-23 23:11:10','2026-08-23 23:11:10'),(158,16,8,'demo-pages/comic-2/episode-16/p8.svg','2026-08-23 23:11:10','2026-08-23 23:11:10'),(159,16,9,'demo-pages/comic-2/episode-16/p9.svg','2026-08-23 23:11:10','2026-08-23 23:11:10'),(160,16,10,'demo-pages/comic-2/episode-16/p10.svg','2026-08-23 23:11:10','2026-08-23 23:11:10'),(161,17,1,'demo-pages/comic-3/episode-17/p1.svg','2026-08-23 23:11:10','2026-08-23 23:11:10'),(162,17,2,'demo-pages/comic-3/episode-17/p2.svg','2026-08-23 23:11:10','2026-08-23 23:11:10'),(163,17,3,'demo-pages/comic-3/episode-17/p3.svg','2026-08-23 23:11:10','2026-08-23 23:11:10'),(164,17,4,'demo-pages/comic-3/episode-17/p4.svg','2026-08-23 23:11:10','2026-08-23 23:11:10'),(165,17,5,'demo-pages/comic-3/episode-17/p5.svg','2026-08-23 23:11:10','2026-08-23 23:11:10'),(166,17,6,'demo-pages/comic-3/episode-17/p6.svg','2026-08-23 23:11:10','2026-08-23 23:11:10'),(167,17,7,'demo-pages/comic-3/episode-17/p7.svg','2026-08-23 23:11:10','2026-08-23 23:11:10'),(168,17,8,'demo-pages/comic-3/episode-17/p8.svg','2026-08-23 23:11:10','2026-08-23 23:11:10'),(169,17,9,'demo-pages/comic-3/episode-17/p9.svg','2026-08-23 23:11:10','2026-08-23 23:11:10'),(170,17,10,'demo-pages/comic-3/episode-17/p10.svg','2026-08-23 23:11:10','2026-08-23 23:11:10'),(171,18,1,'demo-pages/comic-3/episode-18/p1.svg','2026-08-23 23:11:10','2026-08-23 23:11:10'),(172,18,2,'demo-pages/comic-3/episode-18/p2.svg','2026-08-23 23:11:10','2026-08-23 23:11:10'),(173,18,3,'demo-pages/comic-3/episode-18/p3.svg','2026-08-23 23:11:10','2026-08-23 23:11:10'),(174,18,4,'demo-pages/comic-3/episode-18/p4.svg','2026-08-23 23:11:10','2026-08-23 23:11:10'),(175,18,5,'demo-pages/comic-3/episode-18/p5.svg','2026-08-23 23:11:10','2026-08-23 23:11:10'),(176,18,6,'demo-pages/comic-3/episode-18/p6.svg','2026-08-23 23:11:10','2026-08-23 23:11:10'),(177,18,7,'demo-pages/comic-3/episode-18/p7.svg','2026-08-23 23:11:10','2026-08-23 23:11:10'),(178,18,8,'demo-pages/comic-3/episode-18/p8.svg','2026-08-23 23:11:10','2026-08-23 23:11:10'),(179,18,9,'demo-pages/comic-3/episode-18/p9.svg','2026-08-23 23:11:10','2026-08-23 23:11:10'),(180,18,10,'demo-pages/comic-3/episode-18/p10.svg','2026-08-23 23:11:10','2026-08-23 23:11:10'),(181,19,1,'demo-pages/comic-3/episode-19/p1.svg','2026-08-23 23:11:10','2026-08-23 23:11:10'),(182,19,2,'demo-pages/comic-3/episode-19/p2.svg','2026-08-23 23:11:10','2026-08-23 23:11:10'),(183,19,3,'demo-pages/comic-3/episode-19/p3.svg','2026-08-23 23:11:10','2026-08-23 23:11:10'),(184,19,4,'demo-pages/comic-3/episode-19/p4.svg','2026-08-23 23:11:10','2026-08-23 23:11:10'),(185,19,5,'demo-pages/comic-3/episode-19/p5.svg','2026-08-23 23:11:10','2026-08-23 23:11:10'),(186,19,6,'demo-pages/comic-3/episode-19/p6.svg','2026-08-23 23:11:10','2026-08-23 23:11:10'),(187,19,7,'demo-pages/comic-3/episode-19/p7.svg','2026-08-23 23:11:10','2026-08-23 23:11:10'),(188,19,8,'demo-pages/comic-3/episode-19/p8.svg','2026-08-23 23:11:10','2026-08-23 23:11:10'),(189,19,9,'demo-pages/comic-3/episode-19/p9.svg','2026-08-23 23:11:10','2026-08-23 23:11:10'),(190,19,10,'demo-pages/comic-3/episode-19/p10.svg','2026-08-23 23:11:10','2026-08-23 23:11:10'),(191,20,1,'demo-pages/comic-3/episode-20/p1.svg','2026-08-23 23:11:10','2026-08-23 23:11:10'),(192,20,2,'demo-pages/comic-3/episode-20/p2.svg','2026-08-23 23:11:10','2026-08-23 23:11:10'),(193,20,3,'demo-pages/comic-3/episode-20/p3.svg','2026-08-23 23:11:10','2026-08-23 23:11:10'),(194,20,4,'demo-pages/comic-3/episode-20/p4.svg','2026-08-23 23:11:10','2026-08-23 23:11:10'),(195,20,5,'demo-pages/comic-3/episode-20/p5.svg','2026-08-23 23:11:10','2026-08-23 23:11:10'),(196,20,6,'demo-pages/comic-3/episode-20/p6.svg','2026-08-23 23:11:10','2026-08-23 23:11:10'),(197,20,7,'demo-pages/comic-3/episode-20/p7.svg','2026-08-23 23:11:10','2026-08-23 23:11:10'),(198,20,8,'demo-pages/comic-3/episode-20/p8.svg','2026-08-23 23:11:10','2026-08-23 23:11:10'),(199,20,9,'demo-pages/comic-3/episode-20/p9.svg','2026-08-23 23:11:10','2026-08-23 23:11:10'),(200,20,10,'demo-pages/comic-3/episode-20/p10.svg','2026-08-23 23:11:10','2026-08-23 23:11:10'),(201,21,1,'demo-pages/comic-3/episode-21/p1.svg','2026-08-23 23:11:10','2026-08-23 23:11:10'),(202,21,2,'demo-pages/comic-3/episode-21/p2.svg','2026-08-23 23:11:10','2026-08-23 23:11:10'),(203,21,3,'demo-pages/comic-3/episode-21/p3.svg','2026-08-23 23:11:10','2026-08-23 23:11:10'),(204,21,4,'demo-pages/comic-3/episode-21/p4.svg','2026-08-23 23:11:10','2026-08-23 23:11:10'),(205,21,5,'demo-pages/comic-3/episode-21/p5.svg','2026-08-23 23:11:10','2026-08-23 23:11:10'),(206,21,6,'demo-pages/comic-3/episode-21/p6.svg','2026-08-23 23:11:10','2026-08-23 23:11:10'),(207,21,7,'demo-pages/comic-3/episode-21/p7.svg','2026-08-23 23:11:10','2026-08-23 23:11:10'),(208,21,8,'demo-pages/comic-3/episode-21/p8.svg','2026-08-23 23:11:10','2026-08-23 23:11:10'),(209,21,9,'demo-pages/comic-3/episode-21/p9.svg','2026-08-23 23:11:10','2026-08-23 23:11:10'),(210,21,10,'demo-pages/comic-3/episode-21/p10.svg','2026-08-23 23:11:10','2026-08-23 23:11:10'),(211,22,1,'demo-pages/comic-3/episode-22/p1.svg','2026-08-23 23:11:10','2026-08-23 23:11:10'),(212,22,2,'demo-pages/comic-3/episode-22/p2.svg','2026-08-23 23:11:10','2026-08-23 23:11:10'),(213,22,3,'demo-pages/comic-3/episode-22/p3.svg','2026-08-23 23:11:10','2026-08-23 23:11:10'),(214,22,4,'demo-pages/comic-3/episode-22/p4.svg','2026-08-23 23:11:10','2026-08-23 23:11:10'),(215,22,5,'demo-pages/comic-3/episode-22/p5.svg','2026-08-23 23:11:10','2026-08-23 23:11:10'),(216,22,6,'demo-pages/comic-3/episode-22/p6.svg','2026-08-23 23:11:10','2026-08-23 23:11:10'),(217,22,7,'demo-pages/comic-3/episode-22/p7.svg','2026-08-23 23:11:10','2026-08-23 23:11:10'),(218,22,8,'demo-pages/comic-3/episode-22/p8.svg','2026-08-23 23:11:10','2026-08-23 23:11:10'),(219,22,9,'demo-pages/comic-3/episode-22/p9.svg','2026-08-23 23:11:10','2026-08-23 23:11:10'),(220,22,10,'demo-pages/comic-3/episode-22/p10.svg','2026-08-23 23:11:10','2026-08-23 23:11:10'),(221,23,1,'demo-pages/comic-3/episode-23/p1.svg','2026-08-23 23:11:10','2026-08-23 23:11:10'),(222,23,2,'demo-pages/comic-3/episode-23/p2.svg','2026-08-23 23:11:10','2026-08-23 23:11:10'),(223,23,3,'demo-pages/comic-3/episode-23/p3.svg','2026-08-23 23:11:10','2026-08-23 23:11:10'),(224,23,4,'demo-pages/comic-3/episode-23/p4.svg','2026-08-23 23:11:10','2026-08-23 23:11:10'),(225,23,5,'demo-pages/comic-3/episode-23/p5.svg','2026-08-23 23:11:10','2026-08-23 23:11:10'),(226,23,6,'demo-pages/comic-3/episode-23/p6.svg','2026-08-23 23:11:10','2026-08-23 23:11:10'),(227,23,7,'demo-pages/comic-3/episode-23/p7.svg','2026-08-23 23:11:10','2026-08-23 23:11:10'),(228,23,8,'demo-pages/comic-3/episode-23/p8.svg','2026-08-23 23:11:10','2026-08-23 23:11:10'),(229,23,9,'demo-pages/comic-3/episode-23/p9.svg','2026-08-23 23:11:10','2026-08-23 23:11:10'),(230,23,10,'demo-pages/comic-3/episode-23/p10.svg','2026-08-23 23:11:10','2026-08-23 23:11:10'),(231,24,1,'demo-pages/comic-3/episode-24/p1.svg','2026-08-23 23:11:10','2026-08-23 23:11:10'),(232,24,2,'demo-pages/comic-3/episode-24/p2.svg','2026-08-23 23:11:10','2026-08-23 23:11:10'),(233,24,3,'demo-pages/comic-3/episode-24/p3.svg','2026-08-23 23:11:10','2026-08-23 23:11:10'),(234,24,4,'demo-pages/comic-3/episode-24/p4.svg','2026-08-23 23:11:10','2026-08-23 23:11:10'),(235,24,5,'demo-pages/comic-3/episode-24/p5.svg','2026-08-23 23:11:10','2026-08-23 23:11:10'),(236,24,6,'demo-pages/comic-3/episode-24/p6.svg','2026-08-23 23:11:10','2026-08-23 23:11:10'),(237,24,7,'demo-pages/comic-3/episode-24/p7.svg','2026-08-23 23:11:10','2026-08-23 23:11:10'),(238,24,8,'demo-pages/comic-3/episode-24/p8.svg','2026-08-23 23:11:10','2026-08-23 23:11:10'),(239,24,9,'demo-pages/comic-3/episode-24/p9.svg','2026-08-23 23:11:10','2026-08-23 23:11:10'),(240,24,10,'demo-pages/comic-3/episode-24/p10.svg','2026-08-23 23:11:10','2026-08-23 23:11:10'),(241,25,1,'demo-pages/comic-4/episode-25/p1.svg','2026-08-23 23:11:10','2026-08-23 23:11:10'),(242,25,2,'demo-pages/comic-4/episode-25/p2.svg','2026-08-23 23:11:10','2026-08-23 23:11:10'),(243,25,3,'demo-pages/comic-4/episode-25/p3.svg','2026-08-23 23:11:10','2026-08-23 23:11:10'),(244,25,4,'demo-pages/comic-4/episode-25/p4.svg','2026-08-23 23:11:10','2026-08-23 23:11:10'),(245,25,5,'demo-pages/comic-4/episode-25/p5.svg','2026-08-23 23:11:10','2026-08-23 23:11:10'),(246,25,6,'demo-pages/comic-4/episode-25/p6.svg','2026-08-23 23:11:10','2026-08-23 23:11:10'),(247,25,7,'demo-pages/comic-4/episode-25/p7.svg','2026-08-23 23:11:10','2026-08-23 23:11:10'),(248,25,8,'demo-pages/comic-4/episode-25/p8.svg','2026-08-23 23:11:10','2026-08-23 23:11:10'),(249,25,9,'demo-pages/comic-4/episode-25/p9.svg','2026-08-23 23:11:10','2026-08-23 23:11:10'),(250,25,10,'demo-pages/comic-4/episode-25/p10.svg','2026-08-23 23:11:10','2026-08-23 23:11:10'),(251,26,1,'demo-pages/comic-4/episode-26/p1.svg','2026-08-23 23:11:10','2026-08-23 23:11:10'),(252,26,2,'demo-pages/comic-4/episode-26/p2.svg','2026-08-23 23:11:10','2026-08-23 23:11:10'),(253,26,3,'demo-pages/comic-4/episode-26/p3.svg','2026-08-23 23:11:10','2026-08-23 23:11:10'),(254,26,4,'demo-pages/comic-4/episode-26/p4.svg','2026-08-23 23:11:10','2026-08-23 23:11:10'),(255,26,5,'demo-pages/comic-4/episode-26/p5.svg','2026-08-23 23:11:10','2026-08-23 23:11:10'),(256,26,6,'demo-pages/comic-4/episode-26/p6.svg','2026-08-23 23:11:10','2026-08-23 23:11:10'),(257,26,7,'demo-pages/comic-4/episode-26/p7.svg','2026-08-23 23:11:10','2026-08-23 23:11:10'),(258,26,8,'demo-pages/comic-4/episode-26/p8.svg','2026-08-23 23:11:10','2026-08-23 23:11:10'),(259,26,9,'demo-pages/comic-4/episode-26/p9.svg','2026-08-23 23:11:10','2026-08-23 23:11:10'),(260,26,10,'demo-pages/comic-4/episode-26/p10.svg','2026-08-23 23:11:10','2026-08-23 23:11:10'),(261,27,1,'demo-pages/comic-4/episode-27/p1.svg','2026-08-23 23:11:10','2026-08-23 23:11:10'),(262,27,2,'demo-pages/comic-4/episode-27/p2.svg','2026-08-23 23:11:10','2026-08-23 23:11:10'),(263,27,3,'demo-pages/comic-4/episode-27/p3.svg','2026-08-23 23:11:10','2026-08-23 23:11:10'),(264,27,4,'demo-pages/comic-4/episode-27/p4.svg','2026-08-23 23:11:10','2026-08-23 23:11:10'),(265,27,5,'demo-pages/comic-4/episode-27/p5.svg','2026-08-23 23:11:10','2026-08-23 23:11:10'),(266,27,6,'demo-pages/comic-4/episode-27/p6.svg','2026-08-23 23:11:10','2026-08-23 23:11:10'),(267,27,7,'demo-pages/comic-4/episode-27/p7.svg','2026-08-23 23:11:10','2026-08-23 23:11:10'),(268,27,8,'demo-pages/comic-4/episode-27/p8.svg','2026-08-23 23:11:10','2026-08-23 23:11:10'),(269,27,9,'demo-pages/comic-4/episode-27/p9.svg','2026-08-23 23:11:10','2026-08-23 23:11:10'),(270,27,10,'demo-pages/comic-4/episode-27/p10.svg','2026-08-23 23:11:10','2026-08-23 23:11:10'),(271,28,1,'demo-pages/comic-4/episode-28/p1.svg','2026-08-23 23:11:10','2026-08-23 23:11:10'),(272,28,2,'demo-pages/comic-4/episode-28/p2.svg','2026-08-23 23:11:10','2026-08-23 23:11:10'),(273,28,3,'demo-pages/comic-4/episode-28/p3.svg','2026-08-23 23:11:10','2026-08-23 23:11:10'),(274,28,4,'demo-pages/comic-4/episode-28/p4.svg','2026-08-23 23:11:10','2026-08-23 23:11:10'),(275,28,5,'demo-pages/comic-4/episode-28/p5.svg','2026-08-23 23:11:10','2026-08-23 23:11:10'),(276,28,6,'demo-pages/comic-4/episode-28/p6.svg','2026-08-23 23:11:10','2026-08-23 23:11:10'),(277,28,7,'demo-pages/comic-4/episode-28/p7.svg','2026-08-23 23:11:10','2026-08-23 23:11:10'),(278,28,8,'demo-pages/comic-4/episode-28/p8.svg','2026-08-23 23:11:10','2026-08-23 23:11:10'),(279,28,9,'demo-pages/comic-4/episode-28/p9.svg','2026-08-23 23:11:10','2026-08-23 23:11:10'),(280,28,10,'demo-pages/comic-4/episode-28/p10.svg','2026-08-23 23:11:10','2026-08-23 23:11:10'),(281,29,1,'demo-pages/comic-4/episode-29/p1.svg','2026-08-23 23:11:11','2026-08-23 23:11:11'),(282,29,2,'demo-pages/comic-4/episode-29/p2.svg','2026-08-23 23:11:11','2026-08-23 23:11:11'),(283,29,3,'demo-pages/comic-4/episode-29/p3.svg','2026-08-23 23:11:11','2026-08-23 23:11:11'),(284,29,4,'demo-pages/comic-4/episode-29/p4.svg','2026-08-23 23:11:11','2026-08-23 23:11:11'),(285,29,5,'demo-pages/comic-4/episode-29/p5.svg','2026-08-23 23:11:11','2026-08-23 23:11:11'),(286,29,6,'demo-pages/comic-4/episode-29/p6.svg','2026-08-23 23:11:11','2026-08-23 23:11:11'),(287,29,7,'demo-pages/comic-4/episode-29/p7.svg','2026-08-23 23:11:11','2026-08-23 23:11:11'),(288,29,8,'demo-pages/comic-4/episode-29/p8.svg','2026-08-23 23:11:11','2026-08-23 23:11:11'),(289,29,9,'demo-pages/comic-4/episode-29/p9.svg','2026-08-23 23:11:11','2026-08-23 23:11:11'),(290,29,10,'demo-pages/comic-4/episode-29/p10.svg','2026-08-23 23:11:11','2026-08-23 23:11:11'),(291,30,1,'demo-pages/comic-4/episode-30/p1.svg','2026-08-23 23:11:11','2026-08-23 23:11:11'),(292,30,2,'demo-pages/comic-4/episode-30/p2.svg','2026-08-23 23:11:11','2026-08-23 23:11:11'),(293,30,3,'demo-pages/comic-4/episode-30/p3.svg','2026-08-23 23:11:11','2026-08-23 23:11:11'),(294,30,4,'demo-pages/comic-4/episode-30/p4.svg','2026-08-23 23:11:11','2026-08-23 23:11:11'),(295,30,5,'demo-pages/comic-4/episode-30/p5.svg','2026-08-23 23:11:11','2026-08-23 23:11:11'),(296,30,6,'demo-pages/comic-4/episode-30/p6.svg','2026-08-23 23:11:11','2026-08-23 23:11:11'),(297,30,7,'demo-pages/comic-4/episode-30/p7.svg','2026-08-23 23:11:11','2026-08-23 23:11:11'),(298,30,8,'demo-pages/comic-4/episode-30/p8.svg','2026-08-23 23:11:11','2026-08-23 23:11:11'),(299,30,9,'demo-pages/comic-4/episode-30/p9.svg','2026-08-23 23:11:11','2026-08-23 23:11:11'),(300,30,10,'demo-pages/comic-4/episode-30/p10.svg','2026-08-23 23:11:11','2026-08-23 23:11:11'),(301,31,1,'demo-pages/comic-4/episode-31/p1.svg','2026-08-23 23:11:11','2026-08-23 23:11:11'),(302,31,2,'demo-pages/comic-4/episode-31/p2.svg','2026-08-23 23:11:11','2026-08-23 23:11:11'),(303,31,3,'demo-pages/comic-4/episode-31/p3.svg','2026-08-23 23:11:11','2026-08-23 23:11:11'),(304,31,4,'demo-pages/comic-4/episode-31/p4.svg','2026-08-23 23:11:11','2026-08-23 23:11:11'),(305,31,5,'demo-pages/comic-4/episode-31/p5.svg','2026-08-23 23:11:11','2026-08-23 23:11:11'),(306,31,6,'demo-pages/comic-4/episode-31/p6.svg','2026-08-23 23:11:11','2026-08-23 23:11:11'),(307,31,7,'demo-pages/comic-4/episode-31/p7.svg','2026-08-23 23:11:11','2026-08-23 23:11:11'),(308,31,8,'demo-pages/comic-4/episode-31/p8.svg','2026-08-23 23:11:11','2026-08-23 23:11:11'),(309,31,9,'demo-pages/comic-4/episode-31/p9.svg','2026-08-23 23:11:11','2026-08-23 23:11:11'),(310,31,10,'demo-pages/comic-4/episode-31/p10.svg','2026-08-23 23:11:11','2026-08-23 23:11:11'),(311,32,1,'demo-pages/comic-4/episode-32/p1.svg','2026-08-23 23:11:11','2026-08-23 23:11:11'),(312,32,2,'demo-pages/comic-4/episode-32/p2.svg','2026-08-23 23:11:11','2026-08-23 23:11:11'),(313,32,3,'demo-pages/comic-4/episode-32/p3.svg','2026-08-23 23:11:11','2026-08-23 23:11:11'),(314,32,4,'demo-pages/comic-4/episode-32/p4.svg','2026-08-23 23:11:11','2026-08-23 23:11:11'),(315,32,5,'demo-pages/comic-4/episode-32/p5.svg','2026-08-23 23:11:11','2026-08-23 23:11:11'),(316,32,6,'demo-pages/comic-4/episode-32/p6.svg','2026-08-23 23:11:11','2026-08-23 23:11:11'),(317,32,7,'demo-pages/comic-4/episode-32/p7.svg','2026-08-23 23:11:11','2026-08-23 23:11:11'),(318,32,8,'demo-pages/comic-4/episode-32/p8.svg','2026-08-23 23:11:11','2026-08-23 23:11:11'),(319,32,9,'demo-pages/comic-4/episode-32/p9.svg','2026-08-23 23:11:11','2026-08-23 23:11:11'),(320,32,10,'demo-pages/comic-4/episode-32/p10.svg','2026-08-23 23:11:11','2026-08-23 23:11:11'),(321,33,1,'demo-pages/comic-5/episode-33/p1.svg','2026-08-23 23:11:11','2026-08-23 23:11:11'),(322,33,2,'demo-pages/comic-5/episode-33/p2.svg','2026-08-23 23:11:11','2026-08-23 23:11:11'),(323,33,3,'demo-pages/comic-5/episode-33/p3.svg','2026-08-23 23:11:11','2026-08-23 23:11:11'),(324,33,4,'demo-pages/comic-5/episode-33/p4.svg','2026-08-23 23:11:11','2026-08-23 23:11:11'),(325,33,5,'demo-pages/comic-5/episode-33/p5.svg','2026-08-23 23:11:11','2026-08-23 23:11:11'),(326,33,6,'demo-pages/comic-5/episode-33/p6.svg','2026-08-23 23:11:11','2026-08-23 23:11:11'),(327,33,7,'demo-pages/comic-5/episode-33/p7.svg','2026-08-23 23:11:11','2026-08-23 23:11:11'),(328,33,8,'demo-pages/comic-5/episode-33/p8.svg','2026-08-23 23:11:11','2026-08-23 23:11:11'),(329,33,9,'demo-pages/comic-5/episode-33/p9.svg','2026-08-23 23:11:11','2026-08-23 23:11:11'),(330,33,10,'demo-pages/comic-5/episode-33/p10.svg','2026-08-23 23:11:11','2026-08-23 23:11:11'),(331,34,1,'demo-pages/comic-5/episode-34/p1.svg','2026-08-23 23:11:11','2026-08-23 23:11:11'),(332,34,2,'demo-pages/comic-5/episode-34/p2.svg','2026-08-23 23:11:11','2026-08-23 23:11:11'),(333,34,3,'demo-pages/comic-5/episode-34/p3.svg','2026-08-23 23:11:11','2026-08-23 23:11:11'),(334,34,4,'demo-pages/comic-5/episode-34/p4.svg','2026-08-23 23:11:11','2026-08-23 23:11:11'),(335,34,5,'demo-pages/comic-5/episode-34/p5.svg','2026-08-23 23:11:11','2026-08-23 23:11:11'),(336,34,6,'demo-pages/comic-5/episode-34/p6.svg','2026-08-23 23:11:11','2026-08-23 23:11:11'),(337,34,7,'demo-pages/comic-5/episode-34/p7.svg','2026-08-23 23:11:11','2026-08-23 23:11:11'),(338,34,8,'demo-pages/comic-5/episode-34/p8.svg','2026-08-23 23:11:11','2026-08-23 23:11:11'),(339,34,9,'demo-pages/comic-5/episode-34/p9.svg','2026-08-23 23:11:11','2026-08-23 23:11:11'),(340,34,10,'demo-pages/comic-5/episode-34/p10.svg','2026-08-23 23:11:11','2026-08-23 23:11:11'),(341,35,1,'demo-pages/comic-5/episode-35/p1.svg','2026-08-23 23:11:11','2026-08-23 23:11:11'),(342,35,2,'demo-pages/comic-5/episode-35/p2.svg','2026-08-23 23:11:11','2026-08-23 23:11:11'),(343,35,3,'demo-pages/comic-5/episode-35/p3.svg','2026-08-23 23:11:11','2026-08-23 23:11:11'),(344,35,4,'demo-pages/comic-5/episode-35/p4.svg','2026-08-23 23:11:11','2026-08-23 23:11:11'),(345,35,5,'demo-pages/comic-5/episode-35/p5.svg','2026-08-23 23:11:11','2026-08-23 23:11:11'),(346,35,6,'demo-pages/comic-5/episode-35/p6.svg','2026-08-23 23:11:11','2026-08-23 23:11:11'),(347,35,7,'demo-pages/comic-5/episode-35/p7.svg','2026-08-23 23:11:11','2026-08-23 23:11:11'),(348,35,8,'demo-pages/comic-5/episode-35/p8.svg','2026-08-23 23:11:11','2026-08-23 23:11:11'),(349,35,9,'demo-pages/comic-5/episode-35/p9.svg','2026-08-23 23:11:11','2026-08-23 23:11:11'),(350,35,10,'demo-pages/comic-5/episode-35/p10.svg','2026-08-23 23:11:11','2026-08-23 23:11:11'),(351,36,1,'demo-pages/comic-5/episode-36/p1.svg','2026-08-23 23:11:11','2026-08-23 23:11:11'),(352,36,2,'demo-pages/comic-5/episode-36/p2.svg','2026-08-23 23:11:11','2026-08-23 23:11:11'),(353,36,3,'demo-pages/comic-5/episode-36/p3.svg','2026-08-23 23:11:11','2026-08-23 23:11:11'),(354,36,4,'demo-pages/comic-5/episode-36/p4.svg','2026-08-23 23:11:11','2026-08-23 23:11:11'),(355,36,5,'demo-pages/comic-5/episode-36/p5.svg','2026-08-23 23:11:11','2026-08-23 23:11:11'),(356,36,6,'demo-pages/comic-5/episode-36/p6.svg','2026-08-23 23:11:11','2026-08-23 23:11:11'),(357,36,7,'demo-pages/comic-5/episode-36/p7.svg','2026-08-23 23:11:11','2026-08-23 23:11:11'),(358,36,8,'demo-pages/comic-5/episode-36/p8.svg','2026-08-23 23:11:11','2026-08-23 23:11:11'),(359,36,9,'demo-pages/comic-5/episode-36/p9.svg','2026-08-23 23:11:11','2026-08-23 23:11:11'),(360,36,10,'demo-pages/comic-5/episode-36/p10.svg','2026-08-23 23:11:11','2026-08-23 23:11:11'),(361,37,1,'demo-pages/comic-5/episode-37/p1.svg','2026-08-23 23:11:11','2026-08-23 23:11:11'),(362,37,2,'demo-pages/comic-5/episode-37/p2.svg','2026-08-23 23:11:11','2026-08-23 23:11:11'),(363,37,3,'demo-pages/comic-5/episode-37/p3.svg','2026-08-23 23:11:11','2026-08-23 23:11:11'),(364,37,4,'demo-pages/comic-5/episode-37/p4.svg','2026-08-23 23:11:11','2026-08-23 23:11:11'),(365,37,5,'demo-pages/comic-5/episode-37/p5.svg','2026-08-23 23:11:11','2026-08-23 23:11:11'),(366,37,6,'demo-pages/comic-5/episode-37/p6.svg','2026-08-23 23:11:11','2026-08-23 23:11:11'),(367,37,7,'demo-pages/comic-5/episode-37/p7.svg','2026-08-23 23:11:11','2026-08-23 23:11:11'),(368,37,8,'demo-pages/comic-5/episode-37/p8.svg','2026-08-23 23:11:11','2026-08-23 23:11:11'),(369,37,9,'demo-pages/comic-5/episode-37/p9.svg','2026-08-23 23:11:11','2026-08-23 23:11:11'),(370,37,10,'demo-pages/comic-5/episode-37/p10.svg','2026-08-23 23:11:11','2026-08-23 23:11:11'),(371,38,1,'demo-pages/comic-5/episode-38/p1.svg','2026-08-23 23:11:11','2026-08-23 23:11:11'),(372,38,2,'demo-pages/comic-5/episode-38/p2.svg','2026-08-23 23:11:11','2026-08-23 23:11:11'),(373,38,3,'demo-pages/comic-5/episode-38/p3.svg','2026-08-23 23:11:11','2026-08-23 23:11:11'),(374,38,4,'demo-pages/comic-5/episode-38/p4.svg','2026-08-23 23:11:11','2026-08-23 23:11:11'),(375,38,5,'demo-pages/comic-5/episode-38/p5.svg','2026-08-23 23:11:11','2026-08-23 23:11:11'),(376,38,6,'demo-pages/comic-5/episode-38/p6.svg','2026-08-23 23:11:11','2026-08-23 23:11:11'),(377,38,7,'demo-pages/comic-5/episode-38/p7.svg','2026-08-23 23:11:11','2026-08-23 23:11:11'),(378,38,8,'demo-pages/comic-5/episode-38/p8.svg','2026-08-23 23:11:11','2026-08-23 23:11:11'),(379,38,9,'demo-pages/comic-5/episode-38/p9.svg','2026-08-23 23:11:11','2026-08-23 23:11:11'),(380,38,10,'demo-pages/comic-5/episode-38/p10.svg','2026-08-23 23:11:11','2026-08-23 23:11:11'),(381,39,1,'demo-pages/comic-5/episode-39/p1.svg','2026-08-23 23:11:11','2026-08-23 23:11:11'),(382,39,2,'demo-pages/comic-5/episode-39/p2.svg','2026-08-23 23:11:11','2026-08-23 23:11:11'),(383,39,3,'demo-pages/comic-5/episode-39/p3.svg','2026-08-23 23:11:11','2026-08-23 23:11:11'),(384,39,4,'demo-pages/comic-5/episode-39/p4.svg','2026-08-23 23:11:11','2026-08-23 23:11:11'),(385,39,5,'demo-pages/comic-5/episode-39/p5.svg','2026-08-23 23:11:11','2026-08-23 23:11:11'),(386,39,6,'demo-pages/comic-5/episode-39/p6.svg','2026-08-23 23:11:11','2026-08-23 23:11:11'),(387,39,7,'demo-pages/comic-5/episode-39/p7.svg','2026-08-23 23:11:11','2026-08-23 23:11:11'),(388,39,8,'demo-pages/comic-5/episode-39/p8.svg','2026-08-23 23:11:11','2026-08-23 23:11:11'),(389,39,9,'demo-pages/comic-5/episode-39/p9.svg','2026-08-23 23:11:11','2026-08-23 23:11:11'),(390,39,10,'demo-pages/comic-5/episode-39/p10.svg','2026-08-23 23:11:11','2026-08-23 23:11:11'),(391,40,1,'demo-pages/comic-5/episode-40/p1.svg','2026-08-23 23:11:11','2026-08-23 23:11:11'),(392,40,2,'demo-pages/comic-5/episode-40/p2.svg','2026-08-23 23:11:11','2026-08-23 23:11:11'),(393,40,3,'demo-pages/comic-5/episode-40/p3.svg','2026-08-23 23:11:11','2026-08-23 23:11:11'),(394,40,4,'demo-pages/comic-5/episode-40/p4.svg','2026-08-23 23:11:11','2026-08-23 23:11:11'),(395,40,5,'demo-pages/comic-5/episode-40/p5.svg','2026-08-23 23:11:11','2026-08-23 23:11:11'),(396,40,6,'demo-pages/comic-5/episode-40/p6.svg','2026-08-23 23:11:11','2026-08-23 23:11:11'),(397,40,7,'demo-pages/comic-5/episode-40/p7.svg','2026-08-23 23:11:11','2026-08-23 23:11:11'),(398,40,8,'demo-pages/comic-5/episode-40/p8.svg','2026-08-23 23:11:11','2026-08-23 23:11:11'),(399,40,9,'demo-pages/comic-5/episode-40/p9.svg','2026-08-23 23:11:11','2026-08-23 23:11:11'),(400,40,10,'demo-pages/comic-5/episode-40/p10.svg','2026-08-23 23:11:11','2026-08-23 23:11:11'),(401,41,1,'demo-pages/comic-6/episode-41/p1.svg','2026-08-23 23:11:11','2026-08-23 23:11:11'),(402,41,2,'demo-pages/comic-6/episode-41/p2.svg','2026-08-23 23:11:11','2026-08-23 23:11:11'),(403,41,3,'demo-pages/comic-6/episode-41/p3.svg','2026-08-23 23:11:11','2026-08-23 23:11:11'),(404,41,4,'demo-pages/comic-6/episode-41/p4.svg','2026-08-23 23:11:11','2026-08-23 23:11:11'),(405,41,5,'demo-pages/comic-6/episode-41/p5.svg','2026-08-23 23:11:11','2026-08-23 23:11:11'),(406,41,6,'demo-pages/comic-6/episode-41/p6.svg','2026-08-23 23:11:11','2026-08-23 23:11:11'),(407,41,7,'demo-pages/comic-6/episode-41/p7.svg','2026-08-23 23:11:11','2026-08-23 23:11:11'),(408,41,8,'demo-pages/comic-6/episode-41/p8.svg','2026-08-23 23:11:11','2026-08-23 23:11:11'),(409,41,9,'demo-pages/comic-6/episode-41/p9.svg','2026-08-23 23:11:11','2026-08-23 23:11:11'),(410,41,10,'demo-pages/comic-6/episode-41/p10.svg','2026-08-23 23:11:11','2026-08-23 23:11:11'),(411,42,1,'demo-pages/comic-6/episode-42/p1.svg','2026-08-23 23:11:11','2026-08-23 23:11:11'),(412,42,2,'demo-pages/comic-6/episode-42/p2.svg','2026-08-23 23:11:11','2026-08-23 23:11:11'),(413,42,3,'demo-pages/comic-6/episode-42/p3.svg','2026-08-23 23:11:11','2026-08-23 23:11:11'),(414,42,4,'demo-pages/comic-6/episode-42/p4.svg','2026-08-23 23:11:11','2026-08-23 23:11:11'),(415,42,5,'demo-pages/comic-6/episode-42/p5.svg','2026-08-23 23:11:11','2026-08-23 23:11:11'),(416,42,6,'demo-pages/comic-6/episode-42/p6.svg','2026-08-23 23:11:11','2026-08-23 23:11:11'),(417,42,7,'demo-pages/comic-6/episode-42/p7.svg','2026-08-23 23:11:11','2026-08-23 23:11:11'),(418,42,8,'demo-pages/comic-6/episode-42/p8.svg','2026-08-23 23:11:11','2026-08-23 23:11:11'),(419,42,9,'demo-pages/comic-6/episode-42/p9.svg','2026-08-23 23:11:11','2026-08-23 23:11:11'),(420,42,10,'demo-pages/comic-6/episode-42/p10.svg','2026-08-23 23:11:11','2026-08-23 23:11:11'),(421,43,1,'demo-pages/comic-6/episode-43/p1.svg','2026-08-23 23:11:12','2026-08-23 23:11:12'),(422,43,2,'demo-pages/comic-6/episode-43/p2.svg','2026-08-23 23:11:12','2026-08-23 23:11:12'),(423,43,3,'demo-pages/comic-6/episode-43/p3.svg','2026-08-23 23:11:12','2026-08-23 23:11:12'),(424,43,4,'demo-pages/comic-6/episode-43/p4.svg','2026-08-23 23:11:12','2026-08-23 23:11:12'),(425,43,5,'demo-pages/comic-6/episode-43/p5.svg','2026-08-23 23:11:12','2026-08-23 23:11:12'),(426,43,6,'demo-pages/comic-6/episode-43/p6.svg','2026-08-23 23:11:12','2026-08-23 23:11:12'),(427,43,7,'demo-pages/comic-6/episode-43/p7.svg','2026-08-23 23:11:12','2026-08-23 23:11:12'),(428,43,8,'demo-pages/comic-6/episode-43/p8.svg','2026-08-23 23:11:12','2026-08-23 23:11:12'),(429,43,9,'demo-pages/comic-6/episode-43/p9.svg','2026-08-23 23:11:12','2026-08-23 23:11:12'),(430,43,10,'demo-pages/comic-6/episode-43/p10.svg','2026-08-23 23:11:12','2026-08-23 23:11:12'),(431,44,1,'demo-pages/comic-6/episode-44/p1.svg','2026-08-23 23:11:12','2026-08-23 23:11:12'),(432,44,2,'demo-pages/comic-6/episode-44/p2.svg','2026-08-23 23:11:12','2026-08-23 23:11:12'),(433,44,3,'demo-pages/comic-6/episode-44/p3.svg','2026-08-23 23:11:12','2026-08-23 23:11:12'),(434,44,4,'demo-pages/comic-6/episode-44/p4.svg','2026-08-23 23:11:12','2026-08-23 23:11:12'),(435,44,5,'demo-pages/comic-6/episode-44/p5.svg','2026-08-23 23:11:12','2026-08-23 23:11:12'),(436,44,6,'demo-pages/comic-6/episode-44/p6.svg','2026-08-23 23:11:12','2026-08-23 23:11:12'),(437,44,7,'demo-pages/comic-6/episode-44/p7.svg','2026-08-23 23:11:12','2026-08-23 23:11:12'),(438,44,8,'demo-pages/comic-6/episode-44/p8.svg','2026-08-23 23:11:12','2026-08-23 23:11:12'),(439,44,9,'demo-pages/comic-6/episode-44/p9.svg','2026-08-23 23:11:12','2026-08-23 23:11:12'),(440,44,10,'demo-pages/comic-6/episode-44/p10.svg','2026-08-23 23:11:12','2026-08-23 23:11:12'),(441,45,1,'demo-pages/comic-6/episode-45/p1.svg','2026-08-23 23:11:12','2026-08-23 23:11:12'),(442,45,2,'demo-pages/comic-6/episode-45/p2.svg','2026-08-23 23:11:12','2026-08-23 23:11:12'),(443,45,3,'demo-pages/comic-6/episode-45/p3.svg','2026-08-23 23:11:12','2026-08-23 23:11:12'),(444,45,4,'demo-pages/comic-6/episode-45/p4.svg','2026-08-23 23:11:12','2026-08-23 23:11:12'),(445,45,5,'demo-pages/comic-6/episode-45/p5.svg','2026-08-23 23:11:12','2026-08-23 23:11:12'),(446,45,6,'demo-pages/comic-6/episode-45/p6.svg','2026-08-23 23:11:12','2026-08-23 23:11:12'),(447,45,7,'demo-pages/comic-6/episode-45/p7.svg','2026-08-23 23:11:12','2026-08-23 23:11:12'),(448,45,8,'demo-pages/comic-6/episode-45/p8.svg','2026-08-23 23:11:12','2026-08-23 23:11:12'),(449,45,9,'demo-pages/comic-6/episode-45/p9.svg','2026-08-23 23:11:12','2026-08-23 23:11:12'),(450,45,10,'demo-pages/comic-6/episode-45/p10.svg','2026-08-23 23:11:12','2026-08-23 23:11:12'),(451,46,1,'demo-pages/comic-6/episode-46/p1.svg','2026-08-23 23:11:12','2026-08-23 23:11:12'),(452,46,2,'demo-pages/comic-6/episode-46/p2.svg','2026-08-23 23:11:12','2026-08-23 23:11:12'),(453,46,3,'demo-pages/comic-6/episode-46/p3.svg','2026-08-23 23:11:12','2026-08-23 23:11:12'),(454,46,4,'demo-pages/comic-6/episode-46/p4.svg','2026-08-23 23:11:12','2026-08-23 23:11:12'),(455,46,5,'demo-pages/comic-6/episode-46/p5.svg','2026-08-23 23:11:12','2026-08-23 23:11:12'),(456,46,6,'demo-pages/comic-6/episode-46/p6.svg','2026-08-23 23:11:12','2026-08-23 23:11:12'),(457,46,7,'demo-pages/comic-6/episode-46/p7.svg','2026-08-23 23:11:12','2026-08-23 23:11:12'),(458,46,8,'demo-pages/comic-6/episode-46/p8.svg','2026-08-23 23:11:12','2026-08-23 23:11:12'),(459,46,9,'demo-pages/comic-6/episode-46/p9.svg','2026-08-23 23:11:12','2026-08-23 23:11:12'),(460,46,10,'demo-pages/comic-6/episode-46/p10.svg','2026-08-23 23:11:12','2026-08-23 23:11:12'),(461,47,1,'demo-pages/comic-6/episode-47/p1.svg','2026-08-23 23:11:12','2026-08-23 23:11:12'),(462,47,2,'demo-pages/comic-6/episode-47/p2.svg','2026-08-23 23:11:12','2026-08-23 23:11:12'),(463,47,3,'demo-pages/comic-6/episode-47/p3.svg','2026-08-23 23:11:12','2026-08-23 23:11:12'),(464,47,4,'demo-pages/comic-6/episode-47/p4.svg','2026-08-23 23:11:12','2026-08-23 23:11:12'),(465,47,5,'demo-pages/comic-6/episode-47/p5.svg','2026-08-23 23:11:12','2026-08-23 23:11:12'),(466,47,6,'demo-pages/comic-6/episode-47/p6.svg','2026-08-23 23:11:12','2026-08-23 23:11:12'),(467,47,7,'demo-pages/comic-6/episode-47/p7.svg','2026-08-23 23:11:12','2026-08-23 23:11:12'),(468,47,8,'demo-pages/comic-6/episode-47/p8.svg','2026-08-23 23:11:12','2026-08-23 23:11:12'),(469,47,9,'demo-pages/comic-6/episode-47/p9.svg','2026-08-23 23:11:12','2026-08-23 23:11:12'),(470,47,10,'demo-pages/comic-6/episode-47/p10.svg','2026-08-23 23:11:12','2026-08-23 23:11:12'),(471,48,1,'demo-pages/comic-6/episode-48/p1.svg','2026-08-23 23:11:12','2026-08-23 23:11:12'),(472,48,2,'demo-pages/comic-6/episode-48/p2.svg','2026-08-23 23:11:12','2026-08-23 23:11:12'),(473,48,3,'demo-pages/comic-6/episode-48/p3.svg','2026-08-23 23:11:12','2026-08-23 23:11:12'),(474,48,4,'demo-pages/comic-6/episode-48/p4.svg','2026-08-23 23:11:12','2026-08-23 23:11:12'),(475,48,5,'demo-pages/comic-6/episode-48/p5.svg','2026-08-23 23:11:12','2026-08-23 23:11:12'),(476,48,6,'demo-pages/comic-6/episode-48/p6.svg','2026-08-23 23:11:12','2026-08-23 23:11:12'),(477,48,7,'demo-pages/comic-6/episode-48/p7.svg','2026-08-23 23:11:12','2026-08-23 23:11:12'),(478,48,8,'demo-pages/comic-6/episode-48/p8.svg','2026-08-23 23:11:12','2026-08-23 23:11:12'),(479,48,9,'demo-pages/comic-6/episode-48/p9.svg','2026-08-23 23:11:12','2026-08-23 23:11:12'),(480,48,10,'demo-pages/comic-6/episode-48/p10.svg','2026-08-23 23:11:12','2026-08-23 23:11:12'),(481,49,1,'demo-pages/comic-7/episode-49/p1.svg','2026-08-23 23:11:12','2026-08-23 23:11:12'),(482,49,2,'demo-pages/comic-7/episode-49/p2.svg','2026-08-23 23:11:12','2026-08-23 23:11:12'),(483,49,3,'demo-pages/comic-7/episode-49/p3.svg','2026-08-23 23:11:12','2026-08-23 23:11:12'),(484,49,4,'demo-pages/comic-7/episode-49/p4.svg','2026-08-23 23:11:12','2026-08-23 23:11:12'),(485,49,5,'demo-pages/comic-7/episode-49/p5.svg','2026-08-23 23:11:12','2026-08-23 23:11:12'),(486,49,6,'demo-pages/comic-7/episode-49/p6.svg','2026-08-23 23:11:12','2026-08-23 23:11:12'),(487,49,7,'demo-pages/comic-7/episode-49/p7.svg','2026-08-23 23:11:12','2026-08-23 23:11:12'),(488,49,8,'demo-pages/comic-7/episode-49/p8.svg','2026-08-23 23:11:12','2026-08-23 23:11:12'),(489,49,9,'demo-pages/comic-7/episode-49/p9.svg','2026-08-23 23:11:12','2026-08-23 23:11:12'),(490,49,10,'demo-pages/comic-7/episode-49/p10.svg','2026-08-23 23:11:12','2026-08-23 23:11:12'),(491,50,1,'demo-pages/comic-7/episode-50/p1.svg','2026-08-23 23:11:12','2026-08-23 23:11:12'),(492,50,2,'demo-pages/comic-7/episode-50/p2.svg','2026-08-23 23:11:12','2026-08-23 23:11:12'),(493,50,3,'demo-pages/comic-7/episode-50/p3.svg','2026-08-23 23:11:12','2026-08-23 23:11:12'),(494,50,4,'demo-pages/comic-7/episode-50/p4.svg','2026-08-23 23:11:12','2026-08-23 23:11:12'),(495,50,5,'demo-pages/comic-7/episode-50/p5.svg','2026-08-23 23:11:12','2026-08-23 23:11:12'),(496,50,6,'demo-pages/comic-7/episode-50/p6.svg','2026-08-23 23:11:12','2026-08-23 23:11:12'),(497,50,7,'demo-pages/comic-7/episode-50/p7.svg','2026-08-23 23:11:12','2026-08-23 23:11:12'),(498,50,8,'demo-pages/comic-7/episode-50/p8.svg','2026-08-23 23:11:12','2026-08-23 23:11:12'),(499,50,9,'demo-pages/comic-7/episode-50/p9.svg','2026-08-23 23:11:12','2026-08-23 23:11:12'),(500,50,10,'demo-pages/comic-7/episode-50/p10.svg','2026-08-23 23:11:12','2026-08-23 23:11:12'),(501,51,1,'demo-pages/comic-7/episode-51/p1.svg','2026-08-23 23:11:12','2026-08-23 23:11:12'),(502,51,2,'demo-pages/comic-7/episode-51/p2.svg','2026-08-23 23:11:12','2026-08-23 23:11:12'),(503,51,3,'demo-pages/comic-7/episode-51/p3.svg','2026-08-23 23:11:12','2026-08-23 23:11:12'),(504,51,4,'demo-pages/comic-7/episode-51/p4.svg','2026-08-23 23:11:12','2026-08-23 23:11:12'),(505,51,5,'demo-pages/comic-7/episode-51/p5.svg','2026-08-23 23:11:12','2026-08-23 23:11:12'),(506,51,6,'demo-pages/comic-7/episode-51/p6.svg','2026-08-23 23:11:12','2026-08-23 23:11:12'),(507,51,7,'demo-pages/comic-7/episode-51/p7.svg','2026-08-23 23:11:12','2026-08-23 23:11:12'),(508,51,8,'demo-pages/comic-7/episode-51/p8.svg','2026-08-23 23:11:12','2026-08-23 23:11:12'),(509,51,9,'demo-pages/comic-7/episode-51/p9.svg','2026-08-23 23:11:12','2026-08-23 23:11:12'),(510,51,10,'demo-pages/comic-7/episode-51/p10.svg','2026-08-23 23:11:12','2026-08-23 23:11:12'),(511,52,1,'demo-pages/comic-7/episode-52/p1.svg','2026-08-23 23:11:12','2026-08-23 23:11:12'),(512,52,2,'demo-pages/comic-7/episode-52/p2.svg','2026-08-23 23:11:12','2026-08-23 23:11:12'),(513,52,3,'demo-pages/comic-7/episode-52/p3.svg','2026-08-23 23:11:12','2026-08-23 23:11:12'),(514,52,4,'demo-pages/comic-7/episode-52/p4.svg','2026-08-23 23:11:12','2026-08-23 23:11:12'),(515,52,5,'demo-pages/comic-7/episode-52/p5.svg','2026-08-23 23:11:12','2026-08-23 23:11:12'),(516,52,6,'demo-pages/comic-7/episode-52/p6.svg','2026-08-23 23:11:12','2026-08-23 23:11:12'),(517,52,7,'demo-pages/comic-7/episode-52/p7.svg','2026-08-23 23:11:12','2026-08-23 23:11:12'),(518,52,8,'demo-pages/comic-7/episode-52/p8.svg','2026-08-23 23:11:12','2026-08-23 23:11:12'),(519,52,9,'demo-pages/comic-7/episode-52/p9.svg','2026-08-23 23:11:12','2026-08-23 23:11:12'),(520,52,10,'demo-pages/comic-7/episode-52/p10.svg','2026-08-23 23:11:12','2026-08-23 23:11:12'),(521,53,1,'demo-pages/comic-7/episode-53/p1.svg','2026-08-23 23:11:12','2026-08-23 23:11:12'),(522,53,2,'demo-pages/comic-7/episode-53/p2.svg','2026-08-23 23:11:12','2026-08-23 23:11:12'),(523,53,3,'demo-pages/comic-7/episode-53/p3.svg','2026-08-23 23:11:12','2026-08-23 23:11:12'),(524,53,4,'demo-pages/comic-7/episode-53/p4.svg','2026-08-23 23:11:12','2026-08-23 23:11:12'),(525,53,5,'demo-pages/comic-7/episode-53/p5.svg','2026-08-23 23:11:12','2026-08-23 23:11:12'),(526,53,6,'demo-pages/comic-7/episode-53/p6.svg','2026-08-23 23:11:12','2026-08-23 23:11:12'),(527,53,7,'demo-pages/comic-7/episode-53/p7.svg','2026-08-23 23:11:12','2026-08-23 23:11:12'),(528,53,8,'demo-pages/comic-7/episode-53/p8.svg','2026-08-23 23:11:12','2026-08-23 23:11:12'),(529,53,9,'demo-pages/comic-7/episode-53/p9.svg','2026-08-23 23:11:12','2026-08-23 23:11:12'),(530,53,10,'demo-pages/comic-7/episode-53/p10.svg','2026-08-23 23:11:12','2026-08-23 23:11:12'),(531,54,1,'demo-pages/comic-7/episode-54/p1.svg','2026-08-23 23:11:12','2026-08-23 23:11:12'),(532,54,2,'demo-pages/comic-7/episode-54/p2.svg','2026-08-23 23:11:12','2026-08-23 23:11:12'),(533,54,3,'demo-pages/comic-7/episode-54/p3.svg','2026-08-23 23:11:12','2026-08-23 23:11:12'),(534,54,4,'demo-pages/comic-7/episode-54/p4.svg','2026-08-23 23:11:12','2026-08-23 23:11:12'),(535,54,5,'demo-pages/comic-7/episode-54/p5.svg','2026-08-23 23:11:12','2026-08-23 23:11:12'),(536,54,6,'demo-pages/comic-7/episode-54/p6.svg','2026-08-23 23:11:12','2026-08-23 23:11:12'),(537,54,7,'demo-pages/comic-7/episode-54/p7.svg','2026-08-23 23:11:12','2026-08-23 23:11:12'),(538,54,8,'demo-pages/comic-7/episode-54/p8.svg','2026-08-23 23:11:12','2026-08-23 23:11:12'),(539,54,9,'demo-pages/comic-7/episode-54/p9.svg','2026-08-23 23:11:12','2026-08-23 23:11:12'),(540,54,10,'demo-pages/comic-7/episode-54/p10.svg','2026-08-23 23:11:12','2026-08-23 23:11:12'),(541,55,1,'demo-pages/comic-7/episode-55/p1.svg','2026-08-23 23:11:12','2026-08-23 23:11:12'),(542,55,2,'demo-pages/comic-7/episode-55/p2.svg','2026-08-23 23:11:12','2026-08-23 23:11:12'),(543,55,3,'demo-pages/comic-7/episode-55/p3.svg','2026-08-23 23:11:12','2026-08-23 23:11:12'),(544,55,4,'demo-pages/comic-7/episode-55/p4.svg','2026-08-23 23:11:12','2026-08-23 23:11:12'),(545,55,5,'demo-pages/comic-7/episode-55/p5.svg','2026-08-23 23:11:12','2026-08-23 23:11:12'),(546,55,6,'demo-pages/comic-7/episode-55/p6.svg','2026-08-23 23:11:12','2026-08-23 23:11:12'),(547,55,7,'demo-pages/comic-7/episode-55/p7.svg','2026-08-23 23:11:12','2026-08-23 23:11:12'),(548,55,8,'demo-pages/comic-7/episode-55/p8.svg','2026-08-23 23:11:12','2026-08-23 23:11:12'),(549,55,9,'demo-pages/comic-7/episode-55/p9.svg','2026-08-23 23:11:12','2026-08-23 23:11:12'),(550,55,10,'demo-pages/comic-7/episode-55/p10.svg','2026-08-23 23:11:12','2026-08-23 23:11:12'),(551,56,1,'demo-pages/comic-7/episode-56/p1.svg','2026-08-23 23:11:12','2026-08-23 23:11:12'),(552,56,2,'demo-pages/comic-7/episode-56/p2.svg','2026-08-23 23:11:12','2026-08-23 23:11:12'),(553,56,3,'demo-pages/comic-7/episode-56/p3.svg','2026-08-23 23:11:12','2026-08-23 23:11:12'),(554,56,4,'demo-pages/comic-7/episode-56/p4.svg','2026-08-23 23:11:12','2026-08-23 23:11:12'),(555,56,5,'demo-pages/comic-7/episode-56/p5.svg','2026-08-23 23:11:12','2026-08-23 23:11:12'),(556,56,6,'demo-pages/comic-7/episode-56/p6.svg','2026-08-23 23:11:12','2026-08-23 23:11:12'),(557,56,7,'demo-pages/comic-7/episode-56/p7.svg','2026-08-23 23:11:12','2026-08-23 23:11:12'),(558,56,8,'demo-pages/comic-7/episode-56/p8.svg','2026-08-23 23:11:12','2026-08-23 23:11:12'),(559,56,9,'demo-pages/comic-7/episode-56/p9.svg','2026-08-23 23:11:12','2026-08-23 23:11:12'),(560,56,10,'demo-pages/comic-7/episode-56/p10.svg','2026-08-23 23:11:12','2026-08-23 23:11:12'),(561,57,1,'demo-pages/comic-8/episode-57/p1.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(562,57,2,'demo-pages/comic-8/episode-57/p2.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(563,57,3,'demo-pages/comic-8/episode-57/p3.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(564,57,4,'demo-pages/comic-8/episode-57/p4.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(565,57,5,'demo-pages/comic-8/episode-57/p5.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(566,57,6,'demo-pages/comic-8/episode-57/p6.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(567,57,7,'demo-pages/comic-8/episode-57/p7.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(568,57,8,'demo-pages/comic-8/episode-57/p8.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(569,57,9,'demo-pages/comic-8/episode-57/p9.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(570,57,10,'demo-pages/comic-8/episode-57/p10.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(571,58,1,'demo-pages/comic-8/episode-58/p1.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(572,58,2,'demo-pages/comic-8/episode-58/p2.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(573,58,3,'demo-pages/comic-8/episode-58/p3.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(574,58,4,'demo-pages/comic-8/episode-58/p4.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(575,58,5,'demo-pages/comic-8/episode-58/p5.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(576,58,6,'demo-pages/comic-8/episode-58/p6.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(577,58,7,'demo-pages/comic-8/episode-58/p7.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(578,58,8,'demo-pages/comic-8/episode-58/p8.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(579,58,9,'demo-pages/comic-8/episode-58/p9.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(580,58,10,'demo-pages/comic-8/episode-58/p10.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(581,59,1,'demo-pages/comic-8/episode-59/p1.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(582,59,2,'demo-pages/comic-8/episode-59/p2.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(583,59,3,'demo-pages/comic-8/episode-59/p3.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(584,59,4,'demo-pages/comic-8/episode-59/p4.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(585,59,5,'demo-pages/comic-8/episode-59/p5.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(586,59,6,'demo-pages/comic-8/episode-59/p6.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(587,59,7,'demo-pages/comic-8/episode-59/p7.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(588,59,8,'demo-pages/comic-8/episode-59/p8.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(589,59,9,'demo-pages/comic-8/episode-59/p9.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(590,59,10,'demo-pages/comic-8/episode-59/p10.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(591,60,1,'demo-pages/comic-8/episode-60/p1.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(592,60,2,'demo-pages/comic-8/episode-60/p2.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(593,60,3,'demo-pages/comic-8/episode-60/p3.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(594,60,4,'demo-pages/comic-8/episode-60/p4.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(595,60,5,'demo-pages/comic-8/episode-60/p5.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(596,60,6,'demo-pages/comic-8/episode-60/p6.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(597,60,7,'demo-pages/comic-8/episode-60/p7.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(598,60,8,'demo-pages/comic-8/episode-60/p8.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(599,60,9,'demo-pages/comic-8/episode-60/p9.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(600,60,10,'demo-pages/comic-8/episode-60/p10.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(601,61,1,'demo-pages/comic-8/episode-61/p1.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(602,61,2,'demo-pages/comic-8/episode-61/p2.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(603,61,3,'demo-pages/comic-8/episode-61/p3.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(604,61,4,'demo-pages/comic-8/episode-61/p4.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(605,61,5,'demo-pages/comic-8/episode-61/p5.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(606,61,6,'demo-pages/comic-8/episode-61/p6.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(607,61,7,'demo-pages/comic-8/episode-61/p7.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(608,61,8,'demo-pages/comic-8/episode-61/p8.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(609,61,9,'demo-pages/comic-8/episode-61/p9.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(610,61,10,'demo-pages/comic-8/episode-61/p10.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(611,62,1,'demo-pages/comic-8/episode-62/p1.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(612,62,2,'demo-pages/comic-8/episode-62/p2.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(613,62,3,'demo-pages/comic-8/episode-62/p3.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(614,62,4,'demo-pages/comic-8/episode-62/p4.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(615,62,5,'demo-pages/comic-8/episode-62/p5.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(616,62,6,'demo-pages/comic-8/episode-62/p6.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(617,62,7,'demo-pages/comic-8/episode-62/p7.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(618,62,8,'demo-pages/comic-8/episode-62/p8.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(619,62,9,'demo-pages/comic-8/episode-62/p9.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(620,62,10,'demo-pages/comic-8/episode-62/p10.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(621,63,1,'demo-pages/comic-8/episode-63/p1.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(622,63,2,'demo-pages/comic-8/episode-63/p2.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(623,63,3,'demo-pages/comic-8/episode-63/p3.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(624,63,4,'demo-pages/comic-8/episode-63/p4.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(625,63,5,'demo-pages/comic-8/episode-63/p5.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(626,63,6,'demo-pages/comic-8/episode-63/p6.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(627,63,7,'demo-pages/comic-8/episode-63/p7.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(628,63,8,'demo-pages/comic-8/episode-63/p8.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(629,63,9,'demo-pages/comic-8/episode-63/p9.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(630,63,10,'demo-pages/comic-8/episode-63/p10.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(631,64,1,'demo-pages/comic-8/episode-64/p1.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(632,64,2,'demo-pages/comic-8/episode-64/p2.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(633,64,3,'demo-pages/comic-8/episode-64/p3.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(634,64,4,'demo-pages/comic-8/episode-64/p4.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(635,64,5,'demo-pages/comic-8/episode-64/p5.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(636,64,6,'demo-pages/comic-8/episode-64/p6.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(637,64,7,'demo-pages/comic-8/episode-64/p7.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(638,64,8,'demo-pages/comic-8/episode-64/p8.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(639,64,9,'demo-pages/comic-8/episode-64/p9.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(640,64,10,'demo-pages/comic-8/episode-64/p10.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(641,65,1,'demo-pages/comic-9/episode-65/p1.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(642,65,2,'demo-pages/comic-9/episode-65/p2.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(643,65,3,'demo-pages/comic-9/episode-65/p3.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(644,65,4,'demo-pages/comic-9/episode-65/p4.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(645,65,5,'demo-pages/comic-9/episode-65/p5.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(646,65,6,'demo-pages/comic-9/episode-65/p6.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(647,65,7,'demo-pages/comic-9/episode-65/p7.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(648,65,8,'demo-pages/comic-9/episode-65/p8.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(649,65,9,'demo-pages/comic-9/episode-65/p9.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(650,65,10,'demo-pages/comic-9/episode-65/p10.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(651,66,1,'demo-pages/comic-9/episode-66/p1.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(652,66,2,'demo-pages/comic-9/episode-66/p2.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(653,66,3,'demo-pages/comic-9/episode-66/p3.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(654,66,4,'demo-pages/comic-9/episode-66/p4.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(655,66,5,'demo-pages/comic-9/episode-66/p5.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(656,66,6,'demo-pages/comic-9/episode-66/p6.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(657,66,7,'demo-pages/comic-9/episode-66/p7.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(658,66,8,'demo-pages/comic-9/episode-66/p8.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(659,66,9,'demo-pages/comic-9/episode-66/p9.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(660,66,10,'demo-pages/comic-9/episode-66/p10.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(661,67,1,'demo-pages/comic-9/episode-67/p1.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(662,67,2,'demo-pages/comic-9/episode-67/p2.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(663,67,3,'demo-pages/comic-9/episode-67/p3.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(664,67,4,'demo-pages/comic-9/episode-67/p4.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(665,67,5,'demo-pages/comic-9/episode-67/p5.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(666,67,6,'demo-pages/comic-9/episode-67/p6.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(667,67,7,'demo-pages/comic-9/episode-67/p7.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(668,67,8,'demo-pages/comic-9/episode-67/p8.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(669,67,9,'demo-pages/comic-9/episode-67/p9.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(670,67,10,'demo-pages/comic-9/episode-67/p10.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(671,68,1,'demo-pages/comic-9/episode-68/p1.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(672,68,2,'demo-pages/comic-9/episode-68/p2.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(673,68,3,'demo-pages/comic-9/episode-68/p3.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(674,68,4,'demo-pages/comic-9/episode-68/p4.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(675,68,5,'demo-pages/comic-9/episode-68/p5.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(676,68,6,'demo-pages/comic-9/episode-68/p6.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(677,68,7,'demo-pages/comic-9/episode-68/p7.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(678,68,8,'demo-pages/comic-9/episode-68/p8.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(679,68,9,'demo-pages/comic-9/episode-68/p9.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(680,68,10,'demo-pages/comic-9/episode-68/p10.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(681,69,1,'demo-pages/comic-9/episode-69/p1.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(682,69,2,'demo-pages/comic-9/episode-69/p2.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(683,69,3,'demo-pages/comic-9/episode-69/p3.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(684,69,4,'demo-pages/comic-9/episode-69/p4.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(685,69,5,'demo-pages/comic-9/episode-69/p5.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(686,69,6,'demo-pages/comic-9/episode-69/p6.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(687,69,7,'demo-pages/comic-9/episode-69/p7.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(688,69,8,'demo-pages/comic-9/episode-69/p8.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(689,69,9,'demo-pages/comic-9/episode-69/p9.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(690,69,10,'demo-pages/comic-9/episode-69/p10.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(691,70,1,'demo-pages/comic-9/episode-70/p1.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(692,70,2,'demo-pages/comic-9/episode-70/p2.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(693,70,3,'demo-pages/comic-9/episode-70/p3.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(694,70,4,'demo-pages/comic-9/episode-70/p4.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(695,70,5,'demo-pages/comic-9/episode-70/p5.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(696,70,6,'demo-pages/comic-9/episode-70/p6.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(697,70,7,'demo-pages/comic-9/episode-70/p7.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(698,70,8,'demo-pages/comic-9/episode-70/p8.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(699,70,9,'demo-pages/comic-9/episode-70/p9.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(700,70,10,'demo-pages/comic-9/episode-70/p10.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(701,71,1,'demo-pages/comic-9/episode-71/p1.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(702,71,2,'demo-pages/comic-9/episode-71/p2.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(703,71,3,'demo-pages/comic-9/episode-71/p3.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(704,71,4,'demo-pages/comic-9/episode-71/p4.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(705,71,5,'demo-pages/comic-9/episode-71/p5.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(706,71,6,'demo-pages/comic-9/episode-71/p6.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(707,71,7,'demo-pages/comic-9/episode-71/p7.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(708,71,8,'demo-pages/comic-9/episode-71/p8.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(709,71,9,'demo-pages/comic-9/episode-71/p9.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(710,71,10,'demo-pages/comic-9/episode-71/p10.svg','2026-08-23 23:11:13','2026-08-23 23:11:13'),(711,72,1,'demo-pages/comic-9/episode-72/p1.svg','2026-08-23 23:11:14','2026-08-23 23:11:14'),(712,72,2,'demo-pages/comic-9/episode-72/p2.svg','2026-08-23 23:11:14','2026-08-23 23:11:14'),(713,72,3,'demo-pages/comic-9/episode-72/p3.svg','2026-08-23 23:11:14','2026-08-23 23:11:14'),(714,72,4,'demo-pages/comic-9/episode-72/p4.svg','2026-08-23 23:11:14','2026-08-23 23:11:14'),(715,72,5,'demo-pages/comic-9/episode-72/p5.svg','2026-08-23 23:11:14','2026-08-23 23:11:14'),(716,72,6,'demo-pages/comic-9/episode-72/p6.svg','2026-08-23 23:11:14','2026-08-23 23:11:14'),(717,72,7,'demo-pages/comic-9/episode-72/p7.svg','2026-08-23 23:11:14','2026-08-23 23:11:14'),(718,72,8,'demo-pages/comic-9/episode-72/p8.svg','2026-08-23 23:11:14','2026-08-23 23:11:14'),(719,72,9,'demo-pages/comic-9/episode-72/p9.svg','2026-08-23 23:11:14','2026-08-23 23:11:14'),(720,72,10,'demo-pages/comic-9/episode-72/p10.svg','2026-08-23 23:11:14','2026-08-23 23:11:14'),(721,73,1,'demo-pages/comic-10/episode-73/p1.svg','2026-08-23 23:11:14','2026-08-23 23:11:14'),(722,73,2,'demo-pages/comic-10/episode-73/p2.svg','2026-08-23 23:11:14','2026-08-23 23:11:14'),(723,73,3,'demo-pages/comic-10/episode-73/p3.svg','2026-08-23 23:11:14','2026-08-23 23:11:14'),(724,73,4,'demo-pages/comic-10/episode-73/p4.svg','2026-08-23 23:11:14','2026-08-23 23:11:14'),(725,73,5,'demo-pages/comic-10/episode-73/p5.svg','2026-08-23 23:11:14','2026-08-23 23:11:14'),(726,73,6,'demo-pages/comic-10/episode-73/p6.svg','2026-08-23 23:11:14','2026-08-23 23:11:14'),(727,73,7,'demo-pages/comic-10/episode-73/p7.svg','2026-08-23 23:11:14','2026-08-23 23:11:14'),(728,73,8,'demo-pages/comic-10/episode-73/p8.svg','2026-08-23 23:11:14','2026-08-23 23:11:14'),(729,73,9,'demo-pages/comic-10/episode-73/p9.svg','2026-08-23 23:11:14','2026-08-23 23:11:14'),(730,73,10,'demo-pages/comic-10/episode-73/p10.svg','2026-08-23 23:11:14','2026-08-23 23:11:14'),(731,74,1,'demo-pages/comic-10/episode-74/p1.svg','2026-08-23 23:11:14','2026-08-23 23:11:14'),(732,74,2,'demo-pages/comic-10/episode-74/p2.svg','2026-08-23 23:11:14','2026-08-23 23:11:14'),(733,74,3,'demo-pages/comic-10/episode-74/p3.svg','2026-08-23 23:11:14','2026-08-23 23:11:14'),(734,74,4,'demo-pages/comic-10/episode-74/p4.svg','2026-08-23 23:11:14','2026-08-23 23:11:14'),(735,74,5,'demo-pages/comic-10/episode-74/p5.svg','2026-08-23 23:11:14','2026-08-23 23:11:14'),(736,74,6,'demo-pages/comic-10/episode-74/p6.svg','2026-08-23 23:11:14','2026-08-23 23:11:14'),(737,74,7,'demo-pages/comic-10/episode-74/p7.svg','2026-08-23 23:11:14','2026-08-23 23:11:14'),(738,74,8,'demo-pages/comic-10/episode-74/p8.svg','2026-08-23 23:11:14','2026-08-23 23:11:14'),(739,74,9,'demo-pages/comic-10/episode-74/p9.svg','2026-08-23 23:11:14','2026-08-23 23:11:14'),(740,74,10,'demo-pages/comic-10/episode-74/p10.svg','2026-08-23 23:11:14','2026-08-23 23:11:14'),(741,75,1,'demo-pages/comic-10/episode-75/p1.svg','2026-08-23 23:11:14','2026-08-23 23:11:14'),(742,75,2,'demo-pages/comic-10/episode-75/p2.svg','2026-08-23 23:11:14','2026-08-23 23:11:14'),(743,75,3,'demo-pages/comic-10/episode-75/p3.svg','2026-08-23 23:11:14','2026-08-23 23:11:14'),(744,75,4,'demo-pages/comic-10/episode-75/p4.svg','2026-08-23 23:11:14','2026-08-23 23:11:14'),(745,75,5,'demo-pages/comic-10/episode-75/p5.svg','2026-08-23 23:11:14','2026-08-23 23:11:14'),(746,75,6,'demo-pages/comic-10/episode-75/p6.svg','2026-08-23 23:11:14','2026-08-23 23:11:14'),(747,75,7,'demo-pages/comic-10/episode-75/p7.svg','2026-08-23 23:11:14','2026-08-23 23:11:14'),(748,75,8,'demo-pages/comic-10/episode-75/p8.svg','2026-08-23 23:11:14','2026-08-23 23:11:14'),(749,75,9,'demo-pages/comic-10/episode-75/p9.svg','2026-08-23 23:11:14','2026-08-23 23:11:14'),(750,75,10,'demo-pages/comic-10/episode-75/p10.svg','2026-08-23 23:11:14','2026-08-23 23:11:14'),(751,76,1,'demo-pages/comic-10/episode-76/p1.svg','2026-08-23 23:11:14','2026-08-23 23:11:14'),(752,76,2,'demo-pages/comic-10/episode-76/p2.svg','2026-08-23 23:11:14','2026-08-23 23:11:14'),(753,76,3,'demo-pages/comic-10/episode-76/p3.svg','2026-08-23 23:11:14','2026-08-23 23:11:14'),(754,76,4,'demo-pages/comic-10/episode-76/p4.svg','2026-08-23 23:11:14','2026-08-23 23:11:14'),(755,76,5,'demo-pages/comic-10/episode-76/p5.svg','2026-08-23 23:11:14','2026-08-23 23:11:14'),(756,76,6,'demo-pages/comic-10/episode-76/p6.svg','2026-08-23 23:11:14','2026-08-23 23:11:14'),(757,76,7,'demo-pages/comic-10/episode-76/p7.svg','2026-08-23 23:11:14','2026-08-23 23:11:14'),(758,76,8,'demo-pages/comic-10/episode-76/p8.svg','2026-08-23 23:11:14','2026-08-23 23:11:14'),(759,76,9,'demo-pages/comic-10/episode-76/p9.svg','2026-08-23 23:11:14','2026-08-23 23:11:14'),(760,76,10,'demo-pages/comic-10/episode-76/p10.svg','2026-08-23 23:11:14','2026-08-23 23:11:14'),(761,77,1,'demo-pages/comic-10/episode-77/p1.svg','2026-08-23 23:11:14','2026-08-23 23:11:14'),(762,77,2,'demo-pages/comic-10/episode-77/p2.svg','2026-08-23 23:11:14','2026-08-23 23:11:14'),(763,77,3,'demo-pages/comic-10/episode-77/p3.svg','2026-08-23 23:11:14','2026-08-23 23:11:14'),(764,77,4,'demo-pages/comic-10/episode-77/p4.svg','2026-08-23 23:11:14','2026-08-23 23:11:14'),(765,77,5,'demo-pages/comic-10/episode-77/p5.svg','2026-08-23 23:11:14','2026-08-23 23:11:14'),(766,77,6,'demo-pages/comic-10/episode-77/p6.svg','2026-08-23 23:11:14','2026-08-23 23:11:14'),(767,77,7,'demo-pages/comic-10/episode-77/p7.svg','2026-08-23 23:11:14','2026-08-23 23:11:14'),(768,77,8,'demo-pages/comic-10/episode-77/p8.svg','2026-08-23 23:11:14','2026-08-23 23:11:14'),(769,77,9,'demo-pages/comic-10/episode-77/p9.svg','2026-08-23 23:11:14','2026-08-23 23:11:14'),(770,77,10,'demo-pages/comic-10/episode-77/p10.svg','2026-08-23 23:11:14','2026-08-23 23:11:14'),(771,78,1,'demo-pages/comic-10/episode-78/p1.svg','2026-08-23 23:11:14','2026-08-23 23:11:14'),(772,78,2,'demo-pages/comic-10/episode-78/p2.svg','2026-08-23 23:11:14','2026-08-23 23:11:14'),(773,78,3,'demo-pages/comic-10/episode-78/p3.svg','2026-08-23 23:11:14','2026-08-23 23:11:14'),(774,78,4,'demo-pages/comic-10/episode-78/p4.svg','2026-08-23 23:11:14','2026-08-23 23:11:14'),(775,78,5,'demo-pages/comic-10/episode-78/p5.svg','2026-08-23 23:11:14','2026-08-23 23:11:14'),(776,78,6,'demo-pages/comic-10/episode-78/p6.svg','2026-08-23 23:11:14','2026-08-23 23:11:14'),(777,78,7,'demo-pages/comic-10/episode-78/p7.svg','2026-08-23 23:11:14','2026-08-23 23:11:14'),(778,78,8,'demo-pages/comic-10/episode-78/p8.svg','2026-08-23 23:11:14','2026-08-23 23:11:14'),(779,78,9,'demo-pages/comic-10/episode-78/p9.svg','2026-08-23 23:11:14','2026-08-23 23:11:14'),(780,78,10,'demo-pages/comic-10/episode-78/p10.svg','2026-08-23 23:11:14','2026-08-23 23:11:14'),(781,79,1,'demo-pages/comic-10/episode-79/p1.svg','2026-08-23 23:11:14','2026-08-23 23:11:14'),(782,79,2,'demo-pages/comic-10/episode-79/p2.svg','2026-08-23 23:11:14','2026-08-23 23:11:14'),(783,79,3,'demo-pages/comic-10/episode-79/p3.svg','2026-08-23 23:11:14','2026-08-23 23:11:14'),(784,79,4,'demo-pages/comic-10/episode-79/p4.svg','2026-08-23 23:11:14','2026-08-23 23:11:14'),(785,79,5,'demo-pages/comic-10/episode-79/p5.svg','2026-08-23 23:11:14','2026-08-23 23:11:14'),(786,79,6,'demo-pages/comic-10/episode-79/p6.svg','2026-08-23 23:11:14','2026-08-23 23:11:14'),(787,79,7,'demo-pages/comic-10/episode-79/p7.svg','2026-08-23 23:11:14','2026-08-23 23:11:14'),(788,79,8,'demo-pages/comic-10/episode-79/p8.svg','2026-08-23 23:11:14','2026-08-23 23:11:14'),(789,79,9,'demo-pages/comic-10/episode-79/p9.svg','2026-08-23 23:11:14','2026-08-23 23:11:14'),(790,79,10,'demo-pages/comic-10/episode-79/p10.svg','2026-08-23 23:11:14','2026-08-23 23:11:14'),(791,80,1,'demo-pages/comic-10/episode-80/p1.svg','2026-08-23 23:11:14','2026-08-23 23:11:14'),(792,80,2,'demo-pages/comic-10/episode-80/p2.svg','2026-08-23 23:11:14','2026-08-23 23:11:14'),(793,80,3,'demo-pages/comic-10/episode-80/p3.svg','2026-08-23 23:11:14','2026-08-23 23:11:14'),(794,80,4,'demo-pages/comic-10/episode-80/p4.svg','2026-08-23 23:11:14','2026-08-23 23:11:14'),(795,80,5,'demo-pages/comic-10/episode-80/p5.svg','2026-08-23 23:11:14','2026-08-23 23:11:14'),(796,80,6,'demo-pages/comic-10/episode-80/p6.svg','2026-08-23 23:11:14','2026-08-23 23:11:14'),(797,80,7,'demo-pages/comic-10/episode-80/p7.svg','2026-08-23 23:11:14','2026-08-23 23:11:14'),(798,80,8,'demo-pages/comic-10/episode-80/p8.svg','2026-08-23 23:11:14','2026-08-23 23:11:14'),(799,80,9,'demo-pages/comic-10/episode-80/p9.svg','2026-08-23 23:11:14','2026-08-23 23:11:14'),(800,80,10,'demo-pages/comic-10/episode-80/p10.svg','2026-08-23 23:11:14','2026-08-23 23:11:14'),(801,81,1,'demo-pages/comic-11/episode-81/p1.svg','2026-08-23 23:11:14','2026-08-23 23:11:14'),(802,81,2,'demo-pages/comic-11/episode-81/p2.svg','2026-08-23 23:11:14','2026-08-23 23:11:14'),(803,81,3,'demo-pages/comic-11/episode-81/p3.svg','2026-08-23 23:11:14','2026-08-23 23:11:14'),(804,81,4,'demo-pages/comic-11/episode-81/p4.svg','2026-08-23 23:11:14','2026-08-23 23:11:14'),(805,81,5,'demo-pages/comic-11/episode-81/p5.svg','2026-08-23 23:11:14','2026-08-23 23:11:14'),(806,81,6,'demo-pages/comic-11/episode-81/p6.svg','2026-08-23 23:11:14','2026-08-23 23:11:14'),(807,81,7,'demo-pages/comic-11/episode-81/p7.svg','2026-08-23 23:11:14','2026-08-23 23:11:14'),(808,81,8,'demo-pages/comic-11/episode-81/p8.svg','2026-08-23 23:11:14','2026-08-23 23:11:14'),(809,81,9,'demo-pages/comic-11/episode-81/p9.svg','2026-08-23 23:11:14','2026-08-23 23:11:14'),(810,81,10,'demo-pages/comic-11/episode-81/p10.svg','2026-08-23 23:11:14','2026-08-23 23:11:14'),(811,82,1,'demo-pages/comic-11/episode-82/p1.svg','2026-08-23 23:11:14','2026-08-23 23:11:14'),(812,82,2,'demo-pages/comic-11/episode-82/p2.svg','2026-08-23 23:11:14','2026-08-23 23:11:14'),(813,82,3,'demo-pages/comic-11/episode-82/p3.svg','2026-08-23 23:11:14','2026-08-23 23:11:14'),(814,82,4,'demo-pages/comic-11/episode-82/p4.svg','2026-08-23 23:11:14','2026-08-23 23:11:14'),(815,82,5,'demo-pages/comic-11/episode-82/p5.svg','2026-08-23 23:11:14','2026-08-23 23:11:14'),(816,82,6,'demo-pages/comic-11/episode-82/p6.svg','2026-08-23 23:11:14','2026-08-23 23:11:14'),(817,82,7,'demo-pages/comic-11/episode-82/p7.svg','2026-08-23 23:11:14','2026-08-23 23:11:14'),(818,82,8,'demo-pages/comic-11/episode-82/p8.svg','2026-08-23 23:11:14','2026-08-23 23:11:14'),(819,82,9,'demo-pages/comic-11/episode-82/p9.svg','2026-08-23 23:11:14','2026-08-23 23:11:14'),(820,82,10,'demo-pages/comic-11/episode-82/p10.svg','2026-08-23 23:11:14','2026-08-23 23:11:14'),(821,83,1,'demo-pages/comic-11/episode-83/p1.svg','2026-08-23 23:11:14','2026-08-23 23:11:14'),(822,83,2,'demo-pages/comic-11/episode-83/p2.svg','2026-08-23 23:11:14','2026-08-23 23:11:14'),(823,83,3,'demo-pages/comic-11/episode-83/p3.svg','2026-08-23 23:11:14','2026-08-23 23:11:14'),(824,83,4,'demo-pages/comic-11/episode-83/p4.svg','2026-08-23 23:11:14','2026-08-23 23:11:14'),(825,83,5,'demo-pages/comic-11/episode-83/p5.svg','2026-08-23 23:11:14','2026-08-23 23:11:14'),(826,83,6,'demo-pages/comic-11/episode-83/p6.svg','2026-08-23 23:11:14','2026-08-23 23:11:14'),(827,83,7,'demo-pages/comic-11/episode-83/p7.svg','2026-08-23 23:11:14','2026-08-23 23:11:14'),(828,83,8,'demo-pages/comic-11/episode-83/p8.svg','2026-08-23 23:11:14','2026-08-23 23:11:14'),(829,83,9,'demo-pages/comic-11/episode-83/p9.svg','2026-08-23 23:11:14','2026-08-23 23:11:14'),(830,83,10,'demo-pages/comic-11/episode-83/p10.svg','2026-08-23 23:11:14','2026-08-23 23:11:14'),(831,84,1,'demo-pages/comic-11/episode-84/p1.svg','2026-08-23 23:11:14','2026-08-23 23:11:14'),(832,84,2,'demo-pages/comic-11/episode-84/p2.svg','2026-08-23 23:11:14','2026-08-23 23:11:14'),(833,84,3,'demo-pages/comic-11/episode-84/p3.svg','2026-08-23 23:11:14','2026-08-23 23:11:14'),(834,84,4,'demo-pages/comic-11/episode-84/p4.svg','2026-08-23 23:11:14','2026-08-23 23:11:14'),(835,84,5,'demo-pages/comic-11/episode-84/p5.svg','2026-08-23 23:11:14','2026-08-23 23:11:14'),(836,84,6,'demo-pages/comic-11/episode-84/p6.svg','2026-08-23 23:11:14','2026-08-23 23:11:14'),(837,84,7,'demo-pages/comic-11/episode-84/p7.svg','2026-08-23 23:11:14','2026-08-23 23:11:14'),(838,84,8,'demo-pages/comic-11/episode-84/p8.svg','2026-08-23 23:11:14','2026-08-23 23:11:14'),(839,84,9,'demo-pages/comic-11/episode-84/p9.svg','2026-08-23 23:11:14','2026-08-23 23:11:14'),(840,84,10,'demo-pages/comic-11/episode-84/p10.svg','2026-08-23 23:11:14','2026-08-23 23:11:14'),(841,85,1,'demo-pages/comic-11/episode-85/p1.svg','2026-08-23 23:11:14','2026-08-23 23:11:14'),(842,85,2,'demo-pages/comic-11/episode-85/p2.svg','2026-08-23 23:11:14','2026-08-23 23:11:14'),(843,85,3,'demo-pages/comic-11/episode-85/p3.svg','2026-08-23 23:11:14','2026-08-23 23:11:14'),(844,85,4,'demo-pages/comic-11/episode-85/p4.svg','2026-08-23 23:11:14','2026-08-23 23:11:14'),(845,85,5,'demo-pages/comic-11/episode-85/p5.svg','2026-08-23 23:11:14','2026-08-23 23:11:14'),(846,85,6,'demo-pages/comic-11/episode-85/p6.svg','2026-08-23 23:11:14','2026-08-23 23:11:14'),(847,85,7,'demo-pages/comic-11/episode-85/p7.svg','2026-08-23 23:11:14','2026-08-23 23:11:14'),(848,85,8,'demo-pages/comic-11/episode-85/p8.svg','2026-08-23 23:11:15','2026-08-23 23:11:15'),(849,85,9,'demo-pages/comic-11/episode-85/p9.svg','2026-08-23 23:11:15','2026-08-23 23:11:15'),(850,85,10,'demo-pages/comic-11/episode-85/p10.svg','2026-08-23 23:11:15','2026-08-23 23:11:15'),(851,86,1,'demo-pages/comic-11/episode-86/p1.svg','2026-08-23 23:11:15','2026-08-23 23:11:15'),(852,86,2,'demo-pages/comic-11/episode-86/p2.svg','2026-08-23 23:11:15','2026-08-23 23:11:15'),(853,86,3,'demo-pages/comic-11/episode-86/p3.svg','2026-08-23 23:11:15','2026-08-23 23:11:15'),(854,86,4,'demo-pages/comic-11/episode-86/p4.svg','2026-08-23 23:11:15','2026-08-23 23:11:15'),(855,86,5,'demo-pages/comic-11/episode-86/p5.svg','2026-08-23 23:11:15','2026-08-23 23:11:15'),(856,86,6,'demo-pages/comic-11/episode-86/p6.svg','2026-08-23 23:11:15','2026-08-23 23:11:15'),(857,86,7,'demo-pages/comic-11/episode-86/p7.svg','2026-08-23 23:11:15','2026-08-23 23:11:15'),(858,86,8,'demo-pages/comic-11/episode-86/p8.svg','2026-08-23 23:11:15','2026-08-23 23:11:15'),(859,86,9,'demo-pages/comic-11/episode-86/p9.svg','2026-08-23 23:11:15','2026-08-23 23:11:15'),(860,86,10,'demo-pages/comic-11/episode-86/p10.svg','2026-08-23 23:11:15','2026-08-23 23:11:15'),(861,87,1,'demo-pages/comic-11/episode-87/p1.svg','2026-08-23 23:11:15','2026-08-23 23:11:15'),(862,87,2,'demo-pages/comic-11/episode-87/p2.svg','2026-08-23 23:11:15','2026-08-23 23:11:15'),(863,87,3,'demo-pages/comic-11/episode-87/p3.svg','2026-08-23 23:11:15','2026-08-23 23:11:15'),(864,87,4,'demo-pages/comic-11/episode-87/p4.svg','2026-08-23 23:11:15','2026-08-23 23:11:15'),(865,87,5,'demo-pages/comic-11/episode-87/p5.svg','2026-08-23 23:11:15','2026-08-23 23:11:15'),(866,87,6,'demo-pages/comic-11/episode-87/p6.svg','2026-08-23 23:11:15','2026-08-23 23:11:15'),(867,87,7,'demo-pages/comic-11/episode-87/p7.svg','2026-08-23 23:11:15','2026-08-23 23:11:15'),(868,87,8,'demo-pages/comic-11/episode-87/p8.svg','2026-08-23 23:11:15','2026-08-23 23:11:15'),(869,87,9,'demo-pages/comic-11/episode-87/p9.svg','2026-08-23 23:11:15','2026-08-23 23:11:15'),(870,87,10,'demo-pages/comic-11/episode-87/p10.svg','2026-08-23 23:11:15','2026-08-23 23:11:15'),(871,88,1,'demo-pages/comic-11/episode-88/p1.svg','2026-08-23 23:11:15','2026-08-23 23:11:15'),(872,88,2,'demo-pages/comic-11/episode-88/p2.svg','2026-08-23 23:11:15','2026-08-23 23:11:15'),(873,88,3,'demo-pages/comic-11/episode-88/p3.svg','2026-08-23 23:11:15','2026-08-23 23:11:15'),(874,88,4,'demo-pages/comic-11/episode-88/p4.svg','2026-08-23 23:11:15','2026-08-23 23:11:15'),(875,88,5,'demo-pages/comic-11/episode-88/p5.svg','2026-08-23 23:11:15','2026-08-23 23:11:15'),(876,88,6,'demo-pages/comic-11/episode-88/p6.svg','2026-08-23 23:11:15','2026-08-23 23:11:15'),(877,88,7,'demo-pages/comic-11/episode-88/p7.svg','2026-08-23 23:11:15','2026-08-23 23:11:15'),(878,88,8,'demo-pages/comic-11/episode-88/p8.svg','2026-08-23 23:11:15','2026-08-23 23:11:15'),(879,88,9,'demo-pages/comic-11/episode-88/p9.svg','2026-08-23 23:11:15','2026-08-23 23:11:15'),(880,88,10,'demo-pages/comic-11/episode-88/p10.svg','2026-08-23 23:11:15','2026-08-23 23:11:15'),(881,89,1,'demo-pages/comic-12/episode-89/p1.svg','2026-08-23 23:11:15','2026-08-23 23:11:15'),(882,89,2,'demo-pages/comic-12/episode-89/p2.svg','2026-08-23 23:11:15','2026-08-23 23:11:15'),(883,89,3,'demo-pages/comic-12/episode-89/p3.svg','2026-08-23 23:11:15','2026-08-23 23:11:15'),(884,89,4,'demo-pages/comic-12/episode-89/p4.svg','2026-08-23 23:11:15','2026-08-23 23:11:15'),(885,89,5,'demo-pages/comic-12/episode-89/p5.svg','2026-08-23 23:11:15','2026-08-23 23:11:15'),(886,89,6,'demo-pages/comic-12/episode-89/p6.svg','2026-08-23 23:11:15','2026-08-23 23:11:15'),(887,89,7,'demo-pages/comic-12/episode-89/p7.svg','2026-08-23 23:11:15','2026-08-23 23:11:15'),(888,89,8,'demo-pages/comic-12/episode-89/p8.svg','2026-08-23 23:11:15','2026-08-23 23:11:15'),(889,89,9,'demo-pages/comic-12/episode-89/p9.svg','2026-08-23 23:11:15','2026-08-23 23:11:15'),(890,89,10,'demo-pages/comic-12/episode-89/p10.svg','2026-08-23 23:11:15','2026-08-23 23:11:15'),(891,90,1,'demo-pages/comic-12/episode-90/p1.svg','2026-08-23 23:11:15','2026-08-23 23:11:15'),(892,90,2,'demo-pages/comic-12/episode-90/p2.svg','2026-08-23 23:11:15','2026-08-23 23:11:15'),(893,90,3,'demo-pages/comic-12/episode-90/p3.svg','2026-08-23 23:11:15','2026-08-23 23:11:15'),(894,90,4,'demo-pages/comic-12/episode-90/p4.svg','2026-08-23 23:11:15','2026-08-23 23:11:15'),(895,90,5,'demo-pages/comic-12/episode-90/p5.svg','2026-08-23 23:11:15','2026-08-23 23:11:15'),(896,90,6,'demo-pages/comic-12/episode-90/p6.svg','2026-08-23 23:11:15','2026-08-23 23:11:15'),(897,90,7,'demo-pages/comic-12/episode-90/p7.svg','2026-08-23 23:11:15','2026-08-23 23:11:15'),(898,90,8,'demo-pages/comic-12/episode-90/p8.svg','2026-08-23 23:11:15','2026-08-23 23:11:15'),(899,90,9,'demo-pages/comic-12/episode-90/p9.svg','2026-08-23 23:11:15','2026-08-23 23:11:15'),(900,90,10,'demo-pages/comic-12/episode-90/p10.svg','2026-08-23 23:11:15','2026-08-23 23:11:15'),(901,91,1,'demo-pages/comic-12/episode-91/p1.svg','2026-08-23 23:11:15','2026-08-23 23:11:15'),(902,91,2,'demo-pages/comic-12/episode-91/p2.svg','2026-08-23 23:11:15','2026-08-23 23:11:15'),(903,91,3,'demo-pages/comic-12/episode-91/p3.svg','2026-08-23 23:11:15','2026-08-23 23:11:15'),(904,91,4,'demo-pages/comic-12/episode-91/p4.svg','2026-08-23 23:11:15','2026-08-23 23:11:15'),(905,91,5,'demo-pages/comic-12/episode-91/p5.svg','2026-08-23 23:11:15','2026-08-23 23:11:15'),(906,91,6,'demo-pages/comic-12/episode-91/p6.svg','2026-08-23 23:11:15','2026-08-23 23:11:15'),(907,91,7,'demo-pages/comic-12/episode-91/p7.svg','2026-08-23 23:11:15','2026-08-23 23:11:15'),(908,91,8,'demo-pages/comic-12/episode-91/p8.svg','2026-08-23 23:11:15','2026-08-23 23:11:15'),(909,91,9,'demo-pages/comic-12/episode-91/p9.svg','2026-08-23 23:11:15','2026-08-23 23:11:15'),(910,91,10,'demo-pages/comic-12/episode-91/p10.svg','2026-08-23 23:11:15','2026-08-23 23:11:15'),(911,92,1,'demo-pages/comic-12/episode-92/p1.svg','2026-08-23 23:11:15','2026-08-23 23:11:15'),(912,92,2,'demo-pages/comic-12/episode-92/p2.svg','2026-08-23 23:11:15','2026-08-23 23:11:15'),(913,92,3,'demo-pages/comic-12/episode-92/p3.svg','2026-08-23 23:11:15','2026-08-23 23:11:15'),(914,92,4,'demo-pages/comic-12/episode-92/p4.svg','2026-08-23 23:11:15','2026-08-23 23:11:15'),(915,92,5,'demo-pages/comic-12/episode-92/p5.svg','2026-08-23 23:11:15','2026-08-23 23:11:15'),(916,92,6,'demo-pages/comic-12/episode-92/p6.svg','2026-08-23 23:11:15','2026-08-23 23:11:15'),(917,92,7,'demo-pages/comic-12/episode-92/p7.svg','2026-08-23 23:11:15','2026-08-23 23:11:15'),(918,92,8,'demo-pages/comic-12/episode-92/p8.svg','2026-08-23 23:11:15','2026-08-23 23:11:15'),(919,92,9,'demo-pages/comic-12/episode-92/p9.svg','2026-08-23 23:11:15','2026-08-23 23:11:15'),(920,92,10,'demo-pages/comic-12/episode-92/p10.svg','2026-08-23 23:11:15','2026-08-23 23:11:15'),(921,93,1,'demo-pages/comic-12/episode-93/p1.svg','2026-08-23 23:11:15','2026-08-23 23:11:15'),(922,93,2,'demo-pages/comic-12/episode-93/p2.svg','2026-08-23 23:11:15','2026-08-23 23:11:15'),(923,93,3,'demo-pages/comic-12/episode-93/p3.svg','2026-08-23 23:11:15','2026-08-23 23:11:15'),(924,93,4,'demo-pages/comic-12/episode-93/p4.svg','2026-08-23 23:11:15','2026-08-23 23:11:15'),(925,93,5,'demo-pages/comic-12/episode-93/p5.svg','2026-08-23 23:11:15','2026-08-23 23:11:15'),(926,93,6,'demo-pages/comic-12/episode-93/p6.svg','2026-08-23 23:11:15','2026-08-23 23:11:15'),(927,93,7,'demo-pages/comic-12/episode-93/p7.svg','2026-08-23 23:11:15','2026-08-23 23:11:15'),(928,93,8,'demo-pages/comic-12/episode-93/p8.svg','2026-08-23 23:11:15','2026-08-23 23:11:15'),(929,93,9,'demo-pages/comic-12/episode-93/p9.svg','2026-08-23 23:11:15','2026-08-23 23:11:15'),(930,93,10,'demo-pages/comic-12/episode-93/p10.svg','2026-08-23 23:11:15','2026-08-23 23:11:15'),(931,94,1,'demo-pages/comic-12/episode-94/p1.svg','2026-08-23 23:11:15','2026-08-23 23:11:15'),(932,94,2,'demo-pages/comic-12/episode-94/p2.svg','2026-08-23 23:11:15','2026-08-23 23:11:15'),(933,94,3,'demo-pages/comic-12/episode-94/p3.svg','2026-08-23 23:11:15','2026-08-23 23:11:15'),(934,94,4,'demo-pages/comic-12/episode-94/p4.svg','2026-08-23 23:11:15','2026-08-23 23:11:15'),(935,94,5,'demo-pages/comic-12/episode-94/p5.svg','2026-08-23 23:11:15','2026-08-23 23:11:15'),(936,94,6,'demo-pages/comic-12/episode-94/p6.svg','2026-08-23 23:11:15','2026-08-23 23:11:15'),(937,94,7,'demo-pages/comic-12/episode-94/p7.svg','2026-08-23 23:11:15','2026-08-23 23:11:15'),(938,94,8,'demo-pages/comic-12/episode-94/p8.svg','2026-08-23 23:11:15','2026-08-23 23:11:15'),(939,94,9,'demo-pages/comic-12/episode-94/p9.svg','2026-08-23 23:11:15','2026-08-23 23:11:15'),(940,94,10,'demo-pages/comic-12/episode-94/p10.svg','2026-08-23 23:11:15','2026-08-23 23:11:15'),(941,95,1,'demo-pages/comic-12/episode-95/p1.svg','2026-08-23 23:11:15','2026-08-23 23:11:15'),(942,95,2,'demo-pages/comic-12/episode-95/p2.svg','2026-08-23 23:11:15','2026-08-23 23:11:15'),(943,95,3,'demo-pages/comic-12/episode-95/p3.svg','2026-08-23 23:11:15','2026-08-23 23:11:15'),(944,95,4,'demo-pages/comic-12/episode-95/p4.svg','2026-08-23 23:11:15','2026-08-23 23:11:15'),(945,95,5,'demo-pages/comic-12/episode-95/p5.svg','2026-08-23 23:11:15','2026-08-23 23:11:15'),(946,95,6,'demo-pages/comic-12/episode-95/p6.svg','2026-08-23 23:11:15','2026-08-23 23:11:15'),(947,95,7,'demo-pages/comic-12/episode-95/p7.svg','2026-08-23 23:11:15','2026-08-23 23:11:15'),(948,95,8,'demo-pages/comic-12/episode-95/p8.svg','2026-08-23 23:11:15','2026-08-23 23:11:15'),(949,95,9,'demo-pages/comic-12/episode-95/p9.svg','2026-08-23 23:11:15','2026-08-23 23:11:15'),(950,95,10,'demo-pages/comic-12/episode-95/p10.svg','2026-08-23 23:11:15','2026-08-23 23:11:15'),(951,96,1,'demo-pages/comic-12/episode-96/p1.svg','2026-08-23 23:11:15','2026-08-23 23:11:15'),(952,96,2,'demo-pages/comic-12/episode-96/p2.svg','2026-08-23 23:11:15','2026-08-23 23:11:15'),(953,96,3,'demo-pages/comic-12/episode-96/p3.svg','2026-08-23 23:11:15','2026-08-23 23:11:15'),(954,96,4,'demo-pages/comic-12/episode-96/p4.svg','2026-08-23 23:11:15','2026-08-23 23:11:15'),(955,96,5,'demo-pages/comic-12/episode-96/p5.svg','2026-08-23 23:11:15','2026-08-23 23:11:15'),(956,96,6,'demo-pages/comic-12/episode-96/p6.svg','2026-08-23 23:11:15','2026-08-23 23:11:15'),(957,96,7,'demo-pages/comic-12/episode-96/p7.svg','2026-08-23 23:11:15','2026-08-23 23:11:15'),(958,96,8,'demo-pages/comic-12/episode-96/p8.svg','2026-08-23 23:11:15','2026-08-23 23:11:15'),(959,96,9,'demo-pages/comic-12/episode-96/p9.svg','2026-08-23 23:11:15','2026-08-23 23:11:15'),(960,96,10,'demo-pages/comic-12/episode-96/p10.svg','2026-08-23 23:11:15','2026-08-23 23:11:15');
/*!40000 ALTER TABLE `episode_pages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `episode_unlocks`
--

DROP TABLE IF EXISTS `episode_unlocks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `episode_unlocks` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `episode_id` bigint unsigned NOT NULL,
  `transaction_id` bigint unsigned DEFAULT NULL,
  `coins_spent` int unsigned NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `episode_unlocks_user_id_episode_id_unique` (`user_id`,`episode_id`),
  KEY `episode_unlocks_episode_id_foreign` (`episode_id`),
  KEY `episode_unlocks_transaction_id_foreign` (`transaction_id`),
  CONSTRAINT `episode_unlocks_episode_id_foreign` FOREIGN KEY (`episode_id`) REFERENCES `episodes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `episode_unlocks_transaction_id_foreign` FOREIGN KEY (`transaction_id`) REFERENCES `transactions` (`id`) ON DELETE SET NULL,
  CONSTRAINT `episode_unlocks_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `episode_unlocks`
--

LOCK TABLES `episode_unlocks` WRITE;
/*!40000 ALTER TABLE `episode_unlocks` DISABLE KEYS */;
/*!40000 ALTER TABLE `episode_unlocks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `episodes`
--

DROP TABLE IF EXISTS `episodes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `episodes` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `comic_id` bigint unsigned NOT NULL,
  `title` varchar(140) COLLATE utf8mb4_unicode_ci NOT NULL,
  `number` int unsigned NOT NULL,
  `status` enum('draft','published') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft',
  `is_premium` tinyint(1) NOT NULL DEFAULT '0',
  `price_coin` int unsigned NOT NULL DEFAULT '0',
  `view_count` bigint unsigned NOT NULL DEFAULT '0',
  `like_count` bigint unsigned NOT NULL DEFAULT '0',
  `published_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `episodes_comic_id_number_unique` (`comic_id`,`number`),
  KEY `episodes_status_published_at_index` (`status`,`published_at`),
  CONSTRAINT `episodes_comic_id_foreign` FOREIGN KEY (`comic_id`) REFERENCES `comics` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=97 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `episodes`
--

LOCK TABLES `episodes` WRITE;
/*!40000 ALTER TABLE `episodes` DISABLE KEYS */;
INSERT INTO `episodes` VALUES (1,1,'Episode 1: Awal Perjalanan',1,'published',0,0,46691,1438,'2026-08-08 23:11:09',NULL,'2026-08-23 23:11:09','2026-08-23 23:11:09'),(2,1,'Episode 2: Jejak yang Hilang',2,'published',0,0,51360,1582,'2026-08-10 23:11:09',NULL,'2026-08-23 23:11:09','2026-08-23 23:11:09'),(3,1,'Episode 3: Pertemuan Tak Terduga',3,'published',0,0,57067,1758,'2026-08-12 23:11:09',NULL,'2026-08-23 23:11:09','2026-08-23 23:11:09'),(4,1,'Episode 4: Rahasia Terbongkar',4,'published',0,0,64200,1978,'2026-08-14 23:11:09',NULL,'2026-08-23 23:11:09','2026-08-23 23:11:09'),(5,1,'Episode 5: Badai Datang',5,'published',0,0,73371,2260,'2026-08-16 23:11:09',NULL,'2026-08-23 23:11:09','2026-08-23 23:11:09'),(6,1,'Episode 6: Pilihan Sulit',6,'published',1,50,85600,2637,'2026-08-18 23:11:09',NULL,'2026-08-23 23:11:09','2026-08-23 23:11:09'),(7,1,'Episode 7: Bayangan Lama',7,'published',1,50,102720,3164,'2026-08-20 23:11:09',NULL,'2026-08-23 23:11:09','2026-08-23 23:11:09'),(8,1,'Episode 8: Kebangkitan',8,'published',1,50,128400,3955,'2026-08-22 23:11:09',NULL,'2026-08-23 23:11:09','2026-08-23 23:11:09'),(9,2,'Episode 1: Awal Perjalanan',1,'published',0,0,35709,1053,'2026-08-08 23:11:09',NULL,'2026-08-23 23:11:09','2026-08-23 23:11:09'),(10,2,'Episode 2: Jejak yang Hilang',2,'published',0,0,39280,1159,'2026-08-10 23:11:09',NULL,'2026-08-23 23:11:09','2026-08-23 23:11:09'),(11,2,'Episode 3: Pertemuan Tak Terduga',3,'published',0,0,43644,1287,'2026-08-12 23:11:09',NULL,'2026-08-23 23:11:09','2026-08-23 23:11:09'),(12,2,'Episode 4: Rahasia Terbongkar',4,'published',0,0,49100,1448,'2026-08-14 23:11:09',NULL,'2026-08-23 23:11:09','2026-08-23 23:11:09'),(13,2,'Episode 5: Badai Datang',5,'published',0,0,56114,1655,'2026-08-16 23:11:09',NULL,'2026-08-23 23:11:09','2026-08-23 23:11:09'),(14,2,'Episode 6: Pilihan Sulit',6,'published',1,50,65467,1931,'2026-08-18 23:11:09',NULL,'2026-08-23 23:11:09','2026-08-23 23:11:09'),(15,2,'Episode 7: Bayangan Lama',7,'published',1,50,78560,2317,'2026-08-20 23:11:10',NULL,'2026-08-23 23:11:10','2026-08-23 23:11:10'),(16,2,'Episode 8: Kebangkitan',8,'published',1,50,98200,2896,'2026-08-22 23:11:10',NULL,'2026-08-23 23:11:10','2026-08-23 23:11:10'),(17,3,'Episode 1: Awal Perjalanan',1,'published',0,0,27491,920,'2026-08-08 23:11:10',NULL,'2026-08-23 23:11:10','2026-08-23 23:11:10'),(18,3,'Episode 2: Jejak yang Hilang',2,'published',0,0,30240,1012,'2026-08-10 23:11:10',NULL,'2026-08-23 23:11:10','2026-08-23 23:11:10'),(19,3,'Episode 3: Pertemuan Tak Terduga',3,'published',0,0,33600,1124,'2026-08-12 23:11:10',NULL,'2026-08-23 23:11:10','2026-08-23 23:11:10'),(20,3,'Episode 4: Rahasia Terbongkar',4,'published',0,0,37800,1264,'2026-08-14 23:11:10',NULL,'2026-08-23 23:11:10','2026-08-23 23:11:10'),(21,3,'Episode 5: Badai Datang',5,'published',0,0,43200,1445,'2026-08-16 23:11:10',NULL,'2026-08-23 23:11:10','2026-08-23 23:11:10'),(22,3,'Episode 6: Pilihan Sulit',6,'published',1,50,50400,1686,'2026-08-18 23:11:10',NULL,'2026-08-23 23:11:10','2026-08-23 23:11:10'),(23,3,'Episode 7: Bayangan Lama',7,'published',1,50,60480,2023,'2026-08-20 23:11:10',NULL,'2026-08-23 23:11:10','2026-08-23 23:11:10'),(24,3,'Episode 8: Kebangkitan',8,'published',1,50,75600,2529,'2026-08-22 23:11:10',NULL,'2026-08-23 23:11:10','2026-08-23 23:11:10'),(25,4,'Episode 1: Awal Perjalanan',1,'published',0,0,23345,668,'2026-08-08 23:11:10',NULL,'2026-08-23 23:11:10','2026-08-23 23:11:10'),(26,4,'Episode 2: Jejak yang Hilang',2,'published',0,0,25680,735,'2026-08-10 23:11:10',NULL,'2026-08-23 23:11:10','2026-08-23 23:11:10'),(27,4,'Episode 3: Pertemuan Tak Terduga',3,'published',0,0,28533,817,'2026-08-12 23:11:10',NULL,'2026-08-23 23:11:10','2026-08-23 23:11:10'),(28,4,'Episode 4: Rahasia Terbongkar',4,'published',0,0,32100,919,'2026-08-14 23:11:10',NULL,'2026-08-23 23:11:10','2026-08-23 23:11:10'),(29,4,'Episode 5: Badai Datang',5,'published',0,0,36686,1050,'2026-08-16 23:11:11',NULL,'2026-08-23 23:11:11','2026-08-23 23:11:11'),(30,4,'Episode 6: Pilihan Sulit',6,'published',1,50,42800,1225,'2026-08-18 23:11:11',NULL,'2026-08-23 23:11:11','2026-08-23 23:11:11'),(31,4,'Episode 7: Bayangan Lama',7,'published',1,50,51360,1470,'2026-08-20 23:11:11',NULL,'2026-08-23 23:11:11','2026-08-23 23:11:11'),(32,4,'Episode 8: Kebangkitan',8,'published',1,50,64200,1838,'2026-08-22 23:11:11',NULL,'2026-08-23 23:11:11','2026-08-23 23:11:11'),(33,5,'Episode 1: Awal Perjalanan',1,'published',0,0,40182,1266,'2026-08-08 23:11:11',NULL,'2026-08-23 23:11:11','2026-08-23 23:11:11'),(34,5,'Episode 2: Jejak yang Hilang',2,'published',0,0,44200,1393,'2026-08-10 23:11:11',NULL,'2026-08-23 23:11:11','2026-08-23 23:11:11'),(35,5,'Episode 3: Pertemuan Tak Terduga',3,'published',0,0,49111,1548,'2026-08-12 23:11:11',NULL,'2026-08-23 23:11:11','2026-08-23 23:11:11'),(36,5,'Episode 4: Rahasia Terbongkar',4,'published',0,0,55250,1741,'2026-08-14 23:11:11',NULL,'2026-08-23 23:11:11','2026-08-23 23:11:11'),(37,5,'Episode 5: Badai Datang',5,'published',0,0,63143,1990,'2026-08-16 23:11:11',NULL,'2026-08-23 23:11:11','2026-08-23 23:11:11'),(38,5,'Episode 6: Pilihan Sulit',6,'published',1,50,73667,2322,'2026-08-18 23:11:11',NULL,'2026-08-23 23:11:11','2026-08-23 23:11:11'),(39,5,'Episode 7: Bayangan Lama',7,'published',1,50,88400,2786,'2026-08-20 23:11:11',NULL,'2026-08-23 23:11:11','2026-08-23 23:11:11'),(40,5,'Episode 8: Kebangkitan',8,'published',1,50,110500,3483,'2026-08-22 23:11:11',NULL,'2026-08-23 23:11:11','2026-08-23 23:11:11'),(41,6,'Episode 1: Awal Perjalanan',1,'published',0,0,19018,554,'2026-08-08 23:11:11',NULL,'2026-08-23 23:11:11','2026-08-23 23:11:11'),(42,6,'Episode 2: Jejak yang Hilang',2,'published',0,0,20920,609,'2026-08-10 23:11:11',NULL,'2026-08-23 23:11:11','2026-08-23 23:11:11'),(43,6,'Episode 3: Pertemuan Tak Terduga',3,'published',0,0,23244,677,'2026-08-12 23:11:11',NULL,'2026-08-23 23:11:12','2026-08-23 23:11:12'),(44,6,'Episode 4: Rahasia Terbongkar',4,'published',0,0,26150,761,'2026-08-14 23:11:12',NULL,'2026-08-23 23:11:12','2026-08-23 23:11:12'),(45,6,'Episode 5: Badai Datang',5,'published',0,0,29886,870,'2026-08-16 23:11:12',NULL,'2026-08-23 23:11:12','2026-08-23 23:11:12'),(46,6,'Episode 6: Pilihan Sulit',6,'published',1,50,34867,1015,'2026-08-18 23:11:12',NULL,'2026-08-23 23:11:12','2026-08-23 23:11:12'),(47,6,'Episode 7: Bayangan Lama',7,'published',1,50,41840,1218,'2026-08-20 23:11:12',NULL,'2026-08-23 23:11:12','2026-08-23 23:11:12'),(48,6,'Episode 8: Kebangkitan',8,'published',1,50,52300,1523,'2026-08-22 23:11:12',NULL,'2026-08-23 23:11:12','2026-08-23 23:11:12'),(49,7,'Episode 1: Awal Perjalanan',1,'published',0,0,32364,1311,'2026-08-08 23:11:12',NULL,'2026-08-23 23:11:12','2026-08-23 23:11:12'),(50,7,'Episode 2: Jejak yang Hilang',2,'published',0,0,35600,1442,'2026-08-10 23:11:12',NULL,'2026-08-23 23:11:12','2026-08-23 23:11:12'),(51,7,'Episode 3: Pertemuan Tak Terduga',3,'published',0,0,39556,1602,'2026-08-12 23:11:12',NULL,'2026-08-23 23:11:12','2026-08-23 23:11:12'),(52,7,'Episode 4: Rahasia Terbongkar',4,'published',0,0,44500,1803,'2026-08-14 23:11:12',NULL,'2026-08-23 23:11:12','2026-08-23 23:11:12'),(53,7,'Episode 5: Badai Datang',5,'published',0,0,50857,2060,'2026-08-16 23:11:12',NULL,'2026-08-23 23:11:12','2026-08-23 23:11:12'),(54,7,'Episode 6: Pilihan Sulit',6,'published',1,50,59333,2403,'2026-08-18 23:11:12',NULL,'2026-08-23 23:11:12','2026-08-23 23:11:12'),(55,7,'Episode 7: Bayangan Lama',7,'published',1,50,71200,2884,'2026-08-20 23:11:12',NULL,'2026-08-23 23:11:12','2026-08-23 23:11:12'),(56,7,'Episode 8: Kebangkitan',8,'published',1,50,89000,3605,'2026-08-22 23:11:12',NULL,'2026-08-23 23:11:12','2026-08-23 23:11:12'),(57,8,'Episode 1: Awal Perjalanan',1,'published',0,0,24291,716,'2026-08-08 23:11:12',NULL,'2026-08-23 23:11:12','2026-08-23 23:11:12'),(58,8,'Episode 2: Jejak yang Hilang',2,'published',0,0,26720,788,'2026-08-10 23:11:13',NULL,'2026-08-23 23:11:13','2026-08-23 23:11:13'),(59,8,'Episode 3: Pertemuan Tak Terduga',3,'published',0,0,29689,875,'2026-08-12 23:11:13',NULL,'2026-08-23 23:11:13','2026-08-23 23:11:13'),(60,8,'Episode 4: Rahasia Terbongkar',4,'published',0,0,33400,984,'2026-08-14 23:11:13',NULL,'2026-08-23 23:11:13','2026-08-23 23:11:13'),(61,8,'Episode 5: Badai Datang',5,'published',0,0,38171,1125,'2026-08-16 23:11:13',NULL,'2026-08-23 23:11:13','2026-08-23 23:11:13'),(62,8,'Episode 6: Pilihan Sulit',6,'published',1,50,44533,1313,'2026-08-18 23:11:13',NULL,'2026-08-23 23:11:13','2026-08-23 23:11:13'),(63,8,'Episode 7: Bayangan Lama',7,'published',1,50,53440,1575,'2026-08-20 23:11:13',NULL,'2026-08-23 23:11:13','2026-08-23 23:11:13'),(64,8,'Episode 8: Kebangkitan',8,'published',1,50,66800,1969,'2026-08-22 23:11:13',NULL,'2026-08-23 23:11:13','2026-08-23 23:11:13'),(65,9,'Episode 1: Awal Perjalanan',1,'published',0,0,27091,853,'2026-08-08 23:11:13',NULL,'2026-08-23 23:11:13','2026-08-23 23:11:13'),(66,9,'Episode 2: Jejak yang Hilang',2,'published',0,0,29800,938,'2026-08-10 23:11:13',NULL,'2026-08-23 23:11:13','2026-08-23 23:11:13'),(67,9,'Episode 3: Pertemuan Tak Terduga',3,'published',0,0,33111,1042,'2026-08-12 23:11:13',NULL,'2026-08-23 23:11:13','2026-08-23 23:11:13'),(68,9,'Episode 4: Rahasia Terbongkar',4,'published',0,0,37250,1173,'2026-08-14 23:11:13',NULL,'2026-08-23 23:11:13','2026-08-23 23:11:13'),(69,9,'Episode 5: Badai Datang',5,'published',0,0,42571,1340,'2026-08-16 23:11:13',NULL,'2026-08-23 23:11:13','2026-08-23 23:11:13'),(70,9,'Episode 6: Pilihan Sulit',6,'published',1,50,49667,1563,'2026-08-18 23:11:13',NULL,'2026-08-23 23:11:13','2026-08-23 23:11:13'),(71,9,'Episode 7: Bayangan Lama',7,'published',1,50,59600,1876,'2026-08-20 23:11:13',NULL,'2026-08-23 23:11:13','2026-08-23 23:11:13'),(72,9,'Episode 8: Kebangkitan',8,'published',1,50,74500,2345,'2026-08-22 23:11:14',NULL,'2026-08-23 23:11:14','2026-08-23 23:11:14'),(73,10,'Episode 1: Awal Perjalanan',1,'published',0,0,12145,379,'2026-08-08 23:11:14',NULL,'2026-08-23 23:11:14','2026-08-23 23:11:14'),(74,10,'Episode 2: Jejak yang Hilang',2,'published',0,0,13360,417,'2026-08-10 23:11:14',NULL,'2026-08-23 23:11:14','2026-08-23 23:11:14'),(75,10,'Episode 3: Pertemuan Tak Terduga',3,'published',0,0,14844,463,'2026-08-12 23:11:14',NULL,'2026-08-23 23:11:14','2026-08-23 23:11:14'),(76,10,'Episode 4: Rahasia Terbongkar',4,'published',0,0,16700,521,'2026-08-14 23:11:14',NULL,'2026-08-23 23:11:14','2026-08-23 23:11:14'),(77,10,'Episode 5: Badai Datang',5,'published',0,0,19086,595,'2026-08-16 23:11:14',NULL,'2026-08-23 23:11:14','2026-08-23 23:11:14'),(78,10,'Episode 6: Pilihan Sulit',6,'published',1,50,22267,694,'2026-08-18 23:11:14',NULL,'2026-08-23 23:11:14','2026-08-23 23:11:14'),(79,10,'Episode 7: Bayangan Lama',7,'published',1,50,26720,833,'2026-08-20 23:11:14',NULL,'2026-08-23 23:11:14','2026-08-23 23:11:14'),(80,10,'Episode 8: Kebangkitan',8,'published',1,50,33400,1041,'2026-08-22 23:11:14',NULL,'2026-08-23 23:11:14','2026-08-23 23:11:14'),(81,11,'Episode 1: Awal Perjalanan',1,'published',0,0,21345,646,'2026-08-08 23:11:14',NULL,'2026-08-23 23:11:14','2026-08-23 23:11:14'),(82,11,'Episode 2: Jejak yang Hilang',2,'published',0,0,23480,711,'2026-08-10 23:11:14',NULL,'2026-08-23 23:11:14','2026-08-23 23:11:14'),(83,11,'Episode 3: Pertemuan Tak Terduga',3,'published',0,0,26089,789,'2026-08-12 23:11:14',NULL,'2026-08-23 23:11:14','2026-08-23 23:11:14'),(84,11,'Episode 4: Rahasia Terbongkar',4,'published',0,0,29350,888,'2026-08-14 23:11:14',NULL,'2026-08-23 23:11:14','2026-08-23 23:11:14'),(85,11,'Episode 5: Badai Datang',5,'published',0,0,33543,1015,'2026-08-16 23:11:14',NULL,'2026-08-23 23:11:14','2026-08-23 23:11:14'),(86,11,'Episode 6: Pilihan Sulit',6,'published',1,50,39133,1184,'2026-08-18 23:11:15',NULL,'2026-08-23 23:11:15','2026-08-23 23:11:15'),(87,11,'Episode 7: Bayangan Lama',7,'published',1,50,46960,1421,'2026-08-20 23:11:15',NULL,'2026-08-23 23:11:15','2026-08-23 23:11:15'),(88,11,'Episode 8: Kebangkitan',8,'published',1,50,58700,1776,'2026-08-22 23:11:15',NULL,'2026-08-23 23:11:15','2026-08-23 23:11:15'),(89,12,'Episode 1: Awal Perjalanan',1,'published',0,0,10509,312,'2026-08-08 23:11:15',NULL,'2026-08-23 23:11:15','2026-08-23 23:11:15'),(90,12,'Episode 2: Jejak yang Hilang',2,'published',0,0,11560,343,'2026-08-10 23:11:15',NULL,'2026-08-23 23:11:15','2026-08-23 23:11:15'),(91,12,'Episode 3: Pertemuan Tak Terduga',3,'published',0,0,12844,381,'2026-08-12 23:11:15',NULL,'2026-08-23 23:11:15','2026-08-23 23:11:15'),(92,12,'Episode 4: Rahasia Terbongkar',4,'published',0,0,14450,429,'2026-08-14 23:11:15',NULL,'2026-08-23 23:11:15','2026-08-23 23:11:15'),(93,12,'Episode 5: Badai Datang',5,'published',0,0,16514,490,'2026-08-16 23:11:15',NULL,'2026-08-23 23:11:15','2026-08-23 23:11:15'),(94,12,'Episode 6: Pilihan Sulit',6,'published',1,50,19267,572,'2026-08-18 23:11:15',NULL,'2026-08-23 23:11:15','2026-08-23 23:11:15'),(95,12,'Episode 7: Bayangan Lama',7,'published',1,50,23120,686,'2026-08-20 23:11:15',NULL,'2026-08-23 23:11:15','2026-08-23 23:11:15'),(96,12,'Episode 8: Kebangkitan',8,'published',1,50,28900,858,'2026-08-22 23:11:15',NULL,'2026-08-23 23:11:15','2026-08-23 23:11:15');
/*!40000 ALTER TABLE `episodes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `failed_jobs`
--

DROP TABLE IF EXISTS `failed_jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `failed_jobs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `connection` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `queue` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `exception` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `failed_jobs`
--

LOCK TABLES `failed_jobs` WRITE;
/*!40000 ALTER TABLE `failed_jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `failed_jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `follows`
--

DROP TABLE IF EXISTS `follows`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `follows` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `comic_id` bigint unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `follows_user_id_comic_id_unique` (`user_id`,`comic_id`),
  KEY `follows_comic_id_foreign` (`comic_id`),
  CONSTRAINT `follows_comic_id_foreign` FOREIGN KEY (`comic_id`) REFERENCES `comics` (`id`) ON DELETE CASCADE,
  CONSTRAINT `follows_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `follows`
--

LOCK TABLES `follows` WRITE;
/*!40000 ALTER TABLE `follows` DISABLE KEYS */;
/*!40000 ALTER TABLE `follows` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `genres`
--

DROP TABLE IF EXISTS `genres`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `genres` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `slug` varchar(60) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(60) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `genres_slug_unique` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `genres`
--

LOCK TABLES `genres` WRITE;
/*!40000 ALTER TABLE `genres` DISABLE KEYS */;
INSERT INTO `genres` VALUES (1,'action','Action','2026-08-23 23:11:04','2026-08-23 23:11:04'),(2,'romance','Romance','2026-08-23 23:11:04','2026-08-23 23:11:04'),(3,'fantasy','Fantasy','2026-08-23 23:11:04','2026-08-23 23:11:04'),(4,'drama','Drama','2026-08-23 23:11:04','2026-08-23 23:11:04'),(5,'comedy','Komedi','2026-08-23 23:11:04','2026-08-23 23:11:04'),(6,'horror','Horor','2026-08-23 23:11:04','2026-08-23 23:11:04'),(7,'sci-fi','Sci-Fi','2026-08-23 23:11:04','2026-08-23 23:11:04'),(8,'slice-of-life','Slice of Life','2026-08-23 23:11:04','2026-08-23 23:11:04'),(9,'thriller','Thriller','2026-08-23 23:11:04','2026-08-23 23:11:04'),(10,'adventure','Petualangan','2026-08-23 23:11:04','2026-08-23 23:11:04');
/*!40000 ALTER TABLE `genres` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `likes`
--

DROP TABLE IF EXISTS `likes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `likes` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `likeable_id` bigint unsigned NOT NULL,
  `likeable_type` varchar(60) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `likes_user_likeable_unique` (`user_id`,`likeable_id`,`likeable_type`),
  KEY `likes_likeable_type_likeable_id_index` (`likeable_type`,`likeable_id`),
  CONSTRAINT `likes_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `likes`
--

LOCK TABLES `likes` WRITE;
/*!40000 ALTER TABLE `likes` DISABLE KEYS */;
/*!40000 ALTER TABLE `likes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `migrations`
--

DROP TABLE IF EXISTS `migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `migrations` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=38 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `migrations`
--

LOCK TABLES `migrations` WRITE;
/*!40000 ALTER TABLE `migrations` DISABLE KEYS */;
INSERT INTO `migrations` VALUES (1,'2014_10_12_000000_create_users_table',1),(2,'2014_10_12_100000_create_password_reset_tokens_table',1),(3,'2019_08_19_000000_create_failed_jobs_table',1),(4,'2019_12_14_000001_create_personal_access_tokens_table',1),(5,'2026_08_10_000001_add_role_and_profile_to_users_table',1),(6,'2026_08_10_000002_create_creator_profiles_table',1),(7,'2026_08_10_000003_create_genres_table',1),(8,'2026_08_10_000004_create_comics_table',1),(9,'2026_08_10_000005_create_comic_genres_table',1),(10,'2026_08_10_000006_create_episodes_table',1),(11,'2026_08_10_000007_create_episode_pages_table',1),(12,'2026_08_10_000008_create_comments_table',1),(13,'2026_08_10_000009_create_likes_table',1),(14,'2026_08_10_000010_create_bookmarks_table',1),(15,'2026_08_10_000011_create_reading_histories_table',1),(16,'2026_08_10_000012_create_follows_table',1),(17,'2026_08_10_000013_create_ratings_table',1),(18,'2026_08_10_000014_create_notifications_table',1),(19,'2026_08_10_000015_create_reports_table',1),(20,'2026_08_10_000016_create_wallets_table',1),(21,'2026_08_10_000017_create_coin_packages_table',1),(22,'2026_08_10_000018_create_transactions_table',1),(23,'2026_08_10_000019_create_episode_unlocks_table',1),(24,'2026_08_10_000020_create_creator_earnings_table',1),(25,'2026_08_10_000021_create_withdrawals_table',1),(26,'2026_08_10_000022_create_user_xp_table',1),(27,'2026_08_10_000023_create_achievements_table',1),(28,'2026_08_10_000024_create_user_achievements_table',1),(29,'2026_08_10_000025_create_reading_streaks_table',1),(30,'2026_08_11_000000_add_admin_note_to_reports_table',1),(31,'2026_08_11_000001_add_transaction_id_to_withdrawals_table',1),(32,'2026_08_12_000000_add_last_login_at_to_user_xp_table',1),(33,'2026_08_13_000001_create_push_subscriptions_table',1),(34,'2026_08_17_000001_add_email_verification_code_to_users_table',1),(35,'2026_08_21_000001_create_creator_applications_table',1),(36,'2026_08_24_000001_add_premium_to_users_table',1),(37,'2026_08_24_000002_create_subscriptions_table',1);
/*!40000 ALTER TABLE `migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint unsigned NOT NULL,
  `type` varchar(60) COLLATE utf8mb4_unicode_ci NOT NULL,
  `data` json DEFAULT NULL,
  `read_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `notifications_user_id_read_at_index` (`user_id`,`read_at`),
  CONSTRAINT `notifications_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_reset_tokens`
--

DROP TABLE IF EXISTS `password_reset_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_reset_tokens`
--

LOCK TABLES `password_reset_tokens` WRITE;
/*!40000 ALTER TABLE `password_reset_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `password_reset_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `personal_access_tokens`
--

DROP TABLE IF EXISTS `personal_access_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `personal_access_tokens` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `tokenable_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tokenable_id` bigint unsigned NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `abilities` text COLLATE utf8mb4_unicode_ci,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `personal_access_tokens`
--

LOCK TABLES `personal_access_tokens` WRITE;
/*!40000 ALTER TABLE `personal_access_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `personal_access_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `push_subscriptions`
--

DROP TABLE IF EXISTS `push_subscriptions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `push_subscriptions` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint unsigned NOT NULL,
  `endpoint` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `keys` json DEFAULT NULL,
  `user_agent` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `push_subscriptions_endpoint_unique` (`endpoint`),
  KEY `push_subscriptions_user_id_created_at_index` (`user_id`,`created_at`),
  CONSTRAINT `push_subscriptions_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `push_subscriptions`
--

LOCK TABLES `push_subscriptions` WRITE;
/*!40000 ALTER TABLE `push_subscriptions` DISABLE KEYS */;
/*!40000 ALTER TABLE `push_subscriptions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ratings`
--

DROP TABLE IF EXISTS `ratings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ratings` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `comic_id` bigint unsigned NOT NULL,
  `score` tinyint NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ratings_user_id_comic_id_unique` (`user_id`,`comic_id`),
  KEY `ratings_comic_id_foreign` (`comic_id`),
  KEY `ratings_score_index` (`score`),
  CONSTRAINT `ratings_comic_id_foreign` FOREIGN KEY (`comic_id`) REFERENCES `comics` (`id`) ON DELETE CASCADE,
  CONSTRAINT `ratings_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ratings`
--

LOCK TABLES `ratings` WRITE;
/*!40000 ALTER TABLE `ratings` DISABLE KEYS */;
/*!40000 ALTER TABLE `ratings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reading_histories`
--

DROP TABLE IF EXISTS `reading_histories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reading_histories` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `comic_id` bigint unsigned NOT NULL,
  `episode_id` bigint unsigned NOT NULL,
  `last_page` int unsigned NOT NULL DEFAULT '1',
  `progress` decimal(5,2) NOT NULL DEFAULT '0.00',
  `is_completed` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `reading_histories_user_id_comic_id_episode_id_unique` (`user_id`,`comic_id`,`episode_id`),
  KEY `reading_histories_comic_id_foreign` (`comic_id`),
  KEY `reading_histories_episode_id_foreign` (`episode_id`),
  KEY `reading_histories_user_id_updated_at_index` (`user_id`,`updated_at`),
  CONSTRAINT `reading_histories_comic_id_foreign` FOREIGN KEY (`comic_id`) REFERENCES `comics` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reading_histories_episode_id_foreign` FOREIGN KEY (`episode_id`) REFERENCES `episodes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reading_histories_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reading_histories`
--

LOCK TABLES `reading_histories` WRITE;
/*!40000 ALTER TABLE `reading_histories` DISABLE KEYS */;
/*!40000 ALTER TABLE `reading_histories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reading_streaks`
--

DROP TABLE IF EXISTS `reading_streaks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reading_streaks` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `current_streak` int unsigned NOT NULL DEFAULT '0',
  `longest_streak` int unsigned NOT NULL DEFAULT '0',
  `last_read_at` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `reading_streaks_user_id_unique` (`user_id`),
  CONSTRAINT `reading_streaks_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reading_streaks`
--

LOCK TABLES `reading_streaks` WRITE;
/*!40000 ALTER TABLE `reading_streaks` DISABLE KEYS */;
/*!40000 ALTER TABLE `reading_streaks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reports`
--

DROP TABLE IF EXISTS `reports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reports` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `reporter_id` bigint unsigned NOT NULL,
  `reportable_id` bigint unsigned NOT NULL,
  `reportable_type` varchar(60) COLLATE utf8mb4_unicode_ci NOT NULL,
  `reason` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `admin_note` text COLLATE utf8mb4_unicode_ci,
  `status` enum('pending','resolved','dismissed') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `handled_by` bigint unsigned DEFAULT NULL,
  `handled_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `reports_reporter_id_foreign` (`reporter_id`),
  KEY `reports_handled_by_foreign` (`handled_by`),
  KEY `reports_reportable_type_reportable_id_index` (`reportable_type`,`reportable_id`),
  KEY `reports_status_index` (`status`),
  CONSTRAINT `reports_handled_by_foreign` FOREIGN KEY (`handled_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `reports_reporter_id_foreign` FOREIGN KEY (`reporter_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reports`
--

LOCK TABLES `reports` WRITE;
/*!40000 ALTER TABLE `reports` DISABLE KEYS */;
/*!40000 ALTER TABLE `reports` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `subscriptions`
--

DROP TABLE IF EXISTS `subscriptions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `subscriptions` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `plan` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'monthly',
  `amount` decimal(10,2) NOT NULL,
  `payment_method` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payment_status` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `starts_at` timestamp NOT NULL,
  `expires_at` timestamp NOT NULL,
  `paid_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `subscriptions_user_id_payment_status_index` (`user_id`,`payment_status`),
  CONSTRAINT `subscriptions_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subscriptions`
--

LOCK TABLES `subscriptions` WRITE;
/*!40000 ALTER TABLE `subscriptions` DISABLE KEYS */;
/*!40000 ALTER TABLE `subscriptions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `transactions`
--

DROP TABLE IF EXISTS `transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `transactions` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `reference` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('coin_purchase','episode_unlock','earning','withdrawal') COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('pending','success','failed','refunded') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `amount` decimal(12,2) NOT NULL DEFAULT '0.00',
  `coins` bigint unsigned NOT NULL DEFAULT '0',
  `payment_method` varchar(40) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payment_ref` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `paid_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `transactions_reference_unique` (`reference`),
  KEY `transactions_user_id_type_status_index` (`user_id`,`type`,`status`),
  CONSTRAINT `transactions_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transactions`
--

LOCK TABLES `transactions` WRITE;
/*!40000 ALTER TABLE `transactions` DISABLE KEYS */;
/*!40000 ALTER TABLE `transactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_achievements`
--

DROP TABLE IF EXISTS `user_achievements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_achievements` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `achievement_id` bigint unsigned NOT NULL,
  `earned_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_achievements_user_id_achievement_id_unique` (`user_id`,`achievement_id`),
  KEY `user_achievements_achievement_id_foreign` (`achievement_id`),
  CONSTRAINT `user_achievements_achievement_id_foreign` FOREIGN KEY (`achievement_id`) REFERENCES `achievements` (`id`) ON DELETE CASCADE,
  CONSTRAINT `user_achievements_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_achievements`
--

LOCK TABLES `user_achievements` WRITE;
/*!40000 ALTER TABLE `user_achievements` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_achievements` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_xp`
--

DROP TABLE IF EXISTS `user_xp`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_xp` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `total_xp` bigint unsigned NOT NULL DEFAULT '0',
  `level` int unsigned NOT NULL DEFAULT '1',
  `last_login_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_xp_user_id_unique` (`user_id`),
  CONSTRAINT `user_xp_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_xp`
--

LOCK TABLES `user_xp` WRITE;
/*!40000 ALTER TABLE `user_xp` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_xp` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `username` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('reader','creator','admin') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'reader',
  `avatar_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `coin_balance` bigint unsigned NOT NULL DEFAULT '0',
  `is_premium` tinyint(1) NOT NULL DEFAULT '0',
  `premium_until` timestamp NULL DEFAULT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `email_verification_code` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email_verification_code_expires_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `remember_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`),
  UNIQUE KEY `users_username_unique` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Admin COMIKA','admin','admin@comika.test','admin',NULL,0,0,NULL,'2026-08-23 23:11:04',NULL,NULL,'$2y$12$QFyW2K7B2adLznqi1Ci9KuwFMkMwzyEzoiRT72cCYA2VRRDJvumZ.','hJqPTWso35','2026-08-23 23:11:04','2026-08-23 23:11:04',NULL),(2,'Kobe O\'Connell','danyka80','ransom.hagenes@example.net','creator',NULL,0,0,NULL,'2026-08-23 23:11:04',NULL,NULL,'$2y$12$4GygRHufZ709fy5pj9IzF.IlMXgpOxkkGmWIqRY4cP/VUiraIkhuS','ac3pWNW33Q','2026-08-23 23:11:06','2026-08-23 23:11:06',NULL),(3,'Prof. Christian Johnston','schaden.helga','valerie22@example.org','creator',NULL,0,0,NULL,'2026-08-23 23:11:05',NULL,NULL,'$2y$12$1P5IB.5S0xP62fWsq8LZHegL1G8WhjrFzw2Q69PwlllEqDaylZMX6','mEOcswOIDe','2026-08-23 23:11:06','2026-08-23 23:11:06',NULL),(4,'Prof. Aleen Monahan PhD','zelda35','verdie66@example.net','creator',NULL,0,0,NULL,'2026-08-23 23:11:05',NULL,NULL,'$2y$12$VHvOE.QrHER5o5k6Uk6yZ.j.pKp/tUL.vUjOB6hcvrbXRMVxKzNSy','XrLg9EFFpz','2026-08-23 23:11:06','2026-08-23 23:11:06',NULL),(5,'Scot Abbott','lind.blaze','uheidenreich@example.com','reader',NULL,0,0,NULL,'2026-08-23 23:11:06',NULL,NULL,'$2y$12$vK12m2UeTK79oxSeO7MR8ulYY4jJ7OyL8NZ42ilf4QIf0OcayOaJK','OS1Vjy98S3','2026-08-23 23:11:08','2026-08-23 23:11:08',NULL),(6,'Micah Stokes','maurice38','nathaniel52@example.net','reader',NULL,0,0,NULL,'2026-08-23 23:11:06',NULL,NULL,'$2y$12$BOJXcWGn6HpnJ2wwbSt34eEjCmIz/xw9xPUzY46FCDQok3pRn.uHi','mUeaIuW933','2026-08-23 23:11:08','2026-08-23 23:11:08',NULL),(7,'Shaylee Ziemann','nitzsche.cathryn','rhessel@example.com','reader',NULL,0,0,NULL,'2026-08-23 23:11:07',NULL,NULL,'$2y$12$50PVrlnPDUSUoKrpUIXPfe9AnX.75SaoT27wCOZAHKROpWQitlNZy','N8FNTrr8ur','2026-08-23 23:11:08','2026-08-23 23:11:08',NULL),(8,'Sean Buckridge','verda.dach','alysha60@example.org','reader',NULL,0,0,NULL,'2026-08-23 23:11:07',NULL,NULL,'$2y$12$k2K3qR0fBUbmGLiAFX3RmObdp/ZmQCd42NZ7MuhF7EhIXmOjpJtwi','PGYRF2OHNk','2026-08-23 23:11:08','2026-08-23 23:11:08',NULL),(9,'Henriette Bartoletti','shawn49','yschumm@example.com','reader',NULL,0,0,NULL,'2026-08-23 23:11:07',NULL,NULL,'$2y$12$WtgYARHEjlEIwEjZoCOYq./bq6zXr0CnfrHtyeX7lfrgtd.uAGGh2','38Q1ILhwib','2026-08-23 23:11:08','2026-08-23 23:11:08',NULL),(10,'Budi Pembaca','budi','budi@comika.test','reader',NULL,500,0,NULL,'2026-08-23 23:11:08',NULL,NULL,'$2y$12$OZsMDbNNlJBVMB2sgV0JieZK44YsUzse48chzF2wqvlVkeQqPbmOq','AdC3MVedmh','2026-08-23 23:11:08','2026-08-23 23:11:08',NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `wallets`
--

DROP TABLE IF EXISTS `wallets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `wallets` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `coin_balance` bigint unsigned NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `wallets_user_id_unique` (`user_id`),
  CONSTRAINT `wallets_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `wallets`
--

LOCK TABLES `wallets` WRITE;
/*!40000 ALTER TABLE `wallets` DISABLE KEYS */;
INSERT INTO `wallets` VALUES (1,1,0,'2026-08-23 23:11:08','2026-08-23 23:11:08'),(2,2,0,'2026-08-23 23:11:08','2026-08-23 23:11:08'),(3,3,0,'2026-08-23 23:11:08','2026-08-23 23:11:08'),(4,4,0,'2026-08-23 23:11:08','2026-08-23 23:11:08'),(5,5,0,'2026-08-23 23:11:08','2026-08-23 23:11:08'),(6,6,0,'2026-08-23 23:11:08','2026-08-23 23:11:08'),(7,7,0,'2026-08-23 23:11:08','2026-08-23 23:11:08'),(8,8,0,'2026-08-23 23:11:08','2026-08-23 23:11:08'),(9,9,0,'2026-08-23 23:11:08','2026-08-23 23:11:08'),(10,10,500,'2026-08-23 23:11:08','2026-08-23 23:11:08');
/*!40000 ALTER TABLE `wallets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `withdrawals`
--

DROP TABLE IF EXISTS `withdrawals`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `withdrawals` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `creator_id` bigint unsigned NOT NULL,
  `transaction_id` bigint unsigned DEFAULT NULL,
  `amount` decimal(12,2) NOT NULL,
  `status` enum('pending','approved','rejected','paid') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `bank_name` varchar(60) COLLATE utf8mb4_unicode_ci NOT NULL,
  `bank_account` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `bank_holder` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `admin_note` text COLLATE utf8mb4_unicode_ci,
  `processed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `withdrawals_creator_id_status_index` (`creator_id`,`status`),
  KEY `withdrawals_transaction_id_foreign` (`transaction_id`),
  CONSTRAINT `withdrawals_creator_id_foreign` FOREIGN KEY (`creator_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `withdrawals_transaction_id_foreign` FOREIGN KEY (`transaction_id`) REFERENCES `transactions` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `withdrawals`
--

LOCK TABLES `withdrawals` WRITE;
/*!40000 ALTER TABLE `withdrawals` DISABLE KEYS */;
/*!40000 ALTER TABLE `withdrawals` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-08-24 13:11:31

<?php
/**
 * ONE-TIME MIGRATION SCRIPT
 * Jalankan sekali untuk menambah kolom is_vvip dan vvip_until ke tabel users
 * 
 * CARA PAKAI:
 * 1. Upload file ini ke public_html/app/public/
 * 2. Buka: https://comika.free.nf/migrate_vvip.php
 * 3. HAPUS file ini setelah berhasil!
 */

// Prevent direct access without confirmation
if (!isset($_GET['run'])) {
    echo '<!DOCTYPE html>
<html>
<head>
    <title>Migration VVIP - COMIKA</title>
    <style>
        body { font-family: sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; background: #1a1a2e; color: #e0e0e0; }
        h1 { color: #a855f7; }
        .btn { display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #a855f7, #ec4899); color: white; text-decoration: none; border-radius: 8px; font-weight: bold; }
        .btn:hover { opacity: 0.9; }
        .warning { background: #7f1d1d; border: 1px solid #ef4444; padding: 15px; border-radius: 8px; margin: 20px 0; }
    </style>
</head>
<body>
    <h1>🔧 Migration VVIP</h1>
    <p>Script ini akan menambah kolom <code>is_vvip</code> dan <code>vvip_until</code> ke tabel users.</p>
    <div class="warning">
        <strong>⚠️ Peringatan:</strong> Jalankan script ini HANYA SEKALI. Setelah berhasil, hapus file ini!
    </div>
    <p><a href="?run=1&confirm=yes" class="btn" onclick="return confirm(\'Jalankan migration sekarang?\')"> Jalankan Migration </a></p>
</body>
</html>';
    exit;
}

// Database config
$host = 'sql310.infinityfree.com';
$dbname = 'if0_42760113_komika';
$username = 'if0_42760113';
$password = 't9nrXR1j21oxcF';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    ]);

    $results = [];
    
    // Check if columns already exist
    $stmt = $pdo->query("SHOW COLUMNS FROM users LIKE 'is_vvip'");
    $columnExists = $stmt->fetch();
    
    if ($columnExists) {
        echo '<!DOCTYPE html>
<html>
<head><title>Migration - Sudah Selesai</title>
<style>body { font-family: sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; background: #1a1a2e; color: #e0e0e0; } h1 { color: #22c55e; }</style>
</head>
<body>
    <h1>✅ Sudah Berhasil!</h1>
    <p>Kolom <code>is_vvip</code> sudah ada di database. Tidak perlu menjalankan migration lagi.</p>
    <p>Hapus file <code>migrate_vvip.php</code> dari server.</p>
</body>
</html>';
        exit;
    }

    // Add is_vvip column
    $pdo->exec("ALTER TABLE `users` ADD COLUMN `is_vvip` TINYINT(1) NOT NULL DEFAULT 0 AFTER `premium_until`");
    $results[] = '✅ Kolom is_vvip berhasil ditambahkan';

    // Add vvip_until column
    $pdo->exec("ALTER TABLE `users` ADD COLUMN `vvip_until` TIMESTAMP NULL DEFAULT NULL AFTER `is_vvip`");
    $results[] = '✅ Kolom vvip_until berhasil ditambahkan';

    // Update migrations table
    try {
        $stmt = $pdo->query("SELECT COALESCE(MAX(`batch`) + 1, 1) FROM `migrations`");
        $nextBatch = $stmt->fetchColumn();
        $pdo->exec("INSERT IGNORE INTO `migrations` (`migration`, `batch`) VALUES ('2026_08_26_000001_add_vvip_to_users_table', $nextBatch)");
        $results[] = '✅ Migration record berhasil ditambahkan';
    } catch (Exception $e) {
        $results[] = '⚠️ Migration record sudah ada atau tabel migrations tidak ditemukan';
    }

    // Verify
    $stmt = $pdo->query("SHOW COLUMNS FROM users");
    $columns = $stmt->fetchAll(PDO::FETCH_COLUMN);
    $hasVvip = in_array('is_vvip', $columns);
    $hasVvipUntil = in_array('vvip_until', $columns);

    echo '<!DOCTYPE html>
<html>
<head><title>Migration Berhasil</title>
<style>body { font-family: sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; background: #1a1a2e; color: #e0e0e0; } h1 { color: #22c55e; } .ok { color: #22c55e; } .fail { color: #ef4444; }</style>
</head>
<body>
    <h1>✅ Migration Berhasil!</h1>
    <ul>';
    
    foreach ($results as $r) {
        echo "<li>$r</li>";
    }
    
    echo '<li>' . ($hasVvip ? '<span class="ok">✅ is_vvip exists</span>' : '<span class="fail">❌ is_vvip NOT found</span>') . '</li>';
    echo '<li>' . ($hasVvipUntil ? '<span class="ok">✅ vvip_until exists</span>' : '<span class="fail">❌ vvip_until NOT found</span>') . '</li>';
    
    echo '</ul>
    <p><strong>⚠️ SEKARANG HAPUS FILE migrate_vvip.php dari server!</strong></p>
    <p>Kembali ke <a href="https://comika.free.nf" style="color: #a855f7;">COMIKA</a></p>
</body>
</html>';

} catch (PDOException $e) {
    echo '<!DOCTYPE html>
<html>
<head><title>Migration Gagal</title>
<style>body { font-family: sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; background: #1a1a2e; color: #e0e0e0; } h1 { color: #ef4444; } .error { background: #7f1d1d; padding: 15px; border-radius: 8px; }</style>
</head>
<body>
    <h1>❌ Migration Gagal</h1>
    <div class="error">
        <strong>Error:</strong> ' . htmlspecialchars($e->getMessage()) . '
    </div>
    <p>Pastikan database credentials benar dan server MySQL bisa diakses.</p>
</body>
</html>';
}

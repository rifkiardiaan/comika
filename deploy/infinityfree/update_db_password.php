<?php
/**
 * COMIKA DB Password Update Script
 * Visit: https://comika.free.nf/update_db_password.php?password=YOUR_NEW_PASSWORD
 * 
 * This script will:
 * 1. Update the DB_PASSWORD in app/.env
 * 2. Test the new connection
 * 3. Show results
 *
 * DELETE THIS FILE AFTER USE!
 */
error_reporting(E_ALL);
ini_set('display_errors', 1);
header('Content-Type: text/plain; charset=utf-8');

echo "=== COMIKA DB Password Update ===\n\n";

$newPassword = $_GET['password'] ?? null;

if (!$newPassword) {
    echo "ERROR: No password provided.\n\n";
    echo "Usage: https://comika.free.nf/update_db_password.php?password=YOUR_ACTUAL_DB_PASSWORD\n\n";
    echo "Get your password from:\n";
    echo "  InfinityFree Dashboard → MySQL Databases → MySQL Password\n";
    exit;
}

$envPath = __DIR__ . '/app/.env';
if (!file_exists($envPath)) {
    echo "ERROR: .env not found at app/.env\n";
    exit;
}

$env = file_get_contents($envPath);
$host = '';
$db = '';
$user = '';

// Read current values
if (preg_match('/DB_HOST=(.+)/', $env, $m)) $host = trim($m[1]);
if (preg_match('/DB_DATABASE=(.+)/', $env, $m)) $db = trim($m[1]);
if (preg_match('/DB_USERNAME=(.+)/', $env, $m)) $user = trim($m[1]);

// Update password in .env
$env = preg_replace('/DB_PASSWORD=.*/', "DB_PASSWORD=$newPassword", $env);
file_put_contents($envPath, $env);
echo "✅ Updated DB_PASSWORD in app/.env\n";
echo "   Old: (hidden)\n";
echo "   New: $newPassword\n\n";

// Test connection
echo "Testing connection with new password...\n";
try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4", $user, $newPassword, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_TIMEOUT => 10,
    ]);
    echo "✅ CONNECTION SUCCESSFUL!\n\n";
    
    $tables = $pdo->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
    echo "Tables: " . count($tables) . "\n";
    
    if (in_array('comics', $tables)) {
        $published = $pdo->query("SELECT COUNT(*) FROM comics WHERE published_at IS NOT NULL")->fetchColumn();
        echo "Published comics: $published\n";
    }
    if (in_array('users', $tables)) {
        $count = $pdo->query("SELECT COUNT(*) FROM users")->fetchColumn();
        echo "Users: $count\n";
    }
    
    echo "\n✅ DONE! Try logging in now at https://comika.free.nf/login\n";
    
} catch (PDOException $e) {
    echo "❌ Still failed: " . $e->getMessage() . "\n";
    echo "\nPlease check:\n";
    echo "1. The password is correct (from InfinityFree → MySQL Databases)\n";
    echo "2. The database name is correct: $db\n";
    echo "3. The username is correct: $user\n";
}

echo "\n⚠️  DELETE this file after use!\n";

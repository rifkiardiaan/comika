<?php
/**
 * COMIKA DB Fix Script
 * Upload to htdocs/, visit https://comika.free.nf/fix_db.php
 * This script will test the DB connection with the .env password
 * and show you what's wrong.
 */
error_reporting(E_ALL);
ini_set('display_errors', 1);
header('Content-Type: text/plain; charset=utf-8');

echo "=== COMIKA Database Fix ===\n\n";

$envPath = __DIR__ . '/app/.env';
if (!file_exists($envPath)) {
    echo "ERROR: .env not found at app/.env\n";
    exit;
}

$env = parse_ini_file($envPath, false, INI_SCANNER_RAW) ?: [];
$host = $env['DB_HOST'] ?? '';
$port = $env['DB_PORT'] ?? '3306';
$db   = $env['DB_DATABASE'] ?? '';
$user = $env['DB_USERNAME'] ?? '';
$pass = $env['DB_PASSWORD'] ?? '';

echo "Current .env DB settings:\n";
echo "  DB_HOST: $host\n";
echo "  DB_PORT: $port\n";
echo "  DB_DATABASE: $db\n";
echo "  DB_USERNAME: $user\n";
echo "  DB_PASSWORD: $pass\n\n";

// Test connection with current password
echo "Testing connection with current password...\n";
try {
    $pdo = new PDO("mysql:host=$host;port=$port;dbname=$db;charset=utf8mb4", $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_TIMEOUT => 10,
    ]);
    echo "✅ CONNECTION OK with current password!\n\n";
    
    // Check tables
    $tables = $pdo->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
    echo "Tables found: " . count($tables) . "\n";
    
    foreach (['users', 'comics', 'episodes', 'genres', 'comic_genre', 'personal_access_tokens'] as $t) {
        echo "  $t: " . (in_array($t, $tables) ? "✅" : "❌ MISSING") . "\n";
    }
    
    if (in_array('comics', $tables)) {
        $count = $pdo->query("SELECT COUNT(*) FROM comics")->fetchColumn();
        $published = $pdo->query("SELECT COUNT(*) FROM comics WHERE published_at IS NOT NULL")->fetchColumn();
        echo "\n  Total comics: $count\n";
        echo "  Published comics: $published\n";
    }
    
    if (in_array('users', $tables)) {
        $count = $pdo->query("SELECT COUNT(*) FROM users")->fetchColumn();
        echo "  Total users: $count\n";
    }
    
} catch (PDOException $e) {
    echo "❌ CONNECTION FAILED: " . $e->getMessage() . "\n\n";
    echo "=== HOW TO FIX ===\n";
    echo "1. Go to InfinityFree Dashboard → MySQL Databases\n";
    echo "2. Find your MySQL password (the actual current password)\n";
    echo "3. Edit the .env file at app/.env on the server\n";
    echo "4. Change DB_PASSWORD to the correct password\n";
    echo "5. Save and try again\n\n";
    
    echo "Your current password in .env is: '$pass'\n";
    echo "This password does NOT match what's set in InfinityFree.\n";
}

echo "\n=== END ===\n";

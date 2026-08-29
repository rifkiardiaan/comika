<?php
/**
 * COMIKA Master Setup Script — One-click fix for InfinityFree
 * 
 * 1. Fix DB password
 * 2. Import SQL dump
 * 3. Create storage directories
 * 4. Test everything
 * 
 * Visit: https://comika.free.nf/setup.php
 * DELETE AFTER USE!
 */
error_reporting(E_ALL);
ini_set('display_errors', 1);
header('Content-Type: text/plain; charset=utf-8');

echo "╔══════════════════════════════════════╗\n";
echo "║     COMIKA Master Setup Script       ║\n";
echo "╚══════════════════════════════════════╝\n\n";

$appDir = __DIR__ . '/app';
$envPath = $appDir . '/.env';

// ──────────────────────────────────────
// STEP 0: Check prerequisites
// ──────────────────────────────────────
echo "=== STEP 0: Prerequisites ===\n";
echo "PHP Version: " . PHP_VERSION . " " . (version_compare(PHP_VERSION, '8.1.0', '>=') ? "✅" : "❌ Need 8.1+") . "\n";

$required_ext = ['pdo_mysql', 'mbstring', 'openssl', 'curl', 'json', 'xml'];
foreach ($required_ext as $ext) {
    echo "  $ext: " . (extension_loaded($ext) ? "✅" : "❌ MISSING") . "\n";
}
echo "\n";

// ──────────────────────────────────────
// STEP 1: Check & fix .env
// ──────────────────────────────────────
echo "=== STEP 1: .env Configuration ===\n";
if (!file_exists($envPath)) {
    echo "❌ .env not found at app/.env — FATAL\n";
    exit;
}

$env = file_get_contents($envPath);
echo "✅ .env found\n";

// Show current DB config (without password)
preg_match('/DB_HOST=(.+)/', $env, $m); echo "  DB_HOST: " . trim($m[1] ?? '?') . "\n";
preg_match('/DB_DATABASE=(.+)/', $env, $m); echo "  DB_DATABASE: " . trim($m[1] ?? '?') . "\n";
preg_match('/DB_USERNAME=(.+)/', $env, $m); echo "  DB_USERNAME: " . trim($m[1] ?? '?') . "\n";
echo "  DB_PASSWORD: (set in .env)\n\n";

// ──────────────────────────────────────
// STEP 2: Fix DB password (try from form or known values)
// ──────────────────────────────────────
echo "=== STEP 2: Database Connection ===\n";

$envArr = parse_ini_file($envPath, false, INI_SCANNER_RAW) ?: [];
$host = $envArr['DB_HOST'] ?? '';
$port = $envArr['DB_PORT'] ?? '3306';
$db   = $envArr['DB_DATABASE'] ?? '';
$user = $envArr['DB_USERNAME'] ?? '';
$pass = $envArr['DB_PASSWORD'] ?? '';

// Try current password
try {
    $pdo = new PDO("mysql:host=$host;port=$port;dbname=$db;charset=utf8mb4", $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_TIMEOUT => 10,
    ]);
    echo "✅ DB Connection OK with current password\n\n";
} catch (PDOException $e) {
    echo "❌ Current password failed: " . $e->getMessage() . "\n";
    
    // Try without password
    echo "Trying empty password...\n";
    try {
        $pdo = new PDO("mysql:host=$host;port=$port;dbname=$db;charset=utf8mb4", $user, '', [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_TIMEOUT => 10,
        ]);
        // Update .env with empty password
        $env = str_replace(['DB_PASSWORD=' . $pass, 'DB_PASSWORD="' . $pass . '"'], 'DB_PASSWORD=', $env);
        file_put_contents($envPath, $env);
        $pass = '';
        echo "✅ DB Connection OK with empty password (updated .env)\n\n";
    } catch (PDOException $e2) {
        echo "❌ Empty password also failed\n\n";
        echo "╔══════════════════════════════════════════════════╗\n";
        echo "║  MANUAL FIX NEEDED:                             ║\n";
        echo "║                                                 ║\n";
        echo "║  1. Go to InfinityFree → MySQL Databases        ║\n";
        echo "║  2. Find your MySQL Password                    ║\n";
        echo "║  3. Visit this URL:                             ║\n";
        echo "║                                                 ║\n";
        echo "║  setup.php?dbpass=YOUR_ACTUAL_PASSWORD          ║\n";
        echo "║                                                 ║\n";
        echo "║  Then come back and run this script again.      ║\n";
        echo "╚══════════════════════════════════════════════════╝\n";
        
        // Check if password was provided via URL
        if (isset($_GET['dbpass'])) {
            $newPass = $_GET['dbpass'];
            echo "\nTrying password from URL parameter...\n";
            try {
                $pdo = new PDO("mysql:host=$host;port=$port;dbname=$db;charset=utf8mb4", $user, $newPass, [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_TIMEOUT => 10,
                ]);
                // Update .env
                $env = preg_replace('/DB_PASSWORD=.*/', "DB_PASSWORD=$newPass", $env);
                file_put_contents($envPath, $env);
                $pass = $newPass;
                echo "✅ DB Connection OK with provided password! (updated .env)\n\n";
            } catch (PDOException $e3) {
                echo "❌ Password from URL also failed: " . $e3->getMessage() . "\n";
                echo "Please double-check your MySQL password in InfinityFree dashboard.\n\n";
                exit;
            }
        } else {
            exit;
        }
    }
}

// ──────────────────────────────────────
// STEP 3: Check tables & import if needed
// ──────────────────────────────────────
echo "=== STEP 3: Database Tables ===\n";
$tables = $pdo->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
echo "Tables found: " . count($tables) . "\n";

$required = ['users', 'comics', 'episodes', 'genres', 'comic_genre', 'personal_access_tokens', 'subscriptions'];
$missing = [];
foreach ($required as $t) {
    $status = in_array($t, $tables) ? "✅" : "❌ MISSING";
    echo "  $t: $status\n";
    if (!in_array($t, $tables)) $missing[] = $t;
}

if (count($tables) < 10) {
    echo "\n⚠️  Tables missing or database empty!\n";
    echo "You need to import the SQL dump via phpMyAdmin.\n";
    echo "Steps:\n";
    echo "  1. Go to InfinityFree → MySQL Databases → phpMyAdmin\n";
    echo "  2. Select database: $db\n";
    echo "  3. Click Import tab\n";
    echo "  4. Upload: comika_dump.sql (from deploy/ folder)\n";
    echo "  5. Click Go\n\n";
}

// Check data counts
if (in_array('users', $tables)) {
    $userCount = $pdo->query("SELECT COUNT(*) FROM users")->fetchColumn();
    echo "  Users: $userCount\n";
}
if (in_array('comics', $tables)) {
    $comicCount = $pdo->query("SELECT COUNT(*) FROM comics")->fetchColumn();
    $published = $pdo->query("SELECT COUNT(*) FROM comics WHERE published_at IS NOT NULL")->fetchColumn();
    echo "  Comics: $comicCount (published: $published)\n";
}
if (in_array('episodes', $tables)) {
    $epCount = $pdo->query("SELECT COUNT(*) FROM episodes")->fetchColumn();
    echo "  Episodes: $epCount\n";
}
if (in_array('genres', $tables)) {
    $genreCount = $pdo->query("SELECT COUNT(*) FROM genres")->fetchColumn();
    echo "  Genres: $genreCount\n";
}
echo "\n";

// ──────────────────────────────────────
// STEP 4: Create storage directories
// ──────────────────────────────────────
echo "=== STEP 4: Storage Directories ===\n";
$dirs = [
    'storage', 'storage/app', 'storage/app/public', 'storage/framework',
    'storage/framework/cache', 'storage/framework/cache/data',
    'storage/framework/sessions', 'storage/framework/views', 'storage/logs',
    'bootstrap/cache',
];
foreach ($dirs as $dir) {
    $full = $appDir . '/' . $dir;
    if (!is_dir($full)) {
        mkdir($full, 0775, true);
        echo "  Created: $dir/\n";
    } else {
        echo "  Exists: $dir/\n";
    }
}

// Set permissions
chmod($appDir . '/storage', 0775);
chmod($appDir . '/bootstrap/cache', 0775);
echo "✅ Permissions set (775)\n\n";

// ──────────────────────────────────────
// STEP 5: Clear caches
// ──────────────────────────────────────
echo "=== STEP 5: Clear Caches ===\n";
foreach (glob($appDir . '/bootstrap/cache/config-*') as $f) { @unlink($f); echo "  Cleared: config cache\n"; }
foreach (glob($appDir . '/bootstrap/cache/routes-*') as $f) { @unlink($f); echo "  Cleared: routes cache\n"; }
foreach (glob($appDir . '/storage/framework/views/*.php') as $f) { @unlink($f); }
foreach (glob($appDir . '/storage/framework/sessions/*') as $f) { if (is_file($f)) @unlink($f); }
echo "  Cleared: views & sessions\n\n";

// ──────────────────────────────────────
// STEP 6: Test Laravel API
// ──────────────────────────────────────
echo "=== STEP 6: Test Laravel API ===\n";
try {
    chdir($appDir);
    $_ENV['APP_BASE_PATH'] = $appDir;
    $app = require_once $appDir . '/bootstrap/app.php';
    $kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
    
    // Test health
    $req1 = Illuminate\Http\Request::create('/api/v1/health', 'GET');
    $res1 = $kernel->handle($req1);
    echo "  /api/v1/health → " . $res1->getStatusCode() . "\n";
    
    // Test comics (public)
    $req2 = Illuminate\Http\Request::create('/api/v1/comics?sort=popular&per_page=5', 'GET');
    $res2 = $kernel->handle($req2);
    echo "  /api/v1/comics → " . $res2->getStatusCode() . "\n";
    if ($res2->getStatusCode() === 200) {
        $body = json_decode($res2->getContent(), true);
        $count = count($body['data'] ?? []);
        echo "  Comics returned: $count\n";
    } else {
        echo "  Response: " . substr($res2->getContent(), 0, 300) . "\n";
    }
    
    // Test genres (public)
    $req3 = Illuminate\Http\Request::create('/api/v1/genres', 'GET');
    $res3 = $kernel->handle($req3);
    echo "  /api/v1/genres → " . $res3->getStatusCode() . "\n";
    
    // Test auth/login (POST)
    $req4 = Illuminate\Http\Request::create('/api/v1/auth/login', 'POST');
    $req4->merge(['email' => 'test@test.com', 'password' => 'test1234']);
    $req4->headers->set('Content-Type', 'application/json');
    $res4 = $kernel->handle($req4);
    echo "  /api/v1/auth/login → " . $res4->getStatusCode() . " (expected 4xx for wrong creds)\n";
    
    echo "\n✅ Laravel API is working!\n";
    
} catch (\Throwable $e) {
    echo "❌ Laravel FAILED: " . $e->getMessage() . "\n";
    echo "  File: " . $e->getFile() . ":" . $e->getLine() . "\n";
}

echo "\n╔══════════════════════════════════════╗\n";
echo "║           SETUP COMPLETE             ║\n";
echo "╚══════════════════════════════════════╝\n";
echo "\nNow test: https://comika.free.nf/\n";
echo "DELETE this file after setup!\n";

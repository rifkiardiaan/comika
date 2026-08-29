<?php
/**
 * MINIMAL PHP TEST — Upload this to htdocs/ to test basic PHP + DB
 * Visit https://comika.free.nf/test.php
 */
header('Content-Type: text/plain; charset=utf-8');

echo "=== COMIKA Server Diagnostics ===\n\n";

// 1. PHP Version
echo "1. PHP Version: " . PHP_VERSION . "\n";
if (version_compare(PHP_VERSION, '8.1.0', '<')) {
    echo "   ❌ CRITICAL: Laravel 10 requires PHP 8.1+\n";
    echo "   → Go to InfinityFree → Hosting Account → PHP Version → set to 8.1 or 8.2\n";
} else {
    echo "   ✅ OK\n";
}
echo "\n";

// 2. PHP Extensions
echo "2. PHP Extensions:\n";
$required = ['pdo_mysql', 'mbstring', 'openssl', 'curl', 'json', 'xml', 'bcmath', 'tokenizer', 'fileinfo', 'dom', 'gd'];
foreach ($required as $ext) {
    echo "   " . ($ext) . ": " . (extension_loaded($ext) ? "✅" : "❌ MISSING") . "\n";
}
echo "\n";

// 3. Test .env
echo "3. .env File:\n";
$envPath = __DIR__ . '/app/.env';
if (file_exists($envPath)) {
    echo "   ✅ .env found at app/.env\n";
    $env = parse_ini_file($envPath, false, INI_SCANNER_RAW) ?: [];
    echo "   DB_HOST: " . ($env['DB_HOST'] ?? 'NOT SET') . "\n";
    echo "   DB_DATABASE: " . ($env['DB_DATABASE'] ?? 'NOT SET') . "\n";
    echo "   DB_USERNAME: " . ($env['DB_USERNAME'] ?? 'NOT SET') . "\n";
    echo "   DB_PASSWORD: " . (isset($env['DB_PASSWORD']) ? '***' : 'NOT SET') . "\n";
    echo "   APP_DEBUG: " . ($env['APP_DEBUG'] ?? 'NOT SET') . "\n";
} else {
    echo "   ❌ .env NOT found at app/.env\n";
    echo "   Current dir: " . __DIR__ . "\n";
    echo "   Files here: " . implode(', ', array_slice(scandir(__DIR__), 0, 10)) . "\n";
    if (file_exists(__DIR__ . '/app')) {
        echo "   Files in app/: " . implode(', ', array_slice(scandir(__DIR__ . '/app'), 0, 10)) . "\n";
    }
}
echo "\n";

// 4. Test DB Direct
echo "4. Database Connection (direct PDO):\n";
if (file_exists($envPath)) {
    $env = parse_ini_file($envPath, false, INI_SCANNER_RAW) ?: [];
    $host = $env['DB_HOST'] ?? '127.0.0.1';
    $port = $env['DB_PORT'] ?? '3306';
    $db   = $env['DB_DATABASE'] ?? '';
    $user = $env['DB_USERNAME'] ?? '';
    $pass = $env['DB_PASSWORD'] ?? '';

    if ($db && $user) {
        try {
            $pdo = new PDO("mysql:host=$host;port=$port;dbname=$db;charset=utf8mb4", $user, $pass, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_TIMEOUT => 10,
            ]);
            echo "   ✅ Connection OK\n";

            $tables = $pdo->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
            echo "   Tables: " . count($tables) . "\n";

            // Check critical tables
            foreach (['users', 'comics', 'episodes', 'genres', 'comic_genre', 'personal_access_tokens'] as $t) {
                echo "   " . $t . ": " . (in_array($t, $tables) ? "✅" : "❌ MISSING") . "\n";
            }

            // Check comics count
            if (in_array('comics', $tables)) {
                $count = $pdo->query("SELECT COUNT(*) FROM comics WHERE published_at IS NOT NULL")->fetchColumn();
                echo "   Published comics: " . $count . "\n";
            }
        } catch (PDOException $e) {
            echo "   ❌ FAILED: " . $e->getMessage() . "\n";
            echo "   Error code: " . $e->getCode() . "\n";
        }
    } else {
        echo "   ⚠️ DB not configured in .env\n";
    }
} else {
    echo "   ⚠️ Cannot test - .env not found\n";
}
echo "\n";

// 5. Test vendor/autoload
echo "5. Composer Autoloader:\n";
$autoload = __DIR__ . '/app/vendor/autoload.php';
if (file_exists($autoload)) {
    echo "   ✅ vendor/autoload.php exists\n";
    try {
        require_once $autoload;
        echo "   ✅ Autoloader loaded OK\n";
    } catch (\Throwable $e) {
        echo "   ❌ FAILED: " . $e->getMessage() . "\n";
    }
} else {
    echo "   ❌ vendor/autoload.php MISSING\n";
    echo "   → Need to run 'composer install --no-dev --optimize-autoloader' in app/ dir\n";
}
echo "\n";

// 6. Test Laravel bootstrap
echo "6. Laravel Bootstrap:\n";
if (file_exists($autoload)) {
    try {
        chdir(__DIR__ . '/app');
        $_ENV['APP_BASE_PATH'] = __DIR__ . '/app';
        $app = require_once __DIR__ . '/app/bootstrap/app.php';
        echo "   ✅ Laravel app created\n";

        $kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
        echo "   ✅ HTTP Kernel resolved\n";

        // Test health endpoint
        $request = Illuminate\Http\Request::create('/api/v1/health', 'GET');
        $response = $kernel->handle($request);
        echo "   ✅ /api/v1/health → " . $response->getStatusCode() . "\n";
        echo "   Body: " . substr($response->getContent(), 0, 200) . "\n";

        // Test /api/v1/comics (public, no auth needed)
        $request2 = Illuminate\Http\Request::create('/api/v1/comics?sort=popular&per_page=2', 'GET');
        $response2 = $kernel->handle($request2);
        echo "   ✅ /api/v1/comics → " . $response2->getStatusCode() . "\n";
        if ($response2->getStatusCode() !== 200) {
            echo "   Body: " . substr($response2->getContent(), 0, 500) . "\n";
        }
    } catch (\Throwable $e) {
        echo "   ❌ FAILED: " . $e->getMessage() . "\n";
        echo "   File: " . $e->getFile() . ":" . $e->getLine() . "\n";
        echo "   Trace:\n" . substr($e->getTraceAsString(), 0, 800) . "\n";
    }
} else {
    echo "   ⚠️ Skipped - autoloader not available\n";
}

echo "\n=== END DIAGNOSTICS ===\n";
echo "Share this output so we can fix the issue.\n";

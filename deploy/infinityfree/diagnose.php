<?php
/**
 * COMIKA Backend Diagnostic Script
 * Upload this to htdocs/ and visit https://comika.free.nf/diagnose.php
 * DELETE after diagnosing!
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h2>COMIKA Backend Diagnostic</h2>";
echo "<pre>";

// 1. PHP Version
echo "=== PHP Version ===\n";
echo "PHP Version: " . PHP_VERSION . "\n";
echo "Required: 8.1+ (Laravel 10)\n";
echo "Status: " . (version_compare(PHP_VERSION, '8.1.0', '>=') ? "OK" : "FAIL - UPGRADE PHP!") . "\n\n";

// 2. Check .env location
echo "=== .env File ===\n";
$envPath = __DIR__ . '/app/.env';
echo "Expected path: $envPath\n";
echo "Exists: " . (file_exists($envPath) ? "YES" : "NO") . "\n";
if (file_exists($envPath)) {
    $envContent = file_get_contents($envPath);
    // Check key settings
    if (preg_match('/APP_KEY=(.+)/', $envContent, $m)) {
        echo "APP_KEY: " . (empty(trim($m[1])) ? "EMPTY - GENERATE ONE!" : "SET (" . substr($m[1], 0, 10) . "...)") . "\n";
    }
    if (preg_match('/DB_HOST=(.+)/', $envContent, $m)) {
        echo "DB_HOST: " . trim($m[1]) . "\n";
    }
    if (preg_match('/DB_DATABASE=(.+)/', $envContent, $m)) {
        echo "DB_DATABASE: " . trim($m[1]) . "\n";
    }
    if (preg_match('/DB_USERNAME=(.+)/', $envContent, $m)) {
        echo "DB_USERNAME: " . trim($m[1]) . "\n";
    }
}
echo "\n";

// 3. Check directory structure
echo "=== Directory Structure ===\n";
$dirs = [
    'app/vendor' => 'Composer vendor',
    'app/bootstrap' => 'Bootstrap dir',
    'app/bootstrap/cache' => 'Bootstrap cache',
    'app/storage' => 'Storage dir',
    'app/storage/app' => 'Storage/app',
    'app/storage/app/public' => 'Storage/public (uploads)',
    'app/storage/framework' => 'Storage/framework',
    'app/storage/framework/cache' => 'Framework cache',
    'app/storage/framework/sessions' => 'Framework sessions',
    'app/storage/framework/views' => 'Framework views',
    'app/storage/logs' => 'Storage logs',
];
foreach ($dirs as $dir => $label) {
    $fullPath = __DIR__ . '/' . $dir;
    $exists = is_dir($fullPath);
    $writable = $exists ? is_writable($fullPath) : false;
    echo sprintf("%-30s %s %s\n", $label,
        $exists ? "[DIR]" : "[MISSING]",
        $exists ? ($writable ? "[WRITABLE]" : "[NOT WRITABLE!]") : ""
    );
    if (!$exists) {
        echo "  -> Create: mkdir -p $fullPath && chmod 775 $fullPath\n";
    } elseif (!$writable) {
        echo "  -> Fix: chmod 775 $fullPath\n";
    }
}
echo "\n";

// 4. Check autoloader
echo "=== Autoloader ===\n";
$autoloadPath = __DIR__ . '/app/vendor/autoload.php';
if (file_exists($autoloadPath)) {
    echo "vendor/autoload.php: EXISTS\n";
    try {
        require_once $autoloadPath;
        echo "Autoloader loaded: OK\n";
    } catch (\Throwable $e) {
        echo "Autoloader FAILED: " . $e->getMessage() . "\n";
    }
} else {
    echo "vendor/autoload.php: MISSING - Run 'composer install' in app/ directory\n";
}
echo "\n";

// 5. Test DB Connection
echo "=== Database Connection ===\n";
if (file_exists($envPath)) {
    $env = parse_ini_file($envPath, false, INI_SCANNER_RAW) ?: [];
    $dbHost = $env['DB_HOST'] ?? '127.0.0.1';
    $dbPort = $env['DB_PORT'] ?? '3306';
    $dbName = $env['DB_DATABASE'] ?? '';
    $dbUser = $env['DB_USERNAME'] ?? '';
    $dbPass = $env['DB_PASSWORD'] ?? '';

    echo "Connecting to $dbHost:$dbPort as $dbUser...\n";
    try {
        $pdo = new PDO("mysql:host=$dbHost;port=$dbPort;dbname=$dbName", $dbUser, $dbPass, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_TIMEOUT => 10,
        ]);
        echo "Connection: OK\n";

        // Check tables
        $tables = $pdo->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
        echo "Tables found: " . count($tables) . "\n";
        echo "Tables: " . implode(', ', array_slice($tables, 0, 15)) . "\n";
    } catch (PDOException $e) {
        echo "Connection FAILED: " . $e->getMessage() . "\n";
        echo "This is likely the cause of the 500 error!\n";
    }
} else {
    echo "Cannot test - .env not found\n";
}
echo "\n";

// 6. Test Laravel bootstrap
echo "=== Laravel Bootstrap ===\n";
try {
    $appPath = __DIR__ . '/app';
    $_ENV['APP_BASE_PATH'] = $appPath;
    chdir($appPath);
    $app = require_once $appPath . '/bootstrap/app.php';
    $kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
    echo "Laravel bootstrap: OK\n";

    // Test a simple request
    $request = Illuminate\Http\Request::create('/api/v1/health', 'GET');
    $response = $kernel->handle($request);
    echo "API /health status: " . $response->getStatusCode() . "\n";
    echo "API /health response: " . $response->getContent() . "\n";
} catch (\Throwable $e) {
    echo "Laravel bootstrap FAILED: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . ":" . $e->getLine() . "\n";
    echo "Trace: " . substr($e->getTraceAsString(), 0, 500) . "\n";
}
echo "\n";

// 7. PHP Extensions
echo "=== Required PHP Extensions ===\n";
$required = ['pdo_mysql', 'mbstring', 'openssl', 'curl', 'json', 'xml', 'bcmath', 'tokenizer', 'fileinfo'];
foreach ($required as $ext) {
    echo sprintf("%-15s %s\n", $ext, extension_loaded($ext) ? "OK" : "MISSING!");
}
echo "\n";

echo "</pre>";
echo "<hr>";
echo "<p><strong>DELETE this file after diagnosing!</strong></p>";
?>

<?php

/*
 * Smoke test alur Riwayat Aktivitas (feature 13).
 * Menjalankan: php scripts/smoke_activity.php
 *
 * 1. Mencatat 8 kategori aksi lewat ActivityLogService (persis seperti hook
 *    di controller).
 * 2. Memverifikasi data terbaca lewat query yang sama dengan endpoint
 *    GET /admin/activities (total, today, by_action, recent + relasi user).
 * 3. Membersihkan baris test (description diawali [SMOKE]).
 */

require __DIR__.'/../vendor/autoload.php';

$app = require __DIR__.'/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\ActivityLog;
use App\Models\Comment;
use App\Models\Comic;
use App\Models\Episode;
use App\Models\Transaction;
use App\Models\User;
use App\Services\ActivityLogService;
use Illuminate\Support\Facades\Schema;

$failures = 0;

function check(string $label, bool $ok, string $detail = ''): void
{
    global $failures;
    echo ($ok ? '  [PASS] ' : '  [FAIL] ').$label.($detail !== '' ? " — {$detail}" : '').PHP_EOL;
    if (! $ok) {
        $failures++;
    }
}

echo 'Smoke test Riwayat Aktivitas'.PHP_EOL;
echo '=========================='.PHP_EOL;

// Prasyarat: tabel ada setelah migrasi
check('tabel activity_logs ada', Schema::hasTable('activity_logs'));

$user = User::first();
$comic = Comic::first();
$episode = Episode::first();
$comment = Comment::first();
$transaction = Transaction::first();

check('ada user untuk test', $user !== null);
check('ada komik untuk test', $comic !== null);

$svc = app(ActivityLogService::class);

// 1) Catat aksi — setara hook controller
$svc->log($user, ActivityLog::ACTION_COMIC_UPLOAD, '[SMOKE] Creator mengirim komik untuk direview', $comic, [], '127.0.0.1');
$svc->log($user, ActivityLog::ACTION_COMIC_PUBLISH, '[SMOKE] Admin menerbitkan komik', $comic, [], '127.0.0.1');
$svc->log($user, ActivityLog::ACTION_EPISODE_PUBLISH, '[SMOKE] Admin menerbitkan episode', $episode, ['comic_id' => $comic?->id], '127.0.0.1');
$svc->log($user, ActivityLog::ACTION_EPISODE_UNLOCK, '[SMOKE] User membuka episode premium dengan koin', $episode, ['coins_spent' => 5], '127.0.0.1');
$svc->log($user, ActivityLog::ACTION_COIN_PURCHASE, '[SMOKE] User membeli 100 koin', $transaction, [], '127.0.0.1');
$svc->log($user, ActivityLog::ACTION_COMIC_DOWNLOAD, '[SMOKE] User mengunduh komik offline', $comic, ['episode_count' => 3, 'page_count' => 40], '127.0.0.1');
$svc->log($user, ActivityLog::ACTION_USER_BAN, '[SMOKE] Admin memblokir sementara akun user', $user, [], '127.0.0.1');
$svc->log($user, ActivityLog::ACTION_COMMENT_MODERATE, '[SMOKE] Admin menyembunyikan komentar', $comment, [], '127.0.0.1');

$smokeCount = ActivityLog::where('description', 'like', '[SMOKE]%')->count();
check('8 aksi tercatat', $smokeCount === 8, "tercatat {$smokeCount}");

// 2) Baca seperti endpoint /admin/activities
$total = ActivityLog::count();
$today = ActivityLog::whereDate('created_at', today())->count();
$byAction = ActivityLog::query()->selectRaw('action, COUNT(*) as total')->groupBy('action')->orderByDesc('total')->limit(8)->get();
$recent = ActivityLog::with('user:id,name,username')->orderByDesc('created_at')->limit(8)->get();

check('total > 0', $total > 0, "total {$total}");
check('total hari ini >= 8', $today >= 8, "hari ini {$today}");
check('by_action terisi', $byAction->count() > 0, "{$byAction->count()} aksi");
check('recent memuat relasi user', $recent->first()?->user !== null);
check('metadata tersimpan', $recent->where('action', ActivityLog::ACTION_COMIC_DOWNLOAD)->first()?->metadata !== null);

// 3) subject morphTo
$downloadLog = ActivityLog::where('action', ActivityLog::ACTION_COMIC_DOWNLOAD)->where('description', 'like', '[SMOKE]%')->first();
check('subject (comic) ter-resolve', $downloadLog?->subject?->getMorphClass() === 'App\Models\Comic');

// 4) IP address tersimpan
check('ip_address tersimpan', ($downloadLog?->ip_address ?? '') === '127.0.0.1');

// 5) AdminActivityController guard: pastikan aksi bisa difilter
$filtered = ActivityLog::where('action', ActivityLog::ACTION_COMIC_DOWNLOAD)->count();
check('filter action berfungsi', $filtered > 0, "{$filtered} download tercatat");

// Bersihkan data test
ActivityLog::where('description', 'like', '[SMOKE]%')->delete();
$leftover = ActivityLog::where('description', 'like', '[SMOKE]%')->count();
check('data test dibersihkan', $leftover === 0);

echo '=========================='.PHP_EOL;
if ($failures === 0) {
    echo 'SEMUA LULUS'.PHP_EOL;
    exit(0);
}
echo "GAGAL: {$failures} cek".PHP_EOL;
exit(1);
<?php

use App\Http\Controllers\Api\AdminComicController;
use App\Http\Controllers\Api\AiController;
use App\Http\Controllers\Api\AdminCommentController;
use App\Http\Controllers\Api\AdminCreatorController;
use App\Http\Controllers\Api\AdminDashboardController;
use App\Http\Controllers\Api\AdminGenreController;
use App\Http\Controllers\Api\AdminReadingController;
use App\Http\Controllers\Api\AdminReportController;
use App\Http\Controllers\Api\AdminTransactionController;
use App\Http\Controllers\Api\AdminUserController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BookmarkController;
use App\Http\Controllers\Api\CoinPackageController;
use App\Http\Controllers\Api\ComicController;
use App\Http\Controllers\Api\CommentController;
use App\Http\Controllers\Api\CreatorApplicationController;
use App\Http\Controllers\Api\CreatorComicController;
use App\Http\Controllers\Api\CreatorDashboardController;
use App\Http\Controllers\Api\CreatorEarningController;
use App\Http\Controllers\Api\CreatorProfileController;
use App\Http\Controllers\Api\CreatorWithdrawalController;
use App\Http\Controllers\Api\EpisodeController;
use App\Http\Controllers\Api\EpisodePageController;
use App\Http\Controllers\Api\FollowController;
use App\Http\Controllers\Api\GamificationController;
use App\Http\Controllers\Api\GenreController;
use App\Http\Controllers\Api\LikeController;
use App\Http\Controllers\Api\DownloadController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\SubscriptionController;
use App\Http\Controllers\Api\PasswordResetController;
use App\Http\Controllers\Api\PublicCreatorController;
use App\Http\Controllers\Api\PushController;
use App\Http\Controllers\Api\RatingController;
use App\Http\Controllers\Api\ReadingHistoryController;
use App\Http\Controllers\Api\UnlockController;
use App\Http\Controllers\Api\MidtransController;
use App\Http\Controllers\Api\WalletController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Semua route API menggunakan prefix /api/v1 (didaftarkan di
| App\Providers\RouteServiceProvider). Endpoint dilindungi oleh
| auth:sanctum untuk data privat.
|
*/

// Health check — tidak butuh autentikasi
Route::get('/health', function () {
    return response()->json([
        'success' => true,
        'message' => 'COMIKA API is running',
        'data' => [
            'version' => 'v1',
            'time' => now()->toIso8601String(),
        ],
    ]);
});

// Download info — publik
Route::get('/app/version', function () {
    return response()->json([
        'success' => true,
        'data' => [
            'latest_version' => '1.0.0',
            'min_version' => '1.0.0',
            'download_url' => url('/downloads/comika.apk'),
            'release_notes' => 'Versi pertama COMIKA Mobile!',
            'released_at' => now()->toIso8601String(),
        ],
    ]);
});

// ============================================================
// Autentikasi (Phase 03)
// ============================================================
Route::prefix('auth')->group(function () {
    // Rate limiting pada endpoint sensitif (brute force protection)
    Route::post('register', [AuthController::class, 'register'])
        ->middleware('throttle:5,1');
    Route::post('login', [AuthController::class, 'login'])
        ->middleware('throttle:5,1');

    Route::middleware(['auth:sanctum', 'not_banned'])->group(function () {
        Route::post('logout', [AuthController::class, 'logout']);
        Route::get('me', [AuthController::class, 'me']);
        // Ganti password — throttled sebagai pertahanan berlapis
        Route::put('me/password', [AuthController::class, 'updatePassword'])
            ->middleware('throttle:5,1');
        Route::patch('me/password', [AuthController::class, 'updatePassword'])
            ->middleware('throttle:5,1');

        // Ubah profil dasar (nama & avatar)
        Route::put('me/profile', [AuthController::class, 'updateProfile']);
        Route::patch('me/profile', [AuthController::class, 'updateProfile']);
        Route::delete('me/avatar', [AuthController::class, 'deleteAvatar']);
    });

    // Lupa / atur ulang password — publik
    Route::post('forgot-password', [PasswordResetController::class, 'sendResetLink'])
        ->middleware('throttle:5,1');
    Route::post('reset-password', [PasswordResetController::class, 'reset'])
        ->middleware('throttle:5,1');
});

// ============================================================
// Gamification (Phase 11) — butuh login
// ============================================================
Route::middleware('auth:sanctum')->group(function () {
    Route::get('me/gamification', [GamificationController::class, 'profile']);
});

// ============================================================
// Notifikasi in-app (blueprint 24) — butuh login
// ============================================================
Route::middleware('auth:sanctum')->prefix('me')->group(function () {
    // Urutan penting: route statis sebelum {notification} agar tidak tertangkap
    Route::get('notifications/unread-count', [NotificationController::class, 'unreadCount']);
    Route::post('notifications/read-all', [NotificationController::class, 'markAllRead']);

    Route::get('notifications', [NotificationController::class, 'index']);
    Route::put('notifications/{notification}/read', [NotificationController::class, 'markRead']);
    Route::patch('notifications/{notification}/read', [NotificationController::class, 'markRead']);
    Route::delete('notifications/{notification}', [NotificationController::class, 'destroy']);
});

// ============================================================
// Web push notification (blueprint 24 — push notification) — butuh login
// ============================================================
// Public key VAPID — publik (kunci memang untuk dibagikan ke browser)
Route::get('push/vapid-public-key', [PushController::class, 'vapidPublicKey']);

Route::middleware('auth:sanctum')->prefix('me/push')->group(function () {
    Route::get('subscriptions', [PushController::class, 'index']);
    Route::post('subscribe', [PushController::class, 'subscribe']);
    Route::delete('subscribe', [PushController::class, 'unsubscribe']);
});

// ============================================================
// AI Assistant (blueprint 27) — optional service, butuh role creator
// ============================================================
// Status publik — hanya memberi tahu UI apakah AI dikonfigurasi
Route::get('ai/status', [AiController::class, 'status']);

Route::middleware(['auth:sanctum', 'creator', 'not_banned'])->prefix('ai')->group(function () {
    Route::post('titles', [AiController::class, 'titles']);
    Route::post('synopsis', [AiController::class, 'synopsis']);
    Route::post('genres-tags', [AiController::class, 'genresTags']);
    Route::post('character', [AiController::class, 'character']);
    Route::post('outline', [AiController::class, 'outline']);
});

// ============================================================
// Comic Core (Phase 04)
// ============================================================
// Endpoint publik
Route::get('genres', [GenreController::class, 'index']);
Route::get('comics', [ComicController::class, 'index']);
// Profil creator publik (dari kartu komik / nama creator)
Route::get('creators/{user}', [PublicCreatorController::class, 'show']);
// Profil user publik (untuk melihat profile dari komentar)
Route::get('users/{user}/public-profile', [PublicCreatorController::class, 'publicProfile']);
Route::get('comics/{comic}', [ComicController::class, 'show']);
Route::get('comics/{comic}/episodes', [EpisodeController::class, 'index']);
Route::get('episodes/{episode}', [EpisodeController::class, 'show']);

// Endpoint creator — butuh login + role creator + tidak diblokir
Route::middleware(['auth:sanctum', 'creator', 'not_banned'])->group(function () {
    Route::post('comics', [ComicController::class, 'store']);
    Route::put('comics/{comic}', [ComicController::class, 'update']);
    Route::patch('comics/{comic}', [ComicController::class, 'update']);
    Route::delete('comics/{comic}', [ComicController::class, 'destroy']);

    Route::post('comics/{comic}/episodes', [EpisodeController::class, 'store']);
    Route::put('episodes/{episode}', [EpisodeController::class, 'update']);
    Route::patch('episodes/{episode}', [EpisodeController::class, 'update']);
    Route::delete('episodes/{episode}', [EpisodeController::class, 'destroy']);
    Route::post('episodes/{episode}/publish', [EpisodeController::class, 'publish']);

    Route::get('episodes/{episode}/pages', [EpisodePageController::class, 'index']);
    Route::post('episodes/{episode}/pages', [EpisodePageController::class, 'store']);
    Route::put('episodes/pages/{page}', [EpisodePageController::class, 'update']);
    Route::patch('episodes/pages/{page}', [EpisodePageController::class, 'update']);
    Route::delete('episodes/pages/{page}', [EpisodePageController::class, 'destroy']);
});

// ============================================================
// Creator Application — butuh login
// ============================================================
Route::middleware('auth:sanctum')->prefix('creator-application')->group(function () {
    Route::post('/', [CreatorApplicationController::class, 'store']);
    Route::get('/', [CreatorApplicationController::class, 'show']);
});

// ============================================================
// Reader (Phase 05) — butuh login
// ============================================================
Route::middleware('auth:sanctum')->prefix('reader')->group(function () {
    Route::get('history', [ReadingHistoryController::class, 'index']);
    Route::post('progress', [ReadingHistoryController::class, 'store']);
});

// ============================================================
// Community (Phase 06)
// ============================================================
// Komentar — publik (baca)
Route::get('comics/{comic}/comments', [CommentController::class, 'index']);
Route::get('episodes/{episode}/comments', [CommentController::class, 'indexEpisode']);

// Aksi community — butuh login
Route::middleware('auth:sanctum')->group(function () {
    // Library user
    Route::get('me/bookmarks', [BookmarkController::class, 'index']);
    Route::get('me/follows', [FollowController::class, 'index']);

    // Bookmark, follow, like, rating
    Route::post('comics/{comic}/bookmark', [BookmarkController::class, 'toggle']);
    Route::post('comics/{comic}/follow', [FollowController::class, 'toggle']);
    Route::post('comics/{comic}/like', [LikeController::class, 'toggleComic']);
    Route::post('episodes/{episode}/like', [LikeController::class, 'toggleEpisode']);
    Route::post('comments/{comment}/like', [LikeController::class, 'toggleComment']);
    Route::post('comics/{comic}/rating', [RatingController::class, 'store']);

    // Komentar (rate limiting anti spam)
    Route::post('comics/{comic}/comments', [CommentController::class, 'store'])
        ->middleware('throttle:30,1');
    Route::post('episodes/{episode}/comments', [CommentController::class, 'storeEpisode'])
        ->middleware('throttle:30,1');
    Route::put('comments/{comment}', [CommentController::class, 'update']);
    Route::patch('comments/{comment}', [CommentController::class, 'update']);
    Route::delete('comments/{comment}', [CommentController::class, 'destroy']);
});

// ============================================================
// Creator (Phase 07) — butuh login + role creator + tidak diblokir
// ============================================================
Route::middleware(['auth:sanctum', 'creator', 'not_banned'])->prefix('creator')->group(function () {
    Route::get('profile', [CreatorProfileController::class, 'show']);
    Route::put('profile', [CreatorProfileController::class, 'update']);
    Route::get('dashboard', [CreatorDashboardController::class, 'index']);
    Route::get('comics', [CreatorComicController::class, 'index']);
    Route::get('comics/{comic}', [CreatorComicController::class, 'show']);
    Route::get('comics/{comic}/analytics', [CreatorComicController::class, 'analytics']);
});

// ============================================================
// Monetization (Phase 09)
// ============================================================
// Paket koin — publik
Route::get('coin-packages', [CoinPackageController::class, 'index']);

// Beli koin, dompet, & unlock episode premium — butuh login
Route::middleware('auth:sanctum')->group(function () {
    Route::post('coin-packages/{package}/purchase', [CoinPackageController::class, 'purchase']);
    Route::get('me/wallet', [WalletController::class, 'show']);
    Route::get('me/transactions', [WalletController::class, 'transactions']);
    Route::get('me/unlocks', [WalletController::class, 'unlocks']);

    // Premium subscription
    Route::get('subscription/plans', [SubscriptionController::class, 'plans']);
    Route::get('subscription/status', [SubscriptionController::class, 'status']);
    Route::post('subscription/subscribe', [SubscriptionController::class, 'subscribe']);
    Route::post('subscription/cancel', [SubscriptionController::class, 'cancel']);
    Route::post('episodes/{episode}/unlock', [UnlockController::class, 'store']);
});

// ============================================================
// Midtrans Payment Gateway
// ============================================================
// Webhook notification dari Midtrans — TANPA autentikasi (diverifikasi langsung)
Route::post('midtrans/notification', [MidtransController::class, 'notification']);

// Snap token creation — butuh login
Route::middleware('auth:sanctum')->prefix('midtrans')->group(function () {
    Route::get('status/{orderId}', [MidtransController::class, 'status']);
});

// Earning & withdrawal creator — butuh login + role creator + tidak diblokir
Route::middleware(['auth:sanctum', 'creator', 'not_banned'])->prefix('creator')->group(function () {
    Route::get('earnings', [CreatorEarningController::class, 'index']);
    Route::get('withdrawals', [CreatorWithdrawalController::class, 'index']);
    Route::post('withdrawals', [CreatorWithdrawalController::class, 'store']);
    Route::post('earnings/transfer-to-wallet', [CreatorEarningController::class, 'transferToWallet']);
});

// ============================================================
// Admin (Phase 08) — butuh login + role admin
// ============================================================
Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    Route::get('dashboard', [AdminDashboardController::class, 'index']);

    // Manajemen user
    Route::get('users', [AdminUserController::class, 'index']);
    Route::patch('users/{user}/role', [AdminUserController::class, 'updateRole']);
    Route::delete('users/{user}', [AdminUserController::class, 'destroy']);
    Route::post('users/{user}/ban', [AdminUserController::class, 'ban']);
    Route::post('users/{user}/unban', [AdminUserController::class, 'unban']);
    Route::post('users/{user}/permanent-ban', [AdminUserController::class, 'permanentBan']);

    // Subscription management (Premium & VVIP)
    Route::get('subscribers', [AdminUserController::class, 'subscribers']);
    Route::get('subscriber-stats', [AdminUserController::class, 'subscriberStats']);
    Route::post('users/{user}/grant-vvip', [AdminUserController::class, 'grantVvip']);
    Route::post('users/{user}/revoke-vvip', [AdminUserController::class, 'revokeVvip']);
    Route::post('users/{user}/grant-premium', [AdminUserController::class, 'grantPremium']);
    Route::post('users/{user}/revoke-premium', [AdminUserController::class, 'revokePremium']);
    Route::post('users/{user}/upgrade-to-vvip', [AdminUserController::class, 'upgradeToVvip']);

    // Manajemen creator
    Route::get('creators', [AdminCreatorController::class, 'index']);
    Route::patch('creators/{user}/verify', [AdminCreatorController::class, 'verify']);

    // Moderasi komik
    Route::get('comics', [AdminComicController::class, 'index']);
    Route::get('comics/{comic}/episodes', [AdminComicController::class, 'episodes']);
    Route::get('episodes/{episode}/pages', [AdminComicController::class, 'episodePages']);
    Route::patch('comics/{comic}/status', [AdminComicController::class, 'updateStatus']);
    Route::post('comics/{comic}/publish', [AdminComicController::class, 'publish']);
    Route::patch('comics/{comic}/verify', [AdminComicController::class, 'verify']);
    Route::post('comics/{comic}/block', [AdminComicController::class, 'block']);
    Route::delete('comics/{comic}/cover', [AdminComicController::class, 'deleteCover']);
    Route::delete('comics/{comic}', [AdminComicController::class, 'destroy']);
    Route::get('revenue', [AdminComicController::class, 'revenue']);
    Route::post('episodes/{episode}/publish', [AdminComicController::class, 'publishEpisode']);

    // Moderasi komentar
    Route::get('comments', [AdminCommentController::class, 'index']);
    Route::patch('comments/{comment}/moderate', [AdminCommentController::class, 'moderate']);
    Route::delete('comments/{comment}', [AdminCommentController::class, 'destroy']);

    // Laporan Pembaca
    Route::get('reading/report', [AdminReadingController::class, 'index']);
    Route::get('reading/stats', [AdminReadingController::class, 'stats']);

    // Laporan
    Route::get('reports', [AdminReportController::class, 'index']);
    Route::get('reports/{report}', [AdminReportController::class, 'show']);
    Route::patch('reports/{report}/handle', [AdminReportController::class, 'handle']);

    // Genre
    Route::post('genres', [AdminGenreController::class, 'store']);
    Route::put('genres/{genre}', [AdminGenreController::class, 'update']);
    Route::patch('genres/{genre}', [AdminGenreController::class, 'update']);
    Route::delete('genres/{genre}', [AdminGenreController::class, 'destroy']);

    // Transaksi & withdrawal (Phase 09)
    Route::get('transactions', [AdminTransactionController::class, 'index']);
    Route::get('withdrawals', [AdminTransactionController::class, 'withdrawals']);
    Route::patch('withdrawals/{withdrawal}/status', [AdminTransactionController::class, 'handleWithdrawal']);

    // Pengajuan creator
    Route::get('creator-applications', [CreatorApplicationController::class, 'index']);
    Route::patch('creator-applications/{application}/approve', [CreatorApplicationController::class, 'approve']);
    Route::patch('creator-applications/{application}/reject', [CreatorApplicationController::class, 'reject']);

    // Upload APK (admin only)
    Route::post('download/upload', [DownloadController::class, 'upload']);
});

// ============================================================
// Download APK — publik
// ============================================================
Route::get('download/version', [DownloadController::class, 'version'])->name('download.version');
Route::get('download/apk', [DownloadController::class, 'download'])->name('download.apk');

<?php

namespace App\Services;

use App\Models\Comic;
use App\Models\Comment;
use App\Models\CreatorEarning;
use App\Models\Episode;
use App\Models\Report;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class AdminDashboardService
{
    /**
     * Ringkasan statistik platform untuk admin dashboard.
     *
     * @return array<string, mixed>
     */
    public function dashboard(): array
    {
        // Ringkasan user
        $userStats = User::query()
            ->selectRaw('COUNT(*) as users_count')
            ->selectRaw("COALESCE(SUM(CASE WHEN role = 'reader' THEN 1 ELSE 0 END), 0) as readers_count")
            ->selectRaw("COALESCE(SUM(CASE WHEN role = 'creator' THEN 1 ELSE 0 END), 0) as creators_count")
            ->selectRaw("COALESCE(SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END), 0) as admins_count")
            ->first();

        // Ringkasan komik
        $comicStats = Comic::query()
            ->selectRaw('COUNT(*) as comics_count')
            ->selectRaw('COALESCE(SUM(CASE WHEN published_at IS NOT NULL THEN 1 ELSE 0 END), 0) as published_comics_count')
            ->selectRaw('COALESCE(SUM(CASE WHEN published_at IS NULL THEN 1 ELSE 0 END), 0) as draft_comics_count')
            ->selectRaw('COALESCE(SUM(view_count), 0) as total_views')
            ->selectRaw('COALESCE(SUM(like_count), 0) as total_likes')
            ->first();

        $episodesCount = Episode::count();
        $publishedEpisodesCount = Episode::where('status', Episode::STATUS_PUBLISHED)->count();
        $commentsCount = Comment::where('status', Comment::STATUS_ACTIVE)->count();
        $pendingReportsCount = Report::where('status', Report::STATUS_PENDING)->count();

        $newUsersToday = User::whereDate('created_at', today())->count();
        $newUsersWeek = User::where('created_at', '>=', now()->subDays(7))->count();

        $recentUsers = User::query()
            ->orderByDesc('created_at')
            ->limit(5)
            ->get(['id', 'name', 'username', 'email', 'avatar_url', 'role', 'created_at']);

        $recentComics = Comic::query()
            ->with('creator:id,name')
            ->orderByDesc('created_at')
            ->limit(5)
            ->get(['id', 'title', 'slug', 'cover_url', 'status', 'view_count', 'like_count', 'rating_avg', 'creator_id', 'created_at']);

        $recentReports = Report::query()
            ->with('reporter:id,name,username')
            ->orderByRaw("CASE WHEN status = 'pending' THEN 0 ELSE 1 END")
            ->orderByDesc('created_at')
            ->limit(5)
            ->get();

        // Pendapatan platform dari komik (admin share 40%)
        $totalCoinRevenue = (int) DB::table('transactions')
            ->where('type', 'episode_unlock')
            ->where('status', 'success')
            ->sum('coins');
        $platformRevenue = $totalCoinRevenue * 100 * 0.40; // 40% admin share

        $monthlyCoinRevenue = (int) DB::table('transactions')
            ->where('type', 'episode_unlock')
            ->where('status', 'success')
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->sum('coins');
        $monthlyPlatformRevenue = $monthlyCoinRevenue * 100 * 0.40;

        // Total transaksi unlock
        $totalUnlocks = DB::table('transactions')
            ->where('type', 'episode_unlock')
            ->where('status', 'success')
            ->count();

        // Komik yang menunggu verifikasi — handle jika kolom belum ada
        try {
            $pendingVerification = Comic::where('verification_status', 'pending')->count();
        } catch (\Throwable $e) {
            $pendingVerification = 0;
        }

        return [
            'users' => [
                'total' => (int) $userStats->users_count,
                'readers' => (int) $userStats->readers_count,
                'creators' => (int) $userStats->creators_count,
                'admins' => (int) $userStats->admins_count,
                'new_today' => $newUsersToday,
                'new_week' => $newUsersWeek,
            ],
            'comics' => [
                'total' => (int) $comicStats->comics_count,
                'published' => (int) $comicStats->published_comics_count,
                'draft' => (int) $comicStats->draft_comics_count,
            ],
            'episodes' => [
                'total' => $episodesCount,
                'published' => $publishedEpisodesCount,
            ],
            'comments' => $commentsCount,
            'reports' => [
                'pending' => $pendingReportsCount,
            ],
            'engagement' => [
                'total_views' => (int) $comicStats->total_views,
                'total_likes' => (int) $comicStats->total_likes,
            ],
            'recent_users' => $recentUsers->map(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
                'email' => $user->email,
                'avatar_url' => $user->avatar_url,
                'role' => $user->role,
                'created_at' => $user->created_at?->toIso8601String(),
            ])->values(),
            'recent_comics' => $recentComics->map(fn (Comic $comic) => [
                'id' => $comic->id,
                'title' => $comic->title,
                'slug' => $comic->slug,
                'cover_url' => $comic->cover_url ? asset('storage/'.$comic->cover_url) : null,
                'status' => $comic->status,
                'creator_name' => $comic->creator?->name,
                'view_count' => $comic->view_count,
                'like_count' => $comic->like_count,
                'rating_avg' => (float) $comic->rating_avg,
                'created_at' => $comic->created_at?->toIso8601String(),
            ])->values(),
            'revenue' => [
                'total' => round($platformRevenue, 2),
                'monthly' => round($monthlyPlatformRevenue, 2),
                'total_unlocks' => $totalUnlocks,
            ],
            'pending_verification' => $pendingVerification,
            'recent_reports' => $recentReports->map(fn (Report $report) => [
                'id' => $report->id,
                'reason' => $report->reason,
                'status' => $report->status,
                'reporter_name' => $report->reporter?->name,
                'created_at' => $report->created_at?->toIso8601String(),
            ])->values(),
        ];
    }
}

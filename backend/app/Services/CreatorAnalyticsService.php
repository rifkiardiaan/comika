<?php

namespace App\Services;

use App\Models\Comment;
use App\Models\CreatorEarning;
use App\Models\Episode;
use App\Models\Follow;
use App\Models\Comic;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class CreatorAnalyticsService
{
    /**
     * Ringkasan statistik untuk creator dashboard.
     *
     * @return array<string, mixed>
     */
    public function dashboard(User $creator): array
    {
        $comicIds = $creator->comics()->pluck('id');

        // Ringkasan komik dalam satu query
        $comicStats = $creator->comics()
            ->selectRaw('COUNT(*) as comics_count')
            ->selectRaw('COALESCE(SUM(CASE WHEN published_at IS NOT NULL THEN 1 ELSE 0 END), 0) as published_comics_count')
            ->selectRaw('COALESCE(SUM(view_count), 0) as total_views')
            ->selectRaw('COALESCE(SUM(like_count), 0) as total_likes')
            ->first();

        $episodesCount = $comicIds->isEmpty() ? 0 : Episode::whereIn('comic_id', $comicIds)->count();
        $publishedEpisodesCount = $comicIds->isEmpty() ? 0
            : Episode::whereIn('comic_id', $comicIds)->where('status', Episode::STATUS_PUBLISHED)->count();
        $totalFollowers = $comicIds->isEmpty() ? 0 : Follow::whereIn('comic_id', $comicIds)->count();
        $totalComments = $comicIds->isEmpty() ? 0
            : Comment::whereIn('comic_id', $comicIds)->count();

        $earningsPending = (float) CreatorEarning::where('creator_id', $creator->id)
            ->where('status', CreatorEarning::STATUS_PENDING)->sum('amount');
        $earningsPaid = (float) CreatorEarning::where('creator_id', $creator->id)
            ->where('status', CreatorEarning::STATUS_PAID)->sum('amount');

        $recentEpisodes = Episode::query()
            ->whereIn('comic_id', $comicIds)
            ->with('comic:id,title,slug')
            ->orderByDesc('published_at')
            ->limit(5)
            ->get();

        $recentComments = Comment::query()
            ->whereIn('comic_id', $comicIds)
            ->with(['user:id,name,username,avatar_url', 'comic:id,title'])
            ->orderByDesc('created_at')
            ->limit(5)
            ->get();

        return [
            'comics_count' => (int) $comicStats->comics_count,
            'published_comics_count' => (int) $comicStats->published_comics_count,
            'episodes_count' => $episodesCount,
            'published_episodes_count' => $publishedEpisodesCount,
            'total_views' => (int) $comicStats->total_views,
            'total_likes' => (int) $comicStats->total_likes,
            'total_followers' => $totalFollowers,
            'total_comments' => $totalComments,
            'rating_avg' => round(
                (float) ($creator->comics()->where('rating_count', '>', 0)->avg('rating_avg') ?? 0),
                2
            ),
            'earnings' => [
                'pending' => $earningsPending,
                'paid' => $earningsPaid,
                'total' => round($earningsPending + $earningsPaid, 2),
            ],
            'recent_episodes' => $recentEpisodes->map(fn (Episode $episode) => [
                'id' => $episode->id,
                'comic_id' => $episode->comic_id,
                'comic_title' => $episode->comic?->title,
                'number' => $episode->number,
                'title' => $episode->title,
                'status' => $episode->status,
                'view_count' => $episode->view_count,
                'published_at' => $episode->published_at?->toIso8601String(),
            ])->values(),
            'recent_comments' => $recentComments->map(fn (Comment $comment) => [
                'id' => $comment->id,
                'comic_id' => $comment->comic_id,
                'comic_title' => $comment->comic?->title,
                'content' => $comment->content,
                'user' => [
                    'id' => $comment->user_id,
                    'name' => $comment->user?->name,
                    'username' => $comment->user?->username,
                    'avatar_url' => $comment->user?->avatar_url,
                ],
                'created_at' => $comment->created_at?->toIso8601String(),
            ])->values(),
        ];
    }

    /**
     * Daftar komik milik creator dengan statistik (termasuk draft).
     */
    public function comics(User $creator, int $perPage = 12): LengthAwarePaginator
    {
        return $creator->comics()
            ->withCount([
                'episodes',
                'episodes as published_episodes_count' => fn ($q) => $q->where('status', Episode::STATUS_PUBLISHED),
                'episodes as draft_episodes_count' => fn ($q) => $q->where('status', Episode::STATUS_DRAFT),
                'follows',
                'comments',
            ])
            ->with(['genres'])
            ->orderByDesc('created_at')
            ->paginate($perPage);
    }

    /**
     * Komik milik creator lengkap dengan episode.
     */
    public function showComic(Comic $comic): Comic
    {
        return $comic->load([
            'creator',
            'genres',
            'episodes' => fn ($q) => $q->orderBy('number')->withCount('pages'),
        ])->loadCount([
            'episodes',
            'episodes as published_episodes_count' => fn ($q) => $q->where('status', Episode::STATUS_PUBLISHED),
            'episodes as draft_episodes_count' => fn ($q) => $q->where('status', Episode::STATUS_DRAFT),
            'follows',
            'comments',
            'bookmarks',
        ]);
    }

    /**
     * Analytics per komik: ringkasan + breakdown per episode.
     *
     * @return array<string, mixed>
     */
    public function comicAnalytics(Comic $comic): array
    {
        $comic->loadCount([
            'follows',
            'bookmarks',
            'comments',
            'episodes',
            'episodes as published_episodes_count' => fn ($q) => $q->where('status', Episode::STATUS_PUBLISHED),
            'episodes as draft_episodes_count' => fn ($q) => $q->where('status', Episode::STATUS_DRAFT),
        ]);

        $episodes = $comic->episodes()
            ->withCount(['pages', 'comments'])
            ->orderBy('number')
            ->get();

        return [
            'comic' => [
                'id' => $comic->id,
                'title' => $comic->title,
                'slug' => $comic->slug,
                'status' => $comic->status,
            ],
            'summary' => [
                'views' => (int) $comic->view_count,
                'likes' => (int) $comic->like_count,
                'rating_avg' => (float) $comic->rating_avg,
                'rating_count' => (int) $comic->rating_count,
                'followers' => $comic->follows_count,
                'bookmarks' => $comic->bookmarks_count,
                'comments' => $comic->comments_count,
                'episodes' => $comic->episodes_count,
                'published_episodes' => $comic->published_episodes_count,
                'draft_episodes' => $comic->draft_episodes_count,
            ],
            'episodes' => $episodes->map(fn (Episode $episode) => [
                'id' => $episode->id,
                'number' => $episode->number,
                'title' => $episode->title,
                'status' => $episode->status,
                'is_premium' => $episode->is_premium,
                'price_coin' => $episode->price_coin,
                'view_count' => $episode->view_count,
                'like_count' => $episode->like_count,
                'page_count' => $episode->pages_count,
                'comments_count' => $episode->comments_count,
                'published_at' => $episode->published_at?->toIso8601String(),
            ])->values(),
        ];
    }
}

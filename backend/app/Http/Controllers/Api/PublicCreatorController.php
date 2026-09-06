<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ComicResource;
use App\Http\Resources\PublicCreatorResource;
use App\Models\Comic;
use App\Models\Comment;
use App\Models\Follow;
use App\Models\User;
use Illuminate\Http\JsonResponse;

/**
 * Profil creator publik — endpoint tanpa autentikasi untuk halaman
 * profil creator yang bisa dibuka siapa saja (mis. dari kartu komik).
 */
class PublicCreatorController extends Controller
{
    /**
     * Tampilkan profil creator + statistik + daftar komik publiknya.
     */
    public function show(User $user): JsonResponse
    {
        // Hanya user yang benar-benar creator (punya profil creator)
        $user->load('creatorProfile');

        if (! $user->creatorProfile) {
            return response()->json([
                'success' => false,
                'message' => 'Creator tidak ditemukan.',
                'data' => null,
            ], 404);
        }

        // Komik publik milik creator (sudah terbit & disetujui admin)
        $comics = Comic::query()
            ->where('creator_id', $user->id)
            ->whereNotNull('published_at')
            ->where('verification_status', Comic::VERIFICATION_APPROVED)
            ->with(['creator', 'genres'])
            ->withCount('episodes')
            ->orderByDesc('view_count')
            ->get();

        $comicIds = $comics->pluck('id');

        $user->setAttribute('stats', [
            'total_comics' => $comics->count(),
            'total_episodes' => $comics->sum('episodes_count'),
            'total_views' => $comics->sum('view_count'),
            'total_likes' => $comics->sum('like_count'),
            'follower_count' => $comicIds->isNotEmpty()
                ? Follow::whereIn('comic_id', $comicIds)->count()
                : 0,
        ]);

        $user->setAttribute('public_comics', $comics);

        return response()->json([
            'success' => true,
            'message' => 'Success',
            'data' => new PublicCreatorResource($user),
        ]);
    }

    /**
     * Tampilkan profil publik user (bukan creator) — untuk melihat
     * profile pengguna lain dari komentar.
     */
    public function publicProfile(User $user): JsonResponse
    {
        $stats = [
            'comics_count' => $user->comics()->count(),
            'comments_count' => Comment::where('user_id', $user->id)->count(),
            'likes_given' => $user->likes()->count(),
        ];

        $user->setAttribute('stats', $stats);

        return response()->json([
            'success' => true,
            'message' => 'Success',
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
                'avatar_url' => $user->avatar_url,
                'role' => $user->role,
                'is_premium' => $user->isPremium(),
                'is_vvip' => $user->isVvip(),
                'created_at' => $user->created_at?->toIso8601String(),
                'stats' => $stats,
            ],
        ]);
    }
}

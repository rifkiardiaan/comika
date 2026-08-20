<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ComicResource;
use App\Http\Resources\PublicCreatorResource;
use App\Models\Comic;
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

        // Komik publik milik creator (sudah terbit)
        $comics = Comic::query()
            ->where('creator_id', $user->id)
            ->whereNotNull('published_at')
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
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Comment;
use App\Models\Comic;
use App\Models\Episode;
use App\Services\CommunityService;
use App\Services\GamificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LikeController extends Controller
{
    public function __construct(private readonly CommunityService $communityService)
    {
    }

    /**
     * Toggle like pada komik.
     */
    public function toggleComic(Request $request, Comic $comic): JsonResponse
    {
        $state = $this->communityService->toggleLike($request->user(), $comic);

        if ($state['liked']) {
            app(GamificationService::class)->trackLike($request->user());
        }

        return response()->json([
            'success' => true,
            'message' => $state['liked'] ? 'Komik disukai.' : 'Suka dihapus.',
            'data' => $state,
        ]);
    }

    /**
     * Toggle like pada episode — hanya published (atau pemilik draft-nya).
     */
    public function toggleEpisode(Request $request, Episode $episode): JsonResponse
    {
        if ($episode->status !== Episode::STATUS_PUBLISHED
            && $request->user()->id !== $episode->comic->creator_id) {
            return response()->json([
                'success' => false,
                'message' => 'Episode belum dipublikasikan.',
                'errors' => (object) [],
            ], 404);
        }

        $state = $this->communityService->toggleLike($request->user(), $episode);

        if ($state['liked']) {
            app(GamificationService::class)->trackLike($request->user());
        }

        return response()->json([
            'success' => true,
            'message' => $state['liked'] ? 'Episode disukai.' : 'Suka dihapus.',
            'data' => $state,
        ]);
    }

    /**
     * Toggle like pada komentar.
     */
    public function toggleComment(Request $request, Comment $comment): JsonResponse
    {
        $state = $this->communityService->toggleLike($request->user(), $comment);

        if ($state['liked']) {
            app(GamificationService::class)->trackLike($request->user());
        }

        return response()->json([
            'success' => true,
            'message' => $state['liked'] ? 'Komentar disukai.' : 'Suka dihapus.',
            'data' => $state,
        ]);
    }
}

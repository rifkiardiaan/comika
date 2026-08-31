<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\FollowResource;
use App\Models\Comic;
use App\Services\CommunityService;
use App\Services\GamificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FollowController extends Controller
{
    public function __construct(private readonly CommunityService $communityService)
    {
    }

    /**
     * Daftar komik yang di-follow user.
     */
    public function index(Request $request): JsonResponse
    {
        $follows = $request->user()->follows()
            ->with([
                'comic' => fn ($q) => $q->with(['creator', 'genres'])->withCount('episodes'),
            ])
            ->orderByDesc('created_at')
            ->paginate($request->integer('per_page', 12));

        return response()->json([
            'success' => true,
            'message' => 'Success',
            'data' => FollowResource::collection($follows->items()),
            'meta' => [
                'current_page' => $follows->currentPage(),
                'last_page' => $follows->lastPage(),
                'per_page' => $follows->perPage(),
                'total' => $follows->total(),
            ],
        ]);
    }

    /**
     * Toggle follow komik.
     */
    public function toggle(Request $request, Comic $comic): JsonResponse
    {
        $state = $this->communityService->toggleFollow($request->user(), $comic);

        if ($state['followed']) {
            app(GamificationService::class)->trackFollow($request->user());
        }

        return response()->json([
            'success' => true,
            'message' => $state['followed'] ? 'Komik diikuti.' : 'Berhenti mengikuti komik.',
            'data' => $state,
        ]);
    }
}

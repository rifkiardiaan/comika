<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\BookmarkResource;
use App\Models\Comic;
use App\Services\CommunityService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BookmarkController extends Controller
{
    public function __construct(private readonly CommunityService $communityService)
    {
    }

    /**
     * Daftar komik yang di-bookmark user (untuk halaman Library).
     */
    public function index(Request $request): JsonResponse
    {
        $bookmarks = $request->user()->bookmarks()
            ->with([
                'comic' => fn ($q) => $q->with(['creator', 'genres'])->withCount('episodes'),
            ])
            ->orderByDesc('created_at')
            ->paginate($request->integer('per_page', 12));

        return response()->json([
            'success' => true,
            'message' => 'Success',
            'data' => BookmarkResource::collection($bookmarks->items()),
            'meta' => [
                'current_page' => $bookmarks->currentPage(),
                'last_page' => $bookmarks->lastPage(),
                'per_page' => $bookmarks->perPage(),
                'total' => $bookmarks->total(),
            ],
        ]);
    }

    /**
     * Toggle bookmark komik.
     */
    public function toggle(Request $request, Comic $comic): JsonResponse
    {
        $state = $this->communityService->toggleBookmark($request->user(), $comic);

        return response()->json([
            'success' => true,
            'message' => $state['bookmarked'] ? 'Komik disimpan ke bookmark.' : 'Bookmark dihapus.',
            'data' => $state,
        ]);
    }
}

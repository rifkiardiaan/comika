<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CreatorComicResource;
use App\Models\Comic;
use App\Services\CreatorAnalyticsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CreatorComicController extends Controller
{
    public function __construct(private readonly CreatorAnalyticsService $analyticsService)
    {
    }

    /**
     * Daftar komik milik creator (termasuk draft) + statistik.
     */
    public function index(Request $request): JsonResponse
    {
        $comics = $this->analyticsService->comics(
            $request->user(),
            $request->integer('per_page', 12),
        );

        return response()->json([
            'success' => true,
            'message' => 'Success',
            'data' => CreatorComicResource::collection($comics->items()),
            'meta' => [
                'current_page' => $comics->currentPage(),
                'last_page' => $comics->lastPage(),
                'per_page' => $comics->perPage(),
                'total' => $comics->total(),
            ],
        ]);
    }

    /**
     * Detail komik milik creator + episode + statistik.
     */
    public function show(Request $request, Comic $comic): JsonResponse
    {
        $this->authorize('update', $comic);

        $comic = $this->analyticsService->showComic($comic);

        return response()->json([
            'success' => true,
            'message' => 'Success',
            'data' => new CreatorComicResource($comic),
        ]);
    }

    /**
     * Analytics per komik milik creator.
     */
    public function analytics(Request $request, Comic $comic): JsonResponse
    {
        $this->authorize('update', $comic);

        return response()->json([
            'success' => true,
            'message' => 'Success',
            'data' => $this->analyticsService->comicAnalytics($comic),
        ]);
    }
}

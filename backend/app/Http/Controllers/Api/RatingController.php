<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreRatingRequest;
use App\Http\Resources\RatingResource;
use App\Models\Comic;
use App\Services\CommunityService;
use Illuminate\Http\JsonResponse;

class RatingController extends Controller
{
    public function __construct(private readonly CommunityService $communityService)
    {
    }

    /**
     * Beri / perbarui rating (1–5) pada komik.
     */
    public function store(StoreRatingRequest $request, Comic $comic): JsonResponse
    {
        $rating = $this->communityService->rate(
            $request->user(),
            $comic,
            $request->integer('score'),
        );

        $rating->load('user');
        $comic->refresh();

        return response()->json([
            'success' => true,
            'message' => 'Rating berhasil disimpan.',
            'data' => [
                'rating' => new RatingResource($rating),
                'rating_avg' => (float) $comic->rating_avg,
                'rating_count' => $comic->rating_count,
            ],
        ]);
    }
}

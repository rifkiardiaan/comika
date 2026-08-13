<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CreatorEarningResource;
use App\Models\CreatorEarning;
use App\Services\MonetizationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CreatorEarningController extends Controller
{
    public function __construct(private readonly MonetizationService $monetizationService) {}

    /**
     * Ringkasan earning + riwayat earning creator.
     */
    public function index(Request $request): JsonResponse
    {
        $creator = $request->user();

        $summary = $this->monetizationService->earningsSummary($creator);

        $earnings = CreatorEarning::query()
            ->where('creator_id', $creator->id)
            ->with(['episode.comic', 'transaction'])
            ->orderByDesc('id')
            ->paginate($request->integer('per_page', 12));

        return response()->json([
            'success' => true,
            'message' => 'Success',
            'data' => [
                'summary' => $summary,
                'earnings' => CreatorEarningResource::collection($earnings->items()),
            ],
            'meta' => [
                'current_page' => $earnings->currentPage(),
                'last_page' => $earnings->lastPage(),
                'per_page' => $earnings->perPage(),
                'total' => $earnings->total(),
            ],
        ]);
    }
}

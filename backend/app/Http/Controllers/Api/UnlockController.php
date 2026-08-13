<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\EpisodeUnlockResource;
use App\Models\Episode;
use App\Services\MonetizationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UnlockController extends Controller
{
    public function __construct(private readonly MonetizationService $monetizationService) {}

    /**
     * Unlock episode premium dengan koin. Idempotent — unlock ulang gratis.
     */
    public function store(Request $request, Episode $episode): JsonResponse
    {
        $result = $this->monetizationService->unlockEpisode($request->user(), $episode);

        $message = match (true) {
            $result['owner'] => 'Episode milik Anda — tidak perlu di-unlock.',
            ! $result['created'] => 'Episode sudah di-unlock sebelumnya.',
            default => "Episode berhasil di-unlock. {$episode->price_coin} koin digunakan.",
        };

        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => [
                'is_unlocked' => $result['is_unlocked'],
                'balance' => $result['balance'],
                'unlock' => $result['unlock']
                    ? new EpisodeUnlockResource($result['unlock'])
                    : null,
            ],
        ], $result['created'] ? 201 : 200);
    }
}

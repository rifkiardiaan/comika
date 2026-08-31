<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\EpisodeUnlockResource;
use App\Http\Resources\TransactionResource;
use App\Services\WalletService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WalletController extends Controller
{
    public function __construct(private readonly WalletService $walletService) {}

    /**
     * Ringkasan dompet koin user.
     */
    public function show(Request $request): JsonResponse
    {
        $user = $request->user();

        $data = [
            'balance' => $this->walletService->balance($user),
            'total_spent' => (int) $user->transactions()
                ->where('type', 'episode_unlock')
                ->where('status', 'success')
                ->sum('coins'),
            'unlocks_count' => $user->episodeUnlocks()->count(),
            'purchases_count' => $user->transactions()
                ->where('type', 'coin_purchase')
                ->where('status', 'success')
                ->count(),
        ];

        return response()->json([
            'success' => true,
            'message' => 'Success',
            'data' => $data,
        ]);
    }

    /**
     * Riwayat transaksi user (terbaru dulu).
     */
    public function transactions(Request $request): JsonResponse
    {
        $transactions = $request->user()->transactions()
            ->with(['unlocks.episode.comic'])
            ->orderByDesc('id')
            ->paginate($request->integer('per_page', 12));

        return response()->json([
            'success' => true,
            'message' => 'Success',
            'data' => TransactionResource::collection($transactions->items()),
            'meta' => [
                'current_page' => $transactions->currentPage(),
                'last_page' => $transactions->lastPage(),
                'per_page' => $transactions->perPage(),
                'total' => $transactions->total(),
            ],
        ]);
    }

    /**
     * Daftar episode premium yang sudah di-unlock user.
     */
    public function unlocks(Request $request): JsonResponse
    {
        $unlocks = $request->user()->episodeUnlocks()
            ->with(['episode.comic'])
            ->orderByDesc('id')
            ->paginate($request->integer('per_page', 12));

        return response()->json([
            'success' => true,
            'message' => 'Success',
            'data' => EpisodeUnlockResource::collection($unlocks->items()),
            'meta' => [
                'current_page' => $unlocks->currentPage(),
                'last_page' => $unlocks->lastPage(),
                'per_page' => $unlocks->perPage(),
                'total' => $unlocks->total(),
            ],
        ]);
    }
}

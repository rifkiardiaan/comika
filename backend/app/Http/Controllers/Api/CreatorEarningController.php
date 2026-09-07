<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CreatorEarningResource;
use App\Models\CreatorEarning;
use App\Services\MonetizationService;
use App\Services\RevenueShareService;
use App\Services\WalletService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class CreatorEarningController extends Controller
{
    public function __construct(
        private readonly MonetizationService $monetizationService,
        private readonly WalletService $walletService,
        private readonly RevenueShareService $revenueShareService,
    ) {}

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

    /**
     * Transfer saldo affiliate earnings ke dompet koin.
     *
     * Creator bisa menggunakan penghasilan affiliate untuk top-up
     * dompet koin (1 koin = Rp coin_value yang dikonfigurasi admin).
     */
    public function transferToWallet(Request $request): JsonResponse
    {
        $creator = $request->user();

        $validated = $request->validate([
            'amount' => 'required|numeric|min:1',
        ]);

        $amount = round((float) $validated['amount'], 2);

        // 1 koin = Rp coin_value (bisa diubah admin), jadi jumlah koin = rupiah / coin_value
        $coinValue = $this->revenueShareService->coinValue();
        $coinsToCredit = (int) floor($amount / $coinValue);

        if ($coinsToCredit <= 0) {
            throw ValidationException::withMessages([
                'amount' => ['Minimal transfer Rp ' . number_format($coinValue, 0, ',', '.') . ' (1 koin).'],
            ]);
        }

        // Actual rupiah yang dipotong (kelipatan coin_value)
        $actualAmount = $coinsToCredit * $coinValue;

        $summary = $this->monetizationService->earningsSummary($creator);

        if ($actualAmount > $summary['available']) {
            throw ValidationException::withMessages([
                'amount' => ['Saldo affiliate tidak mencukupi. Tersedia Rp ' . number_format($summary['available'], 0, ',', '.') . '.'],
            ]);
        }

        $balance = DB::transaction(function () use ($creator, $actualAmount, $coinsToCredit) {
            // Mark earnings sebagai paid (FIFO) hingga nominal terpenuhi
            $this->monetizationService->markEarningsPaid($creator->id, $actualAmount);

            // Credit koin ke wallet
            $this->walletService->credit($creator, $coinsToCredit);

            return $creator->fresh()->coin_balance;
        });

        return response()->json([
            'success' => true,
            'message' => "Berhasil transfer {$coinsToCredit} koin dari saldo affiliate ke dompet.",
            'data' => [
                'coins_added' => $coinsToCredit,
                'amount_deducted' => $actualAmount,
                'balance' => $balance,
            ],
        ]);
    }
}

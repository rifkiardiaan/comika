<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CoinPackageResource;
use App\Http\Resources\TransactionResource;
use App\Models\CoinPackage;
use App\Services\MonetizationService;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class CoinPackageController extends Controller
{
    public function __construct(private readonly MonetizationService $monetizationService) {}

    /**
     * Daftar paket koin yang tersedia (publik).
     */
    public function index(): JsonResponse
    {
        $packages = CoinPackage::query()
            ->where('is_active', true)
            ->orderBy('coins')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Success',
            'data' => CoinPackageResource::collection($packages),
        ]);
    }

    /**
     * Beli paket koin (auth). MVP: pembayaran disimulasikan sukses instan.
     */
    public function purchase(Request $request, CoinPackage $package): JsonResponse
    {
        if (! $package->is_active) {
            throw ValidationException::withMessages([
                'package' => ['Paket koin ini sedang tidak aktif.'],
            ]);
        }

        $transaction = $this->monetizationService->purchasePackage($request->user(), $package);

        // Notifikasi transaksi: pembelian koin berhasil
        app(NotificationService::class)->send(
            $request->user(),
            NotificationService::TYPE_TRANSACTION,
            [
                'transaction_id' => $transaction->id,
                'coins' => $package->coins,
                'amount' => $package->price,
            ]
        );

        return response()->json([
            'success' => true,
            'message' => "Pembelian berhasil. {$package->coins} koin ditambahkan ke dompet Anda.",
            'data' => [
                'transaction' => new TransactionResource($transaction),
                'balance' => $request->user()->fresh()->coin_balance,
            ],
        ], 201);
    }
}

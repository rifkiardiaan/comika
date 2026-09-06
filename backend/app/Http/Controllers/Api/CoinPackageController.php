<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CoinPackageResource;
use App\Models\CoinPackage;
use App\Services\MidtransService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class CoinPackageController extends Controller
{
    public function __construct(
        private readonly MidtransService $midtransService,
    ) {}

    /**
     * Daftar paket koin yang tersedia (publik).
     */
    public function index(): JsonResponse
    {
        $packages = Cache::remember('coin_packages_active', 600, fn () => CoinPackage::query()
            ->where('is_active', true)
            ->orderBy('coins')
            ->get());

        return response()->json([
            'success' => true,
            'message' => 'Success',
            'data' => CoinPackageResource::collection($packages),
        ]);
    }

    /**
     * Beli paket koin via Midtrans.
     * Mengembalikan snap_token untuk frontend payment page.
     */
    public function purchase(Request $request, CoinPackage $package): JsonResponse
    {
        if (! $package->is_active) {
            throw ValidationException::withMessages([
                'package' => ['Paket koin ini sedang tidak aktif.'],
            ]);
        }

        $user = $request->user();
        $orderId = 'COIN-' . now()->format('ymd') . '-' . strtoupper(Str::random(12));

        // Buat transaksi pending (belum dibayar)
        $transaction = \App\Models\Transaction::create([
            'user_id' => $user->id,
            'reference' => $orderId,
            'type' => \App\Models\Transaction::TYPE_COIN_PURCHASE,
            'status' => \App\Models\Transaction::STATUS_PENDING,
            'amount' => $package->price,
            'coins' => $package->coins,
            'payment_method' => 'midtrans',
            'payment_ref' => null,
        ]);

        try {
            $snapResult = $this->midtransService->createSnapToken([
                'order_id' => $orderId,
                'gross_amount' => (int) $package->price,
                'item_name' => "Top-Up {$package->coins} Koin COMIKA",
                'item_id' => "coin-pkg-{$package->id}",
                'item_price' => (int) $package->price,
                'item_qty' => 1,
                'customer_first_name' => $user->name,
                'customer_email' => $user->email,
                'expiry_duration' => 24,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Silakan selesaikan pembayaran.',
                'data' => [
                    'snap_token' => $snapResult['token'],
                    'redirect_url' => $snapResult['redirect_url'],
                    'order_id' => $orderId,
                    'transaction_id' => $transaction->id,
                ],
            ]);
        } catch (\Exception $e) {
            $transaction->delete();

            return response()->json([
                'success' => false,
                'message' => 'Gagal membuat token pembayaran. Coba lagi.',
            ], 500);
        }
    }
}

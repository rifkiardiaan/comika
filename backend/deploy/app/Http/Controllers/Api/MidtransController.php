<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CoinPackage;
use App\Models\Subscription;
use App\Models\Transaction;
use App\Models\User;
use App\Services\MidtransService;
use App\Services\MonetizationService;
use App\Services\NotificationService;
use App\Services\WalletService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class MidtransController extends Controller
{
    public function __construct(
        private readonly MidtransService $midtransService,
        private readonly MonetizationService $monetizationService,
        private readonly WalletService $walletService,
    ) {}

    /**
     * Buat Snap Token untuk pembelian paket koin.
     * POST /api/v1/midtrans/snap-token/coin-package/{package}
     */
    public function createCoinPackageSnapToken(Request $request, CoinPackage $package): JsonResponse
    {
        if (! $package->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Paket koin ini sedang tidak aktif.',
            ], 422);
        }

        $user = $request->user();
        $orderId = 'COIN-' . now()->format('ymd') . '-' . strtoupper(Str::random(12));

        // Buat transaksi pending
        $transaction = Transaction::create([
            'user_id' => $user->id,
            'reference' => $orderId,
            'type' => Transaction::TYPE_COIN_PURCHASE,
            'status' => Transaction::STATUS_PENDING,
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
                'message' => 'Snap token berhasil dibuat.',
                'data' => [
                    'snap_token' => $snapResult['token'],
                    'redirect_url' => $snapResult['redirect_url'],
                    'order_id' => $orderId,
                    'transaction_id' => $transaction->id,
                ],
            ]);
        } catch (\Exception $e) {
            // Hapus transaksi pending jika gagal buat snap token
            $transaction->delete();

            return response()->json([
                'success' => false,
                'message' => 'Gagal membuat token pembayaran. Coba lagi.',
            ], 500);
        }
    }

    /**
     * Buat Snap Token untuk langganan premium/VVIP.
     * POST /api/v1/midtrans/snap-token/subscription
     */
    public function createSubscriptionSnapToken(Request $request): JsonResponse
    {
        $request->validate([
            'plan' => 'required|in:monthly,yearly,vvip_monthly,vvip_yearly',
        ]);

        $user = $request->user();
        $plan = $request->plan;
        $amount = Subscription::PRICES[$plan];
        $days = in_array($plan, [Subscription::PLAN_MONTHLY, Subscription::PLAN_VVIP_MONTHLY]) ? 30 : 365;
        $isVvipPlan = in_array($plan, [Subscription::PLAN_VVIP_MONTHLY, Subscription::PLAN_VVIP_YEARLY]);

        // VVIP cannot downgrade to premium
        if (! $isVvipPlan && $user->is_vvip && $user->vvip_until && $user->vvip_until->isFuture()) {
            return response()->json([
                'success' => false,
                'message' => 'Akun VVIP tidak dapat membeli langganan Premium.',
            ], 403);
        }

        // Check existing active subscription
        $existing = Subscription::where('user_id', $user->id)
            ->where('payment_status', Subscription::STATUS_PAID)
            ->where('expires_at', '>', now())
            ->first();

        $startsAt = $existing ? $existing->expires_at->addSecond() : now();
        $expiresAt = $startsAt->copy()->addDays($days);

        $orderId = 'SUB-' . now()->format('ymd') . '-' . strtoupper(Str::random(12));

        // Buat subscription pending
        $subscription = Subscription::create([
            'user_id' => $user->id,
            'plan' => $plan,
            'amount' => $amount,
            'payment_method' => 'midtrans',
            'payment_status' => Subscription::STATUS_PENDING,
            'starts_at' => $startsAt,
            'expires_at' => $expiresAt,
        ]);

        $planNames = [
            'monthly' => 'Premium Bulanan',
            'yearly' => 'Premium Tahunan',
            'vvip_monthly' => 'VVIP Bulanan',
            'vvip_yearly' => 'VVIP Tahunan',
        ];

        try {
            $snapResult = $this->midtransService->createSnapToken([
                'order_id' => $orderId,
                'gross_amount' => (int) $amount,
                'item_name' => "Langganan {$planNames[$plan]} COMIKA",
                'item_id' => "sub-{$plan}",
                'item_price' => (int) $amount,
                'item_qty' => 1,
                'customer_first_name' => $user->name,
                'customer_email' => $user->email,
                'expiry_duration' => 24,
            ]);

            // Simpan order_id ke subscription
            $subscription->update(['payment_method' => 'midtrans:' . $orderId]);

            return response()->json([
                'success' => true,
                'message' => 'Snap token berhasil dibuat.',
                'data' => [
                    'snap_token' => $snapResult['token'],
                    'redirect_url' => $snapResult['redirect_url'],
                    'order_id' => $orderId,
                    'subscription_id' => $subscription->id,
                ],
            ]);
        } catch (\Exception $e) {
            $subscription->delete();

            return response()->json([
                'success' => false,
                'message' => 'Gagal membuat token pembayaran. Coba lagi.',
            ], 500);
        }
    }

    /**
     * Webhook notification dari Midtrans (server-to-server).
     * POST /api/v1/midtrans/notification
     *
     * Tanpa autentikasi — diverifikasi langsung ke Midtrans.
     */
    public function notification(Request $request): JsonResponse
    {
        try {
            $notification = $request->all();
            $orderId = $notification['order_id'] ?? '';
            $transactionStatus = $notification['transaction_status'] ?? '';

            Log::info('Midtrans Notification Received', [
                'order_id' => $orderId,
                'transaction_status' => $transactionStatus,
            ]);

            // Verifikasi ke Midtrans server
            $verified = $this->midtransService->verifyNotification($notification);
            $status = $this->midtransService->mapStatus(
                $verified['transaction_status'],
                $verified['fraud_status']
            );

            Log::info('Midtrans Notification Verified', [
                'order_id' => $orderId,
                'verified_status' => $verified['transaction_status'],
                'mapped_status' => $status,
            ]);

            // Proses berdasarkan prefix order_id
            if (str_starts_with($orderId, 'COIN-')) {
                $this->handleCoinPackageNotification($orderId, $status, $verified);
            } elseif (str_starts_with($orderId, 'SUB-')) {
                $this->handleSubscriptionNotification($orderId, $status, $verified);
            }

            return response()->json(['status' => 'ok']);
        } catch (\Exception $e) {
            Log::error('Midtrans Notification Error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json(['status' => 'error'], 500);
        }
    }

    /**
     * Proses notifikasi pembelian koin.
     */
    private function handleCoinPackageNotification(string $orderId, string $status, array $verified): void
    {
        $transaction = Transaction::where('reference', $orderId)->first();

        if (! $transaction) {
            Log::warning('Midtrans: Transaction not found', ['order_id' => $orderId]);
            return;
        }

        if ($transaction->status === Transaction::STATUS_SUCCESS) {
            Log::info('Midtrans: Transaction already processed', ['order_id' => $orderId]);
            return;
        }

        $transaction->update([
            'status' => $status,
            'payment_ref' => json_encode([
                'payment_type' => $verified['payment_type'],
                'bank' => $verified['bank'] ?? null,
                'va_number' => $verified['va_number'] ?? null,
            ]),
            'paid_at' => $status === 'success' ? now() : null,
        ]);

        // Jika berhasil, kredit koin ke wallet
        if ($status === 'success') {
            $user = $transaction->user;
            $this->walletService->credit($user, $transaction->coins);

            // Kirim notifikasi
            app(NotificationService::class)->send(
                $user,
                NotificationService::TYPE_TRANSACTION,
                [
                    'transaction_id' => $transaction->id,
                    'coins' => $transaction->coins,
                    'amount' => $transaction->amount,
                ]
            );
        }
    }

    /**
     * Proses notifikasi langganan premium/VVIP.
     */
    private function handleSubscriptionNotification(string $orderId, string $status, array $verified): void
    {
        // Cari subscription berdasarkan payment_method yang berisi order_id
        $subscription = Subscription::where('payment_method', 'like', '%'.$orderId.'%')
            ->where('payment_status', Subscription::STATUS_PENDING)
            ->first();

        if (! $subscription) {
            Log::warning('Midtrans: Subscription not found', ['order_id' => $orderId]);
            return;
        }

        if ($subscription->payment_status === Subscription::STATUS_PAID) {
            Log::info('Midtrans: Subscription already processed', ['order_id' => $orderId]);
            return;
        }

        $subscription->update([
            'payment_status' => $status === 'success' ? Subscription::STATUS_PAID : Subscription::STATUS_FAILED,
            'payment_method' => $verified['payment_type'] ?? 'midtrans',
        ]);

        // Jika berhasil, aktifkan langganan
        if ($status === 'success') {
            $user = $subscription->user;
            $isVvipPlan = in_array($subscription->plan, [Subscription::PLAN_VVIP_MONTHLY, Subscription::PLAN_VVIP_YEARLY], true);

            if ($isVvipPlan) {
                $user->update([
                    'is_premium' => true,
                    'premium_until' => $subscription->expires_at,
                    'is_vvip' => true,
                    'vvip_until' => $subscription->expires_at,
                ]);
            } else {
                $user->update([
                    'is_premium' => true,
                    'premium_until' => $subscription->expires_at,
                ]);
            }

            // Update paid_at
            $subscription->update(['paid_at' => now()]);
        }
    }

    /**
     * Cek status pembayaran Midtrans untuk transaksi tertentu.
     * GET /api/v1/midtrans/status/{orderId}
     */
    public function status(string $orderId): JsonResponse
    {
        $result = $this->midtransService->getTransactionStatus($orderId);

        return response()->json([
            'success' => true,
            'data' => $result,
        ]);
    }
}

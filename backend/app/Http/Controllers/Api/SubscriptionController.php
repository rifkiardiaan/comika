<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Subscription;
use App\Models\User;
use App\Services\MidtransService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class SubscriptionController extends Controller
{
    public function __construct(
        private readonly MidtransService $midtransService,
    ) {}

    /**
     * Get available subscription plans.
     */
    public function plans(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => [
                [
                    'id' => 'monthly',
                    'name' => 'Premium Bulanan',
                    'description' => 'Akses premium selama 30 hari',
                    'price' => Subscription::PRICES[Subscription::PLAN_MONTHLY],
                    'formatted_price' => 'Rp 29.000',
                    'duration_days' => 30,
                    'badge' => '🥉',
                    'tier' => 'premium',
                    'features' => ['Bebas iklan', 'Badge Premium eksklusif', 'Akses fitur prioritas'],
                ],
                [
                    'id' => 'yearly',
                    'name' => 'Premium Tahunan',
                    'description' => 'Akses premium selama 365 hari (hemat 29%)',
                    'price' => Subscription::PRICES[Subscription::PLAN_YEARLY],
                    'formatted_price' => 'Rp 249.000',
                    'duration_days' => 365,
                    'badge' => '👑',
                    'savings' => 'Hemat Rp 97.000/tahun',
                    'tier' => 'premium',
                    'features' => ['Bebas iklan', 'Badge Premium eksklusif', 'Akses fitur prioritas'],
                ],
                [
                    'id' => 'vvip_monthly',
                    'name' => 'VVIP Bulanan',
                    'description' => 'Akses VVIP selama 30 hari — semua episode terbuka',
                    'price' => Subscription::PRICES[Subscription::PLAN_VVIP_MONTHLY],
                    'formatted_price' => 'Rp 99.000',
                    'duration_days' => 30,
                    'badge' => '💎',
                    'tier' => 'vvip',
                    'features' => ['Bebas iklan', 'Semua episode premium terbuka', 'Badge VVIP eksklusif', 'Akses fitur prioritas'],
                ],
                [
                    'id' => 'vvip_yearly',
                    'name' => 'VVIP Tahunan',
                    'description' => 'Akses VVIP selama 365 hari — semua episode terbuka',
                    'price' => Subscription::PRICES[Subscription::PLAN_VVIP_YEARLY],
                    'formatted_price' => 'Rp 699.000',
                    'duration_days' => 365,
                    'badge' => '💎',
                    'savings' => 'Hemat Rp 489.000/tahun',
                    'tier' => 'vvip',
                    'features' => ['Bebas iklan', 'Semua episode premium terbuka', 'Badge VVIP eksklusif', 'Akses fitur prioritas'],
                ],
            ],
        ]);
    }

    /**
     * Get current user's subscription status.
     */
    public function status(Request $request): JsonResponse
    {
        $user = $request->user();
        $activeSub = Subscription::where('user_id', $user->id)
            ->where('payment_status', Subscription::STATUS_PAID)
            ->where('expires_at', '>', now())
            ->latest()
            ->first();

        $isPremium = $user->is_premium && $user->premium_until && $user->premium_until->isFuture();
        $isVvip = $user->is_vvip && $user->vvip_until && $user->vvip_until->isFuture();

        return response()->json([
            'success' => true,
            'data' => [
                'is_premium' => $isPremium || ($activeSub !== null && ! $activeSub->isVvip()),
                'is_vvip' => $isVvip || ($activeSub !== null && $activeSub->isVvip()),
                'plan' => $activeSub?->plan,
                'expires_at' => $activeSub?->expires_at?->toIso8601String(),
                'days_remaining' => $activeSub ? max(0, now()->diffInDays($activeSub->expires_at, false)) : 0,
            ],
        ]);
    }

    /**
     * Subscribe to a plan via Midtrans.
     * Mengembalikan snap_token untuk frontend payment page.
     */
    public function subscribe(Request $request): JsonResponse
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
                'message' => 'Akun VVIP tidak dapat membeli langganan Premium. Kamu sudah memiliki akses VVIP yang lebih unggul.',
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
            'payment_method' => 'midtrans:' . $orderId,
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

            return response()->json([
                'success' => true,
                'message' => 'Silakan selesaikan pembayaran.',
                'data' => [
                    'snap_token' => $snapResult['token'],
                    'redirect_url' => $snapResult['redirect_url'],
                    'order_id' => $orderId,
                    'subscription_id' => $subscription->id,
                    'days_added' => $days,
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
     * Cancel subscription (at end of period).
     */
    public function cancel(Request $request): JsonResponse
    {
        $user = $request->user();

        $subscription = Subscription::where('user_id', $user->id)
            ->where('payment_status', Subscription::STATUS_PAID)
            ->where('expires_at', '>', now())
            ->latest()
            ->first();

        if (! $subscription) {
            return response()->json([
                'success' => false,
                'message' => 'Tidak ada langganan aktif.',
            ], 404);
        }

        $subscription->update(['payment_status' => Subscription::STATUS_EXPIRED]);

        $hasOther = Subscription::where('user_id', $user->id)
            ->where('id', '!=', $subscription->id)
            ->where('payment_status', Subscription::STATUS_PAID)
            ->where('expires_at', '>', now())
            ->exists();

        if (! $hasOther) {
            $user->update([
                'is_premium' => false,
                'premium_until' => null,
                'is_vvip' => false,
                'vvip_until' => null,
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Langganan akan berakhir saat masa aktif habis.',
        ]);
    }
}

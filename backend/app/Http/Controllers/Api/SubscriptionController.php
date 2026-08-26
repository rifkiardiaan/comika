<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SubscriptionController extends Controller
{
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
     * Subscribe to a premium plan.
     * In production, this would integrate with a payment gateway.
     * For now, we simulate instant payment approval.
     */
    public function subscribe(Request $request): JsonResponse
    {
        $request->validate([
            'plan' => 'required|in:monthly,yearly,vvip_monthly,vvip_yearly',
            'payment_method' => 'nullable|string|max:50',
        ]);

        $user = $request->user();
        $plan = $request->plan;
        $amount = Subscription::PRICES[$plan];
        $days = in_array($plan, [Subscription::PLAN_MONTHLY, Subscription::PLAN_VVIP_MONTHLY]) ? 30 : 365;
        $isVvipPlan = in_array($plan, [Subscription::PLAN_VVIP_MONTHLY, Subscription::PLAN_VVIP_YEARLY]);

        // Check if user already has active subscription for same tier
        $existing = Subscription::where('user_id', $user->id)
            ->where('payment_status', Subscription::STATUS_PAID)
            ->where('expires_at', '>', now())
            ->first();

        $startsAt = $existing ? $existing->expires_at->addSecond() : now();
        $expiresAt = $startsAt->copy()->addDays($days);

        DB::beginTransaction();
        try {
            $subscription = Subscription::create([
                'user_id' => $user->id,
                'plan' => $plan,
                'amount' => $amount,
                'payment_method' => $request->payment_method ?? 'demo',
                'payment_status' => Subscription::STATUS_PAID,
                'starts_at' => $startsAt,
                'expires_at' => $expiresAt,
                'paid_at' => now(),
            ]);

            if ($isVvipPlan) {
                // VVIP subscription: update both VVIP and premium status
                $user->update([
                    'is_premium' => true,
                    'premium_until' => $expiresAt,
                    'is_vvip' => true,
                    'vvip_until' => $expiresAt,
                ]);
            } else {
                // Regular premium subscription
                $user->update([
                    'is_premium' => true,
                    'premium_until' => $expiresAt,
                ]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => $isVvipPlan ? 'Berhasil berlangganan VVIP! Semua episode premium terbuka.' : 'Berhasil berlangganan Premium!',
                'data' => [
                    'subscription' => $subscription,
                    'expires_at' => $expiresAt->toIso8601String(),
                    'days_added' => $days,
                    'is_vvip' => $isVvipPlan,
                ],
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal memproses langganan.',
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

        // Don't refund, just mark as will not renew
        $subscription->update(['payment_status' => Subscription::STATUS_EXPIRED]);

        // Update user if no other active subscriptions
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

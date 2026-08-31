<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PushSubscription;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Web push notification (blueprint 24 — push notification).
 *
 * Endpoint untuk mengelola subscription push browser: mengambil public key
 * VAPID, menyimpan/memperbarui subscription, dan menghapus saat user
 * menonaktifkan notifikasi.
 */
class PushController extends Controller
{
    /**
     * Public key VAPID (base64url) — dipakai browser saat subscribe.
     * Kunci publik memang untuk dibagikan, jadi endpoint ini publik.
     */
    public function vapidPublicKey(): JsonResponse
    {
        $publicKey = config('services.webpush.vapid.public_key');

        if (empty($publicKey)) {
            return response()->json([
                'success' => false,
                'message' => 'Web push belum dikonfigurasi di server.',
            ], 503);
        }

        return response()->json([
            'success' => true,
            'message' => 'Success',
            'data' => ['public_key' => $publicKey],
        ]);
    }

    /**
     * Daftar subscription push milik user (untuk status di halaman profil).
     */
    public function index(Request $request): JsonResponse
    {
        $subscriptions = $request->user()->pushSubscriptions()
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (PushSubscription $s) => [
                'id' => $s->id,
                'endpoint' => $s->endpoint,
                'user_agent' => $s->user_agent,
                'created_at' => $s->created_at?->toIso8601String(),
            ])->values();

        return response()->json([
            'success' => true,
            'message' => 'Success',
            'data' => [
                'configured' => $this->configured(),
                'subscriptions' => $subscriptions,
            ],
        ]);
    }

    /**
     * Simpan/perbarui subscription push dari browser (upsert per endpoint).
     */
    public function subscribe(Request $request): JsonResponse
    {
        if (! $this->configured()) {
            return response()->json([
                'success' => false,
                'message' => 'Web push belum dikonfigurasi di server.',
            ], 503);
        }

        $validated = $request->validate([
            'endpoint' => ['required', 'string', 'url', 'max:500'],
            'keys' => ['required', 'array'],
            'keys.p256dh' => ['required', 'string'],
            'keys.auth' => ['required', 'string'],
            'user_agent' => ['nullable', 'string', 'max:255'],
        ]);

        $subscription = PushSubscription::updateOrCreate(
            ['endpoint' => $validated['endpoint']],
            [
                'user_id' => $request->user()->id,
                'keys' => [
                    'p256dh' => $validated['keys']['p256dh'],
                    'auth' => $validated['keys']['auth'],
                ],
                'user_agent' => $validated['user_agent']
                    ?? ($request->userAgent() ? substr($request->userAgent(), 0, 255) : null),
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Subscription push tersimpan.',
            'data' => ['id' => $subscription->id],
        ], 201);
    }

    /**
     * Hapus subscription push (user menonaktifkan notifikasi di perangkat ini).
     */
    public function unsubscribe(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'endpoint' => ['required', 'string', 'max:1000'],
        ]);

        $deleted = $request->user()->pushSubscriptions()
            ->where('endpoint', $validated['endpoint'])
            ->delete();

        return response()->json([
            'success' => true,
            'message' => 'Subscription push dihapus.',
            'data' => ['deleted' => $deleted],
        ]);
    }

    private function configured(): bool
    {
        $vapid = config('services.webpush.vapid');

        return ! empty($vapid['public_key']) && ! empty($vapid['private_key']);
    }
}

<?php

namespace App\Services;

use App\Models\PushSubscription;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Minishlink\WebPush\Subscription;
use Minishlink\WebPush\WebPush;

/**
 * Pengiriman web push notification (Web Push API + VAPID).
 *
 * Subscription disimpan per user di tabel push_subscriptions; setiap
 * notifikasi in-app yang dibuat otomatis ikut dikirim sebagai push ke
 * semua browser/device terdaftar milik user.
 */
class WebPushService
{
    /** Apakah VAPID sudah dikonfigurasi di .env (kunci public + private). */
    public function isConfigured(): bool
    {
        $vapid = config('services.webpush.vapid');

        return ! empty($vapid['public_key']) && ! empty($vapid['private_key']);
    }

    /**
     * Kirim push notification ke semua subscription milik user.
     *
     * @param  array<string, mixed>  $data  Data opsional untuk service worker
     *                                      (url tujuan, notification_id, type, dst.)
     * @return int Jumlah subscription yang berhasil dikirimi push.
     */
    public function sendToUser(User|int $user, string $title, string $body, array $data = []): int
    {
        if (! $this->isConfigured()) {
            return 0;
        }

        $userId = $user instanceof User ? $user->id : $user;

        $subscriptions = PushSubscription::query()
            ->where('user_id', $userId)
            ->get();

        if ($subscriptions->isEmpty()) {
            return 0;
        }

        $payload = json_encode([
            'title' => $title,
            'body' => $body,
            'data' => $data,
        ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

        $webPush = new WebPush([
            'VAPID' => [
                'subject' => config('services.webpush.vapid.subject'),
                'publicKey' => config('services.webpush.vapid.public_key'),
                'privateKey' => config('services.webpush.vapid.private_key'),
            ],
        ], ['TTL' => 86400]);

        foreach ($subscriptions as $subscription) {
            $webPush->queueNotification(
                Subscription::create([
                    'endpoint' => $subscription->endpoint,
                    'keys' => $subscription->keys ?? [],
                ]),
                $payload,
                ['TTL' => 86400]
            );
        }

        $sent = 0;
        foreach ($webPush->flush() as $report) {
            if ($report->isSuccess()) {
                $sent++;
            } elseif ($report->isSubscriptionExpired()) {
                // Endpoint sudah tidak valid (browser di-unsubscribe/expired) — bersihkan
                PushSubscription::query()->where('endpoint', $report->getEndpoint())->delete();
            } else {
                Log::warning('Web push gagal dikirim', [
                    'endpoint' => $report->getEndpoint(),
                    'reason' => $report->getReason(),
                ]);
            }
        }

        return $sent;
    }
}

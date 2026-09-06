<?php

namespace App\Console\Commands;

use App\Models\Subscription;
use App\Services\NotificationService;
use Illuminate\Console\Command;

/**
 * Kirim notifikasi pengingat ke user yang langganannya akan habis dalam 3 hari.
 *
 * Jalankan via scheduler (daily):
 *   $schedule->command('subscription:expiry-reminder')->daily();
 */
class SubscriptionExpiryReminderCommand extends Command
{
    protected $signature = 'subscription:expiry-reminder';

    protected $description = 'Send expiry reminder notifications for subscriptions expiring within 3 days';

    public function handle(): int
    {
        // Cari subscription yang aktif dan berakhir dalam 1-3 hari
        $expiring = Subscription::query()
            ->where('payment_status', Subscription::STATUS_PAID)
            ->where('expires_at', '>', now())
            ->where('expires_at', '<=', now()->addDays(3))
            ->with('user:id,name')
            ->get();

        if ($expiring->isEmpty()) {
            $this->info('No expiring subscriptions found.');
            return self::SUCCESS;
        }

        $notificationService = app(NotificationService::class);
        $notified = 0;

        foreach ($expiring as $sub) {
            $user = $sub->user;
            if (! $user) {
                continue;
            }

            $daysRemaining = max(0, now()->diffInDays($sub->expires_at, false));
            $tier = $sub->isVvip() ? 'vvip' : 'premium';

            // Cek apakah sudah ada notifikasi serupa yang belum dibaca hari ini
            $alreadyNotified = $user->appNotifications()
                ->where('type', NotificationService::TYPE_SUBSCRIPTION_EXPIRING)
                ->whereDate('created_at', today())
                ->whereJsonContains('data.tier', $tier)
                ->exists();

            if ($alreadyNotified) {
                continue;
            }

            $notificationService->send($user, NotificationService::TYPE_SUBSCRIPTION_EXPIRING, [
                'subscription_id' => $sub->id,
                'tier' => $tier,
                'plan' => $sub->plan,
                'days_remaining' => $daysRemaining,
                'expires_at' => $sub->expires_at->toIso8601String(),
            ]);

            $notified++;
        }

        $this->info("Sent {$notified} expiry reminder(s).");
        return self::SUCCESS;
    }
}

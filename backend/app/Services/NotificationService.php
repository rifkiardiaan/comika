<?php

namespace App\Services;

use App\Models\Episode;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

/**
 * Notifikasi in-app COMIKA (blueprint 24_notification_system).
 *
 * Delivery via database notification — Web & mobile membaca notifikasi
 * via REST API; status dibaca (read_at) di-sinkronkan dari client.
 * Setiap notifikasi yang dibuat otomatis juga dikirim sebagai web push
 * ke browser/device terdaftar (bila VAPID dikonfigurasi).
 */
class NotificationService
{
    public const TYPE_NEW_EPISODE = 'new_episode';
    public const TYPE_COMIC_UPDATE = 'comic_update';
    public const TYPE_COMMENT_REPLY = 'comment_reply';
    public const TYPE_TRANSACTION = 'transaction';
    public const TYPE_SYSTEM = 'system';
    public const TYPE_SUBSCRIPTION_EXPIRING = 'subscription_expiring';

    /**
     * Kirim satu notifikasi ke seorang user (in-app + web push bila aktif).
     *
     * @param  array<string, mixed>  $data
     */
    public function send(User|int $user, string $type, array $data = []): Notification
    {
        $userId = $user instanceof User ? $user->id : $user;

        $notification = Notification::create([
            'id' => (string) Str::uuid(),
            'user_id' => $userId,
            'type' => $type,
            'data' => $data,
        ]);

        $this->push($notification);

        return $notification;
    }

    /**
     * Kirim notifikasi "episode baru" ke semua follower komik.
     *
     * @return int Jumlah follower yang diberi notifikasi.
     */
    public function notifyNewEpisode(Episode $episode): int
    {
        $comic = $episode->comic;
        // Abaikan follower yang akunnya sudah dihapus (soft delete)
        $followerIds = $comic->follows()
            ->whereHas('user', fn ($q) => $q->whereNull('deleted_at'))
            ->pluck('user_id')
            ->all();

        foreach ($followerIds as $userId) {
            $this->send($userId, self::TYPE_NEW_EPISODE, [
                'comic_id' => $comic->id,
                'comic_title' => $comic->title,
                'comic_slug' => $comic->slug,
                'episode_id' => $episode->id,
                'episode_number' => $episode->number,
                'episode_title' => $episode->title,
            ]);
        }

        return count($followerIds);
    }

    /**
     * Kirim web push untuk sebuah notifikasi (best-effort — error tidak
     * mempengaruhi penyimpanan notifikasi in-app).
     */
    private function push(Notification $notification): void
    {
        try {
            app(WebPushService::class)->sendToUser(
                $notification->user_id,
                $this->titleFor($notification),
                $this->bodyFor($notification),
                [
                    'url' => $this->targetFor($notification),
                    'notification_id' => $notification->id,
                    'type' => $notification->type,
                ]
            );
        } catch (\Throwable $e) {
            Log::warning('Gagal mengirim web push', [
                'notification_id' => $notification->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /** Judul notifikasi untuk tampilan push. */
    private function titleFor(Notification $notification): string
    {
        $data = $notification->data ?? [];

        return match ($notification->type) {
            self::TYPE_NEW_EPISODE => sprintf(
                'Episode %s — %s',
                $data['episode_number'] ?? '',
                $data['episode_title'] ?? 'Baru'
            ),
            self::TYPE_COMIC_UPDATE => sprintf('Status "%s" diperbarui', $data['comic_title'] ?? 'Komik'),
            self::TYPE_COMMENT_REPLY => 'Komentarmu dibalas',
            self::TYPE_TRANSACTION => isset($data['coins']) ? 'Pembelian koin berhasil' : 'Penarikan dana diperbarui',
            self::TYPE_SUBSCRIPTION_EXPIRING => 'Langganan Segera Habis!',
            default => 'Notifikasi COMIKA',
        };
    }

    /** Deskripsi notifikasi untuk tampilan push. */
    private function bodyFor(Notification $notification): string
    {
        $data = $notification->data ?? [];

        return match ($notification->type) {
            self::TYPE_NEW_EPISODE => sprintf('Episode baru dari %s', $data['comic_title'] ?? 'komik yang kamu ikuti'),
            self::TYPE_COMIC_UPDATE => sprintf('Status komik kini: %s', $this->statusLabel((string) ($data['status'] ?? ''))),
            self::TYPE_COMMENT_REPLY => $data['reply_snippet'] ?? 'Seseorang membalas komentarmu',
            self::TYPE_TRANSACTION => isset($data['coins'])
                ? sprintf('%s koin ditambahkan ke dompetmu', $data['coins'])
                : sprintf('Status penarikan: %s', $this->statusLabel((string) ($data['status'] ?? ''))),
            self::TYPE_SUBSCRIPTION_EXPIRING => sprintf(
                'Langganan %s kamu berakhir dalam %d hari. Perpanjang sekarang!',
                strtoupper($data['tier'] ?? ''),
                $data['days_remaining'] ?? 0
            ),
            default => '',
        };
    }

    /** URL tujuan saat push diklik (relatif — di-resolve service worker). */
    private function targetFor(Notification $notification): string
    {
        $data = $notification->data ?? [];

        return match ($notification->type) {
            self::TYPE_NEW_EPISODE => sprintf(
                '/comic/%s/episode/%s',
                $data['comic_id'] ?? '',
                $data['episode_id'] ?? ''
            ),
            self::TYPE_COMIC_UPDATE, self::TYPE_COMMENT_REPLY => sprintf('/comic/%s', $data['comic_id'] ?? ''),
            self::TYPE_TRANSACTION => '/wallet',
            self::TYPE_SUBSCRIPTION_EXPIRING => '/premium',
            default => '/notifications',
        };
    }

    /** Label bahasa Indonesia untuk kode status (komik & withdrawal). */
    private function statusLabel(string $status): string
    {
        $map = [
            'ongoing' => 'Ongoing',
            'completed' => 'Completed',
            'hiatus' => 'Hiatus',
            'pending' => 'Menunggu',
            'approved' => 'Disetujui',
            'rejected' => 'Ditolak',
            'paid' => 'Dibayar',
        ];

        return $map[$status] ?? $status;
    }
}

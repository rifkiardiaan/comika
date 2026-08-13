<?php

namespace App\Services;

use App\Models\Episode;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Support\Str;

/**
 * Notifikasi in-app COMIKA (blueprint 24_notification_system).
 *
 * MVP: delivery via database notification — tanpa WebSocket / push.
 * Web & mobile membaca notifikasi via REST API; status dibaca (read_at)
 * di-sinkronkan dari client.
 */
class NotificationService
{
    public const TYPE_NEW_EPISODE = 'new_episode';
    public const TYPE_COMIC_UPDATE = 'comic_update';
    public const TYPE_COMMENT_REPLY = 'comment_reply';
    public const TYPE_TRANSACTION = 'transaction';
    public const TYPE_SYSTEM = 'system';

    /**
     * Kirim satu notifikasi ke seorang user.
     *
     * @param  array<string, mixed>  $data
     */
    public function send(User|int $user, string $type, array $data = []): Notification
    {
        $userId = $user instanceof User ? $user->id : $user;

        return Notification::create([
            'id' => (string) Str::uuid(),
            'user_id' => $userId,
            'type' => $type,
            'data' => $data,
        ]);
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
}

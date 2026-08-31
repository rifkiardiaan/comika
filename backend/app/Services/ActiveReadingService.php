<?php

namespace App\Services;

use App\Models\ActiveReading;
use App\Models\Episode;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class ActiveReadingService
{
    /**
     * Cek apakah tabel active_readers sudah ada.
     */
    private function tableExists(): bool
    {
        return Schema::hasTable('active_readers');
    }

    /**
     * Catat / perbarui heartbeat saat user membuka atau membaca halaman.
     */
    public function heartbeat(User $user, Episode $episode, int $lastPage, float $progress): ?ActiveReading
    {
        if (! $this->tableExists()) {
            return null;
        }

        $record = ActiveReading::updateOrCreate(
            ['user_id' => $user->id, 'episode_id' => $episode->id],
            [
                'comic_id' => $episode->comic_id,
                'last_page' => $lastPage,
                'progress' => $progress,
                'last_heartbeat_at' => now(),
            ],
        );

        return $record->load(['user:id,name,username,avatar_url,is_vvip', 'comic:id,title,cover_url', 'episode:id,title,number,is_premium,price_coin']);
    }

    /**
     * Hapus session aktif user di episode tertentu (ketika user keluar dari reader).
     */
    public function endSession(User $user, int $episodeId): void
    {
        if (! $this->tableExists()) {
            return;
        }

        ActiveReading::where('user_id', $user->id)
            ->where('episode_id', $episodeId)
            ->delete();
    }

    /**
     * Ambil semua pembaca yang masih aktif (heartbeat tidak stale).
     */
    public function getActiveReaders(string $type = '', ?int $userId = null, ?int $comicId = null): \Illuminate\Support\Collection
    {
        if (! $this->tableExists()) {
            return collect();
        }

        $staleThreshold = now()->subSeconds(ActiveReading::STALE_SECONDS);

        $query = ActiveReading::query()
            ->with(['user:id,name,username,avatar_url,is_vvip', 'comic:id,title,cover_url', 'episode:id,title,number,is_premium,price_coin'])
            ->where('last_heartbeat_at', '>', $staleThreshold);

        // Filter tipe akses
        if ($type === 'free') {
            $query->whereHas('episode', fn ($q) => $q->where('is_premium', false));
        } elseif ($type === 'paid') {
            $query->whereHas('episode', fn ($q) => $q->where('is_premium', true));
            $query->whereHas('user', fn ($q) => $q->where('is_vvip', false));
        } elseif ($type === 'vvip') {
            $query->whereHas('user', fn ($q) => $q->where('is_vvip', true));
            $query->whereHas('episode', fn ($q) => $q->where('is_premium', true));
        }

        if ($userId) {
            $query->where('user_id', $userId);
        }
        if ($comicId) {
            $query->where('comic_id', $comicId);
        }

        $readers = $query->orderByDesc('last_heartbeat_at')->get();

        // Enrich with access type & coins spent
        return $readers->map(function ($r) {
            $isPremium = $r->episode->is_premium ?? false;
            $isVvip = $r->user->is_vvip ?? false;

            $isUnlocked = false;
            $coinsSpent = 0;
            if ($isPremium) {
                $unlock = \App\Models\EpisodeUnlock::where('user_id', $r->user_id)
                    ->where('episode_id', $r->episode_id)
                    ->first();
                if ($unlock) {
                    $isUnlocked = true;
                    $coinsSpent = $unlock->coins_spent;
                }
            }

            $accessType = 'free';
            if ($isPremium && $isVvip) {
                $accessType = 'vvip';
            } elseif ($isPremium && $isUnlocked) {
                $accessType = 'paid';
            } elseif ($isPremium) {
                $accessType = 'premium_locked';
            }

            return [
                'id' => $r->id,
                'user' => [
                    'id' => $r->user_id,
                    'name' => $r->user?->name,
                    'username' => $r->user?->username,
                    'avatar_url' => $r->user?->avatar_url,
                    'is_vvip' => $isVvip,
                ],
                'comic' => [
                    'id' => $r->comic_id,
                    'title' => $r->comic?->title,
                    'cover_url' => $r->comic?->cover_url,
                ],
                'episode' => [
                    'id' => $r->episode_id,
                    'number' => $r->episode?->number,
                    'title' => $r->episode?->title,
                    'is_premium' => $isPremium,
                    'price_coin' => $r->episode?->price_coin ?? 0,
                ],
                'access_type' => $accessType,
                'coins_spent' => $coinsSpent,
                'progress' => $r->progress,
                'last_page' => $r->last_page,
                'last_heartbeat_at' => $r->last_heartbeat_at?->toIso8601String(),
                'duration_seconds' => $r->created_at?->diffInSeconds(now()),
            ];
        });
    }

    /**
     * Hitung jumlah pembaca aktif berdasarkan tipe.
     */
    public function getActiveCount(): array
    {
        if (! $this->tableExists()) {
            return [
                'total_active' => 0,
                'unique_users' => 0,
                'unique_comics' => 0,
                'free' => 0,
                'paid' => 0,
                'vvip' => 0,
            ];
        }

        $staleThreshold = now()->subSeconds(ActiveReading::STALE_SECONDS);

        $base = ActiveReading::where('last_heartbeat_at', '>', $staleThreshold);

        $total = (clone $base)->count();
        $free = (clone $base)->whereHas('episode', fn ($q) => $q->where('is_premium', false))->count();
        $paid = (clone $base)->whereHas('episode', fn ($q) => $q->where('is_premium', true))
            ->whereHas('user', fn ($q) => $q->where('is_vvip', false))->count();
        $vvip = (clone $base)->whereHas('user', fn ($q) => $q->where('is_vvip', true))
            ->whereHas('episode', fn ($q) => $q->where('is_premium', true))->count();
        $uniqueUsers = (clone $base)->distinct('user_id')->count('user_id');
        $uniqueComics = (clone $base)->distinct('comic_id')->count('comic_id');

        return [
            'total_active' => $total,
            'unique_users' => $uniqueUsers,
            'unique_comics' => $uniqueComics,
            'free' => $free,
            'paid' => $paid,
            'vvip' => $vvip,
        ];
    }

    /**
     * Bersihkan session yang sudah stale (bisa dijadwalkan via cron/queue).
     */
    public function cleanupStaleSessions(): int
    {
        if (! $this->tableExists()) {
            return 0;
        }

        return ActiveReading::where('last_heartbeat_at', '<=', now()->subSeconds(ActiveReading::STALE_SECONDS))->delete();
    }
}

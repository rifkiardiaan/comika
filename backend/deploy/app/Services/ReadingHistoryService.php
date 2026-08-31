<?php

namespace App\Services;

use App\Models\Comic;
use App\Models\Episode;
use App\Models\ReadingHistory;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class ReadingHistoryService
{
    /**
     * Rekam / perbarui progress baca untuk user pada sebuah episode.
     *
     * - Upsert berdasarkan (user_id, comic_id, episode_id).
     * - Hitungan view hanya bertambah saat baris pertama kali dibuat
     *   (satu "read event" per user per episode, anti refresh spam).
     * - `last_page` di-clamp ke jumlah halaman; melewati halaman terakhir
     *   otomatis menandai episode selesai.
     */
    public function recordProgress(
        User $user,
        Episode $episode,
        int $lastPage,
        ?float $progress = null,
        ?bool $isCompleted = null,
    ): ReadingHistory {
        $totalPages = $episode->pages()->count();
        $lastPage = max(1, min($lastPage, max(1, $totalPages)));

        if ($progress === null) {
            $progress = $totalPages > 0
                ? round(($lastPage / $totalPages) * 100, 2)
                : 0.0;
        }
        $progress = max(0.0, min(100.0, $progress));

        $completed = $isCompleted ?? ($totalPages > 0 && $lastPage >= $totalPages);

        return DB::transaction(function () use ($user, $episode, $lastPage, $progress, $completed) {
            $history = ReadingHistory::updateOrCreate(
                [
                    'user_id' => $user->id,
                    'comic_id' => $episode->comic_id,
                    'episode_id' => $episode->id,
                ],
                [
                    'last_page' => $lastPage,
                    'progress' => $progress,
                    'is_completed' => $completed,
                ]
            );

            // Baris baru = user baru mulai membaca episode ini → hitung view sekali.
            if ($history->wasRecentlyCreated) {
                $episode->increment('view_count');
                Comic::whereKey($episode->comic_id)->increment('view_count');
            }

            return $history->fresh();
        });
    }

    /**
     * Riwayat baca user, terbaru dulu (untuk "Lanjutkan Baca").
     */
    public function history(User $user, int $perPage = 12): LengthAwarePaginator
    {
        return $user->readingHistories()
            ->with([
                'comic' => fn ($q) => $q->with(['creator', 'genres'])->withCount('episodes'),
                'episode' => fn ($q) => $q->withCount('pages'),
            ])
            ->orderByDesc('updated_at')
            ->orderByDesc('id')
            ->paginate($perPage);
    }

    /**
     * Progress baca terakhir user untuk sebuah komik (untuk "Lanjutkan Baca").
     */
    public function latestForComic(User $user, Comic $comic): ?ReadingHistory
    {
        return $comic->readingHistories()
            ->where('user_id', $user->id)
            ->with('episode:id,title,number,comic_id')
            ->latest('updated_at')
            ->first();
    }
}

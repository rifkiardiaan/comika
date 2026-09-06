<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreEpisodeRequest;
use App\Http\Requests\UpdateEpisodeRequest;
use App\Http\Resources\EpisodeDetailResource;
use App\Http\Resources\EpisodeResource;
use App\Models\Comic;
use App\Models\Episode;
use App\Models\EpisodeUnlock;
use App\Models\Subscription;
use App\Models\ReadingHistory;
use App\Services\ActivityLogService;
use App\Services\EpisodeService;
use App\Services\GamificationService;
use App\Services\ReadingHistoryService;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class EpisodeController extends Controller
{
    public function __construct(private readonly EpisodeService $episodeService)
    {
    }

    /**
     * Daftar episode sebuah komik.
     * - Publik: hanya episode published.
     * - Creator pemilik: semua episode (termasuk draft).
     */
    public function index(Request $request, Comic $comic): JsonResponse
    {
        // Guard sanctum eksplisit: route publik, token opsional
        $user = $request->user('sanctum');
        $isOwner = $user?->id === $comic->creator_id;

        // Komik yang belum disetujui & diterbitkan admin tidak boleh diakses publik
        if (! $isOwner && (! $comic->published_at || $comic->verification_status !== Comic::VERIFICATION_APPROVED)) {
            return response()->json([
                'success' => false,
                'message' => 'Komik belum diterbitkan.',
                'errors' => (object) [],
            ], 404);
        }

        $episodes = $comic->episodes()
            ->withCount('pages')
            ->when(! $isOwner, fn ($q) => $q->where('status', Episode::STATUS_PUBLISHED))
            ->orderBy('number')
            ->get();

        // Info unlock per episode (Phase 09): is_locked untuk episode
        // premium yang belum di-unlock — berlaku juga untuk pengunjung anonim.
        $isVvip = $user !== null && Subscription::isUserVvip($user);

        if ($user) {
            $unlockedIds = EpisodeUnlock::where('user_id', $user->id)
                ->whereIn('episode_id', $episodes->pluck('id'))
                ->pluck('episode_id');

            foreach ($episodes as $episode) {
                $episode->setAttribute(
                    'is_unlocked',
                    $isOwner || ! $episode->is_premium || $isVvip || $unlockedIds->contains($episode->id)
                );

                if ($episode->is_premium && ! $episode->is_unlocked) {
                    $episode->setAttribute('is_locked', true);
                }
            }
        } else {
            foreach ($episodes as $episode) {
                if ($episode->is_premium) {
                    $episode->setAttribute('is_locked', true);
                }
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Success',
            'data' => EpisodeResource::collection($episodes),
        ]);
    }

    /**
     * Detail episode beserta halaman + navigasi prev/next.
     * - Publik: hanya episode published.
     */
    public function show(Request $request, Episode $episode): JsonResponse
    {
        // Guard sanctum eksplisit: route publik, token opsional
        $user = $request->user('sanctum');
        $isOwner = $user?->id === $episode->comic->creator_id;

        $comicIsPublic = $episode->comic->published_at !== null
            && $episode->comic->verification_status === Comic::VERIFICATION_APPROVED;

        if (! $isOwner && (! $comicIsPublic || $episode->status !== Episode::STATUS_PUBLISHED)) {
            return response()->json([
                'success' => false,
                'message' => 'Episode belum dipublikasikan.',
                'errors' => (object) [],
            ], 404);
        }

        // Gate premium (Phase 09): halaman episode premium hanya untuk
        // pemilik komik, user VVIP, atau user yang sudah unlock.
        $isVvip = $user !== null && Subscription::isUserVvip($user);
        $isUnlocked = $isOwner
            || ! $episode->is_premium
            || $isVvip
            || ($user !== null && EpisodeUnlock::where('user_id', $user->id)
                ->where('episode_id', $episode->id)
                ->exists());

        $episode->setAttribute('is_unlocked', $isUnlocked);

        if ($episode->is_premium && ! $isUnlocked) {
            $episode->setAttribute('is_locked', true);
            $episode->setRelation('pages', collect());
        } else {
            $episode->load('pages');
        }

        // Navigasi episode sebelumnya / berikutnya untuk reader
        $siblings = Episode::query()
            ->where('comic_id', $episode->comic_id)
            ->whereKeyNot($episode->id)
            ->when(! $isOwner, fn ($q) => $q->where('status', Episode::STATUS_PUBLISHED));

        $episode->setAttribute(
            'prev_episode',
            (clone $siblings)->where('number', '<', $episode->number)->orderByDesc('number')->first()
        );
        $episode->setAttribute(
            'next_episode',
            (clone $siblings)->where('number', '>', $episode->number)->orderBy('number')->first()
        );

        // Auto-detection: rekam ke riwayat baca jika user login dan episode published
        if ($user && $episode->status === Episode::STATUS_PUBLISHED) {
            $isNewRead = ! ReadingHistory::where('user_id', $user->id)
                ->where('episode_id', $episode->id)
                ->exists();

            $lastPage = 1;
            $totalPages = $episode->pages()->count();
            $progress = $totalPages > 0 ? round(($lastPage / $totalPages) * 100, 2) : 0.0;

            $historyService = app(ReadingHistoryService::class);
            $history = $historyService->recordProgress(
                $user,
                $episode,
                $lastPage,
                $progress,
                $totalPages <= 1,
            );

            // Gamification XP
            app(GamificationService::class)->trackRead(
                $user,
                $episode,
                $isNewRead,
                $history->is_completed,
            );
        }

        return response()->json([
            'success' => true,
            'message' => 'Success',
            'data' => new EpisodeDetailResource($episode),
        ]);
    }

    /**
     * Buat episode baru — hanya creator pemilik komik.
     */
    public function store(StoreEpisodeRequest $request, Comic $comic): JsonResponse
    {
        $this->authorize('create', [Episode::class, $comic]);

        // Izin upload dinonaktifkan admin → tidak bisa menambah episode baru
        if (! $request->user()->canUpload()) {
            return response()->json([
                'success' => false,
                'message' => 'Izin upload komik Anda dinonaktifkan oleh admin. Hubungi admin untuk mengaktifkannya kembali.',
            ], 403);
        }

        // Nomor episode tidak boleh duplikat dalam satu komik
        $request->validate([
            'number' => [
                'sometimes',
                'integer',
                'min:1',
                Rule::unique('episodes', 'number')
                    ->where('comic_id', $comic->id)
                    ->whereNull('deleted_at'),
            ],
        ], [
            'number.unique' => 'Nomor episode sudah digunakan pada komik ini. Gunakan nomor lain.',
        ]);

        // Episode pertama (nomor 1) wajib gratis — tidak boleh premium.
        $requestedNumber = $request->input('number');
        $isFirstEpisode = (int) $requestedNumber === 1
            || ($requestedNumber === null && ! Episode::withTrashed()->where('comic_id', $comic->id)->exists());

        if ($request->boolean('is_premium') && $isFirstEpisode) {
            throw ValidationException::withMessages([
                'is_premium' => ['Episode pertama (nomor 1) harus gratis untuk pembaca.'],
            ]);
        }

        try {
            $episode = $this->episodeService->create(
                $comic,
                $request->only(['title', 'number', 'is_premium', 'price_coin']),
            );
        } catch (QueryException $e) {
            // Nomor episode duplikat di level DB — tampilkan pesan yang ramah.
            if (str_contains($e->getMessage(), 'episodes_comic_id_number_unique')) {
                throw ValidationException::withMessages([
                    'number' => ['Nomor episode sudah digunakan pada komik ini. Gunakan nomor lain.'],
                ]);
            }

            throw $e;
        }

        return response()->json([
            'success' => true,
            'message' => 'Episode berhasil dibuat.',
            'data' => new EpisodeResource($episode),
        ], 201);
    }

    /**
     * Update episode — hanya creator pemilik.
     */
    public function update(UpdateEpisodeRequest $request, Episode $episode): JsonResponse
    {
        $this->authorize('update', $episode);

        $updated = $this->episodeService->update(
            $episode,
            $request->only(['title', 'is_premium', 'price_coin']),
        );

        return response()->json([
            'success' => true,
            'message' => 'Episode berhasil diperbarui.',
            'data' => new EpisodeResource($updated),
        ]);
    }

    /**
     * Hapus episode (soft delete) — hanya creator pemilik.
     */
    public function destroy(Episode $episode): JsonResponse
    {
        $this->authorize('delete', $episode);

        $episode->delete();

        return response()->json([
            'success' => true,
            'message' => 'Episode berhasil dihapus.',
            'data' => null,
        ]);
    }

    /**
     * Ajukan episode untuk direview admin — hanya creator pemilik komik.
     * Episode TIDAK langsung tampil publik; baru diterbitkan setelah
     * admin menyetujui lewat dashboard Laporan Komik.
     */
    public function publish(Request $request, Episode $episode): JsonResponse
    {
        $this->authorize('update', $episode);

        if ($episode->status === Episode::STATUS_PUBLISHED) {
            return response()->json([
                'success' => false,
                'message' => 'Episode sudah diterbitkan.',
            ], 422);
        }

        if ($episode->pages()->count() === 0) {
            return response()->json([
                'success' => false,
                'message' => 'Episode harus memiliki minimal 1 halaman sebelum diajukan ke admin.',
            ], 422);
        }

        // Catatan: sengaja TIDAK menulis kolom rejection_reason di sini —
        // kolom itu opsional & belum tentu ada di DB produksi. Penolakan
        // episode men-delete episode, jadi tidak ada alasan tersimpan untuk
        // dibersihkan. Status pending tetap tersimpan tanpa bergantung kolom itu.
        $episode->update([
            'status' => Episode::STATUS_PENDING,
            'published_at' => null,
        ]);

        // Riwayat aktivitas: creator mengirim episode untuk direview admin
        app(ActivityLogService::class)->log(
            $request->user(),
            \App\Models\ActivityLog::ACTION_EPISODE_SUBMIT,
            'Creator mengirim episode ' . $episode->number . ' "' . $episode->title . '" dari komik "' . $episode->comic->title . '" untuk direview admin',
            $episode,
            [],
            $request->ip()
        );

        return response()->json([
            'success' => true,
            'message' => 'Episode dikirim ke admin untuk direview. Episode akan tampil setelah disetujui admin.',
            'data' => new EpisodeResource($episode->fresh()),
        ]);
    }
}

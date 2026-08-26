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
use App\Services\EpisodeService;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

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

        if ($episode->status !== Episode::STATUS_PUBLISHED && ! $isOwner) {
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
            'number.unique' => 'Nomor episode sudah digunakan pada komik ini.',
        ]);

        $episode = $this->episodeService->create(
            $comic,
            $request->only(['title', 'number', 'is_premium', 'price_coin']),
        );

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
     * Publish episode — hanya creator pemilik.
     */
    public function publish(Episode $episode): JsonResponse
    {
        $this->authorize('publish', $episode);

        $published = $this->episodeService->publish($episode);

        // Beri tahu semua follower komik ada episode baru (blueprint 24)
        app(NotificationService::class)->notifyNewEpisode($published->load('comic'));

        return response()->json([
            'success' => true,
            'message' => 'Episode berhasil dipublikasikan.',
            'data' => new EpisodeResource($published),
        ]);
    }
}

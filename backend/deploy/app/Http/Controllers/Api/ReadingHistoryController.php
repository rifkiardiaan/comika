<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateProgressRequest;
use App\Http\Resources\ReadingHistoryResource;
use App\Models\ReadingHistory;
use App\Services\GamificationService;
use App\Services\ReadingHistoryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReadingHistoryController extends Controller
{
    public function __construct(
        private readonly ReadingHistoryService $readingHistoryService,
    ) {
    }

    /**
     * Riwayat baca user (terbaru dulu) — untuk "Lanjutkan Baca".
     */
    public function index(Request $request): JsonResponse
    {
        $history = $this->readingHistoryService->history(
            $request->user(),
            $request->integer('per_page', 12),
        );

        return response()->json([
            'success' => true,
            'message' => 'Success',
            'data' => ReadingHistoryResource::collection($history->items()),
            'meta' => [
                'current_page' => $history->currentPage(),
                'last_page' => $history->lastPage(),
                'per_page' => $history->perPage(),
                'total' => $history->total(),
            ],
        ]);
    }

    /**
     * Rekam / perbarui progress baca.
     */
    public function store(UpdateProgressRequest $request): JsonResponse
    {
        $episode = \App\Models\Episode::findOrFail($request->integer('episode_id'));

        // Hanya episode published yang bisa dibaca publik;
        // creator pemilik tetap bisa membaca draft-nya sendiri.
        if ($episode->status !== \App\Models\Episode::STATUS_PUBLISHED
            && $request->user()->id !== $episode->comic->creator_id) {
            return response()->json([
                'success' => false,
                'message' => 'Episode belum dipublikasikan.',
                'errors' => (object) [],
            ], 404);
        }

        // Deteksi "baca baru" untuk gamification XP
        $isNewRead = ! ReadingHistory::where('user_id', $request->user()->id)
            ->where('episode_id', $episode->id)
            ->exists();

        $history = $this->readingHistoryService->recordProgress(
            $request->user(),
            $episode,
            $request->integer('last_page'),
            $request->has('progress') ? (float) $request->input('progress') : null,
            $request->has('is_completed') ? (bool) $request->boolean('is_completed') : null,
        );

        // Bentuk respons konsisten dengan history index
        $history->load([
            'comic' => fn ($q) => $q->with(['creator', 'genres'])->withCount('episodes'),
            'episode' => fn ($q) => $q->withCount('pages'),
        ]);

        // Gamification: XP baca, reading streak, & deteksi "selesai baca komik"
        app(GamificationService::class)->trackRead(
            $request->user(),
            $episode,
            $isNewRead,
            $request->has('is_completed') ? (bool) $request->boolean('is_completed') : $history->is_completed,
        );

        return response()->json([
            'success' => true,
            'message' => 'Progress bacaan tersimpan.',
            'data' => new ReadingHistoryResource($history),
        ], 201);
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CreatorComicResource;
use App\Models\ActivityLog;
use App\Models\Comic;
use App\Models\Episode;
use App\Services\ActivityLogService;
use App\Services\CreatorAnalyticsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CreatorComicController extends Controller
{
    public function __construct(private readonly CreatorAnalyticsService $analyticsService)
    {
    }

    /**
     * Daftar komik milik creator (termasuk draft) + statistik.
     */
    public function index(Request $request): JsonResponse
    {
        $comics = $this->analyticsService->comics(
            $request->user(),
            $request->integer('per_page', 12),
        );

        return response()->json([
            'success' => true,
            'message' => 'Success',
            'data' => CreatorComicResource::collection($comics->items()),
            'meta' => [
                'current_page' => $comics->currentPage(),
                'last_page' => $comics->lastPage(),
                'per_page' => $comics->perPage(),
                'total' => $comics->total(),
            ],
        ]);
    }

    /**
     * Detail komik milik creator + episode + statistik.
     */
    public function show(Request $request, Comic $comic): JsonResponse
    {
        $this->authorize('update', $comic);

        $comic = $this->analyticsService->showComic($comic);

        return response()->json([
            'success' => true,
            'message' => 'Success',
            'data' => new CreatorComicResource($comic),
        ]);
    }

    /**
     * Analytics per komik milik creator.
     */
    public function analytics(Request $request, Comic $comic): JsonResponse
    {
        $this->authorize('update', $comic);

        return response()->json([
            'success' => true,
            'message' => 'Success',
            'data' => $this->analyticsService->comicAnalytics($comic),
        ]);
    }

    /**
     * Ajukan komik untuk direview admin — hanya creator pemilik.
     * Komik TIDAK langsung tampil publik; baru diterbitkan setelah
     * admin menyetujui lewat dashboard Laporan Komik.
     */
    public function submit(Request $request, Comic $comic): JsonResponse
    {
        $this->authorize('update', $comic);

        // Izin upload dinonaktifkan admin → tidak bisa mengirim review baru
        if (! $request->user()->canUpload()) {
            return response()->json([
                'success' => false,
                'message' => 'Izin upload komik Anda dinonaktifkan oleh admin. Hubungi admin untuk mengaktifkannya kembali.',
            ], 403);
        }

        if ($comic->published_at && $comic->verification_status === Comic::VERIFICATION_APPROVED) {
            return response()->json([
                'success' => false,
                'message' => 'Komik sudah diterbitkan dan tampil untuk publik.',
            ], 422);
        }

        if ($comic->verification_status === Comic::VERIFICATION_PENDING) {
            return response()->json([
                'success' => false,
                'message' => 'Komik sudah dikirim ke admin dan sedang menunggu review.',
            ], 422);
        }

        // Wajib ada minimal 1 episode yang sudah punya halaman, agar admin
        // punya materi untuk direview sebelum komik diterbitkan.
        $hasReadyEpisode = Episode::where('comic_id', $comic->id)
            ->whereHas('pages')
            ->exists();

        if (! $hasReadyEpisode) {
            return response()->json([
                'success' => false,
                'message' => 'Buat minimal 1 episode lengkap dengan halaman sebelum mengajukan review ke admin.',
            ], 422);
        }

        $comic->update([
            'verification_status' => Comic::VERIFICATION_PENDING,
            'rejection_reason' => null,
        ]);

        $comic->refresh();

        // Riwayat aktivitas: creator mengajukan komik untuk direview admin
        app(ActivityLogService::class)->log(
            $request->user(),
            ActivityLog::ACTION_COMIC_UPLOAD,
            'Creator mengirim komik "' . $comic->title . '" untuk direview admin',
            $comic,
            [],
            $request->ip()
        );

        return response()->json([
            'success' => true,
            'message' => 'Komik dikirim ke admin untuk direview. Komik akan tampil publik setelah disetujui admin.',
            'data' => new CreatorComicResource(
                $comic->load('creator:id,name,avatar_url')->load(['genres'])->loadCount([
                    'episodes',
                    'episodes as published_episodes_count' => fn ($q) => $q->where('status', Episode::STATUS_PUBLISHED),
                    'episodes as draft_episodes_count' => fn ($q) => $q->where('status', Episode::STATUS_DRAFT),
                    'episodes as pending_episodes_count' => fn ($q) => $q->where('status', Episode::STATUS_PENDING),
                    'follows',
                    'comments',
                    'bookmarks',
                ])
            ),
        ]);
    }
}

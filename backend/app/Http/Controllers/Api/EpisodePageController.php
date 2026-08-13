<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreEpisodePageRequest;
use App\Http\Resources\EpisodePageResource;
use App\Models\Episode;
use App\Models\EpisodePage;
use App\Services\EpisodeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class EpisodePageController extends Controller
{
    public function __construct(private readonly EpisodeService $episodeService)
    {
    }

    /**
     * Unggah halaman episode (banyak sekaligus) — hanya creator pemilik.
     */
    public function store(StoreEpisodePageRequest $request, Episode $episode): JsonResponse
    {
        $this->authorize('uploadPages', $episode);

        $pages = $this->episodeService->uploadPages(
            $episode,
            $request->file('pages'),
        );

        return response()->json([
            'success' => true,
            'message' => $pages->count().' halaman berhasil diunggah.',
            'data' => EpisodePageResource::collection($pages),
        ], 201);
    }

    /**
     * Hapus halaman episode — hanya creator pemilik.
     */
    public function destroy(EpisodePage $page): JsonResponse
    {
        $this->authorize('uploadPages', $page->episode);

        Storage::disk('public')->delete($page->image_url);
        $page->delete();

        return response()->json([
            'success' => true,
            'message' => 'Halaman berhasil dihapus.',
            'data' => null,
        ]);
    }
}

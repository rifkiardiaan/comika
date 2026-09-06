<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreEpisodePageRequest;
use App\Http\Resources\EpisodePageResource;
use App\Models\Episode;
use App\Models\EpisodePage;
use App\Services\EpisodeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class EpisodePageController extends Controller
{
    public function __construct(private readonly EpisodeService $episodeService)
    {
    }

    /**
     * Daftar halaman episode — hanya creator pemilik.
     */
    public function index(Request $request, Episode $episode): JsonResponse
    {
        $this->authorize('uploadPages', $episode);

        $pages = $episode->pages()
            ->orderBy('page_number')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Success',
            'data' => EpisodePageResource::collection($pages),
        ]);
    }

    /**
     * Unggah halaman episode (banyak sekaligus) — hanya creator pemilik.
     */
    public function store(StoreEpisodePageRequest $request, Episode $episode): JsonResponse
    {
        $this->authorize('uploadPages', $episode);

        // Izin upload dinonaktifkan admin → tidak bisa mengunggah halaman baru
        if (! $request->user()->canUpload()) {
            return response()->json([
                'success' => false,
                'message' => 'Izin upload komik Anda dinonaktifkan oleh admin. Hubungi admin untuk mengaktifkannya kembali.',
            ], 403);
        }

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
     * Ganti gambar halaman tertentu — hanya creator pemilik.
     */
    public function update(Request $request, EpisodePage $page): JsonResponse
    {
        $this->authorize('uploadPages', $page->episode);

        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,webp|max:5120',
        ], [
            'image.required' => 'File gambar wajib diisi.',
            'image.image' => 'File harus berupa gambar.',
            'image.mimes' => 'Format gambar harus jpeg, png, atau webp.',
            'image.max' => 'Ukuran gambar maksimal 5MB.',
        ]);

        // Hapus gambar lama
        Storage::disk('public')->delete($page->image_url);

        // Simpan gambar baru
        $page->update([
            'image_url' => $request->file('image')->store('comic-pages/'.$page->episode_id, 'public'),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Halaman berhasil diperbarui.',
            'data' => new EpisodePageResource($page->fresh()),
        ]);
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

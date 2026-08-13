<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateComicStatusRequest;
use App\Http\Resources\AdminComicResource;
use App\Models\Comic;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminComicController extends Controller
{
    /**
     * Daftar semua komik (termasuk draft) dengan pencarian & filter.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Comic::query()
            ->with('creator:id,name')
            ->withCount('episodes');

        if ($request->filled('q')) {
            $search = trim($request->q);
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('synopsis', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('visibility')) {
            $visibility = $request->visibility;
            if ($visibility === 'published') {
                $query->whereNotNull('published_at');
            } elseif ($visibility === 'draft') {
                $query->whereNull('published_at');
            }
        }

        $comics = $query->orderByDesc('created_at')
            ->paginate($request->integer('per_page', 12));

        return response()->json([
            'success' => true,
            'message' => 'Success',
            'data' => AdminComicResource::collection($comics->items()),
            'meta' => [
                'current_page' => $comics->currentPage(),
                'last_page' => $comics->lastPage(),
                'per_page' => $comics->perPage(),
                'total' => $comics->total(),
            ],
        ]);
    }

    /**
     * Ubah status komik (ongoing / completed / hiatus).
     */
    public function updateStatus(UpdateComicStatusRequest $request, Comic $comic): JsonResponse
    {
        $previous = $comic->status;
        $comic->update(['status' => $request->status]);

        // Beri tahu creator bila status komiknya diubah admin
        if ($previous !== $request->status) {
            app(NotificationService::class)->send(
                $comic->creator_id,
                NotificationService::TYPE_COMIC_UPDATE,
                [
                    'comic_id' => $comic->id,
                    'comic_title' => $comic->title,
                    'status' => $request->status,
                ]
            );
        }

        return response()->json([
            'success' => true,
            'message' => 'Status komik berhasil diperbarui.',
            'data' => new AdminComicResource(
                $comic->load('creator:id,name')->loadCount('episodes')
            ),
        ]);
    }

    /**
     * Hapus komik (soft delete) — moderasi.
     */
    public function destroy(Comic $comic): JsonResponse
    {
        $comic->delete();

        return response()->json([
            'success' => true,
            'message' => 'Komik berhasil dihapus.',
            'data' => null,
        ]);
    }
}

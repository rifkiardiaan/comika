<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreComicRequest;
use App\Http\Requests\UpdateComicRequest;
use App\Http\Resources\ComicDetailResource;
use App\Http\Resources\ComicResource;
use App\Models\Comic;
use App\Services\ComicService;
use App\Services\ReadingHistoryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ComicController extends Controller
{
    public function __construct(
        private readonly ComicService $comicService,
        private readonly ReadingHistoryService $readingHistoryService,
    ) {
    }

    /**
     * Daftar komik — publik, dengan filter & pagination.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Comic::query()
            ->withCount('episodes')
            ->with(['creator', 'genres'])
            ->whereNotNull('published_at');

        // Filter genre
        if ($request->filled('genre')) {
            $query->whereHas('genres', fn ($q) => $q->where('slug', $request->genre));
        }

        // Pencarian
        if ($request->filled('q')) {
            $search = trim($request->q);
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('synopsis', 'like', "%{$search}%");
            });
        }

        // Sort
        $sort = $request->get('sort', 'popular');
        $query->when($sort === 'rating', fn ($q) => $q->orderByDesc('rating_avg'))
            ->when($sort === 'newest', fn ($q) => $q->orderByDesc('created_at'))
            ->when($sort === 'popular', fn ($q) => $q->orderByDesc('view_count'));

        $comics = $query->paginate($request->integer('per_page', 12));

        return response()->json([
            'success' => true,
            'message' => 'Success',
            'data' => ComicResource::collection($comics->items()),
            'meta' => [
                'current_page' => $comics->currentPage(),
                'last_page' => $comics->lastPage(),
                'per_page' => $comics->perPage(),
                'total' => $comics->total(),
            ],
        ]);
    }

    /**
     * Detail komik beserta episode — publik.
     * Jika user login, disertakan progress baca terakhir (Lanjutkan Baca).
     */
    public function show(Request $request, Comic $comic): JsonResponse
    {
        $comic->load([
            'creator',
            'genres',
            'episodes' => fn ($q) => $q
                ->where('status', 'published')
                ->orderBy('number')
                ->withCount('pages')
                ->with(['pages' => fn ($p) => $p->orderBy('page_number')->limit(1)]),
        ])->loadCount('episodes');

        // Guard sanctum eksplisit: route ini publik, token opsional
        if ($user = $request->user('sanctum')) {
            $comic->setAttribute(
                'user_progress',
                $this->readingHistoryService->latestForComic($user, $comic)
            );

            $comic->setAttribute('user_actions', [
                'is_bookmarked' => $comic->bookmarks()->where('user_id', $user->id)->exists(),
                'is_followed' => $comic->follows()->where('user_id', $user->id)->exists(),
                'is_liked' => $comic->likes()->where('user_id', $user->id)->exists(),
                'user_rating' => $comic->ratings()->where('user_id', $user->id)->value('score'),
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Success',
            'data' => new ComicDetailResource($comic),
        ]);
    }

    /**
     * Buat komik — hanya creator.
     */
    public function store(StoreComicRequest $request): JsonResponse
    {
        $comic = $this->comicService->create(
            $request->user()->id,
            $request->only(['title', 'synopsis', 'status', 'age_rating']),
            $request->input('genres', []),
            $request->file('cover'),
        );

        $comic->load(['creator', 'genres'])->loadCount('episodes');

        return response()->json([
            'success' => true,
            'message' => 'Komik berhasil dibuat.',
            'data' => new ComicResource($comic),
        ], 201);
    }

    /**
     * Update komik — hanya pemilik.
     */
    public function update(UpdateComicRequest $request, Comic $comic): JsonResponse
    {
        $this->authorize('update', $comic);

        $updated = $this->comicService->update(
            $comic,
            $request->only(['title', 'synopsis', 'status', 'age_rating']),
            $request->input('genres', $comic->genres()->pluck('genres.id')->toArray()),
            $request->file('cover'),
        );

        $updated->load(['creator', 'genres'])->loadCount('episodes');

        return response()->json([
            'success' => true,
            'message' => 'Komik berhasil diperbarui.',
            'data' => new ComicResource($updated),
        ]);
    }

    /**
     * Hapus komik (soft delete) — hanya pemilik.
     */
    public function destroy(Comic $comic): JsonResponse
    {
        $this->authorize('delete', $comic);

        $comic->delete();

        return response()->json([
            'success' => true,
            'message' => 'Komik berhasil dihapus.',
            'data' => null,
        ]);
    }
}

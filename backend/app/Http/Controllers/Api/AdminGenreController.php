<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreGenreRequest;
use App\Http\Requests\UpdateGenreRequest;
use App\Http\Resources\GenreResource;
use App\Models\Genre;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;

class AdminGenreController extends Controller
{
    /**
     * Buat genre baru — slug otomatis dari nama bila tidak disediakan.
     */
    public function store(StoreGenreRequest $request): JsonResponse
    {
        $genre = Genre::create([
            'name' => $request->name,
            'slug' => $request->input('slug') ?? Str::slug($request->name),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Genre berhasil dibuat.',
            'data' => new GenreResource($genre),
        ], 201);
    }

    /**
     * Update genre.
     */
    public function update(UpdateGenreRequest $request, Genre $genre): JsonResponse
    {
        $genre->update([
            'name' => $request->input('name', $genre->name),
            'slug' => $request->input('slug') ?? Str::slug($request->input('name', $genre->name)),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Genre berhasil diperbarui.',
            'data' => new GenreResource($genre),
        ]);
    }

    /**
     * Hapus genre.
     */
    public function destroy(Genre $genre): JsonResponse
    {
        $genre->delete();

        return response()->json([
            'success' => true,
            'message' => 'Genre berhasil dihapus.',
            'data' => null,
        ]);
    }
}

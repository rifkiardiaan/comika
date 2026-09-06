<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\GenreResource;
use App\Models\Genre;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;

class GenreController extends Controller
{
    /**
     * Daftar semua genre — publik, cached 10 menit (genre jarang berubah).
     */
    public function index(): JsonResponse
    {
        $genres = Cache::remember('genres_all', 600, fn () => Genre::orderBy('name')->get());

        return response()->json([
            'success' => true,
            'message' => 'Success',
            'data' => GenreResource::collection($genres),
        ]);
    }
}

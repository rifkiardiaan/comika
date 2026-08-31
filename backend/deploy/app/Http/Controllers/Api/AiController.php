<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\AiGenerateRequest;
use App\Services\AiService;
use Illuminate\Http\JsonResponse;

/**
 * AI Assistant (blueprint 27 — optional service).
 *
 * Alat bantu menulis untuk creator: judul, sinopsis, genre & tag,
 * karakter, dan outline episode. Semua endpoint butuh role creator.
 */
class AiController extends Controller
{
    public function __construct(private readonly AiService $aiService)
    {
    }

    /**
     * Status konfigurasi AI (untuk UI: aktif / mode bawaan).
     */
    public function status(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'Success',
            'data' => [
                'configured' => $this->aiService->isConfigured(),
            ],
        ]);
    }

    /**
     * Generate ide judul komik.
     */
    public function titles(AiGenerateRequest $request): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'Success',
            'data' => $this->aiService->generateTitles($request->validated()),
        ]);
    }

    /**
     * Generate sinopsis komik.
     */
    public function synopsis(AiGenerateRequest $request): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'Success',
            'data' => $this->aiService->generateSynopsis($request->validated()),
        ]);
    }

    /**
     * Rekomendasi genre & tag.
     */
    public function genresTags(AiGenerateRequest $request): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'Success',
            'data' => $this->aiService->suggestGenresTags($request->validated()),
        ]);
    }

    /**
     * Generate konsep karakter.
     */
    public function character(AiGenerateRequest $request): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'Success',
            'data' => $this->aiService->generateCharacter($request->validated()),
        ]);
    }

    /**
     * Generate outline episode.
     */
    public function outline(AiGenerateRequest $request): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'Success',
            'data' => $this->aiService->generateOutline($request->validated()),
        ]);
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\GamificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GamificationController extends Controller
{
    public function __construct(private readonly GamificationService $gamificationService)
    {
    }

    /**
     * Profil gamification user: level, XP, streak, statistik & achievement.
     */
    public function profile(Request $request): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'Success',
            'data' => $this->gamificationService->profile($request->user()),
        ]);
    }
}

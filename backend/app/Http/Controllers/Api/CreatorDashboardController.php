<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\CreatorAnalyticsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CreatorDashboardController extends Controller
{
    public function __construct(private readonly CreatorAnalyticsService $analyticsService)
    {
    }

    /**
     * Ringkasan statistik creator dashboard.
     */
    public function index(Request $request): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'Success',
            'data' => $this->analyticsService->dashboard($request->user()),
        ]);
    }
}
